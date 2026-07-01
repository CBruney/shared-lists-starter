import { AppError, normalizeEmail } from "./shared-lists-core.mjs";

export const GOOGLE_CONTACTS_PROVIDER = "google";
const CONTACTS_SCOPE = "https://www.googleapis.com/auth/contacts.readonly";
const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const PEOPLE_CONNECTIONS_URL = "https://people.googleapis.com/v1/people/me/connections";

export function googleContactsConfig(env = {}) {
  const enabled = env.GOOGLE_CONTACTS_ENABLED === true || env.GOOGLE_CONTACTS_ENABLED === "true";
  return {
    enabled,
    clientId: String(env.GOOGLE_CONTACTS_CLIENT_ID || "").trim(),
    clientSecret: String(env.GOOGLE_CONTACTS_CLIENT_SECRET || "").trim(),
    tokenSecret: String(env.GOOGLE_CONTACTS_TOKEN_SECRET || "").trim(),
    maxContacts: Math.min(Math.max(Number(env.GOOGLE_CONTACTS_MAX_CONTACTS || 2000), 1), 2000),
  };
}

export function googleContactsAvailable(config) {
  return Boolean(config?.enabled && config.clientId && config.clientSecret && config.tokenSecret);
}

export async function googleContactsStatus(store, userEmail, config) {
  const source = typeof store.getContactSource === "function"
    ? await store.getContactSource(userEmail, GOOGLE_CONTACTS_PROVIDER)
    : { provider: GOOGLE_CONTACTS_PROVIDER, connected: false };
  return {
    available: googleContactsAvailable(config),
    optional: true,
    source,
  };
}

export async function googleContactsAuthorizationUrl(request, store, userEmail, config, { redirectTo = "/" } = {}) {
  assertGoogleContactsAvailable(config);
  if (typeof store.createContactOAuthState !== "function") throw new AppError(501, "Google Contacts are unavailable");
  const redirectUri = googleContactsRedirectUri(request);
  const state = randomToken(24);
  const codeVerifier = randomToken(48);
  const codeChallenge = await sha256Base64Url(codeVerifier);
  await store.createContactOAuthState(userEmail, {
    state,
    provider: GOOGLE_CONTACTS_PROVIDER,
    code_verifier: codeVerifier,
    redirect_to: safeRedirectPath(redirectTo),
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  });
  const url = new URL(AUTH_URL);
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", CONTACTS_SCOPE);
  url.searchParams.set("state", state);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("include_granted_scopes", "true");
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  return { authorization_url: url.toString() };
}

export async function handleGoogleContactsCallback(request, store, userEmail, config) {
  assertGoogleContactsAvailable(config);
  const url = new URL(request.url);
  const stateValue = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  if (error) throw new AppError(400, `Google Contacts connection was not completed: ${error}`);
  if (!stateValue || !code) throw new AppError(400, "Google Contacts connection is missing authorization details");
  const state = await store.consumeContactOAuthState(userEmail, stateValue);
  if (!state) throw new AppError(400, "Google Contacts connection expired. Please try again.");
  const token = await exchangeAuthorizationCode({
    code,
    codeVerifier: state.code_verifier,
    redirectUri: googleContactsRedirectUri(request),
    config,
  });
  const existing = typeof store.getContactSourceSecret === "function"
    ? await store.getContactSourceSecret(userEmail, GOOGLE_CONTACTS_PROVIDER)
    : null;
  const refreshToken = token.refresh_token || (existing?.encrypted_refresh_token
    ? await decryptSecret(existing.encrypted_refresh_token, config.tokenSecret)
    : "");
  if (!refreshToken) throw new AppError(400, "Google did not return a refresh token. Disconnect and connect Google Contacts again.");
  await store.upsertContactSource(userEmail, GOOGLE_CONTACTS_PROVIDER, {
    encrypted_refresh_token: await encryptSecret(refreshToken, config.tokenSecret),
    sync_status: "syncing",
    error_message: "",
  });
  const sync = await syncGoogleContacts(store, userEmail, config, { accessToken: token.access_token });
  return {
    redirect_to: addQuery(state.redirect_to || "/", "contacts", "connected"),
    sync,
  };
}

export async function syncGoogleContacts(store, userEmail, config, { accessToken = "" } = {}) {
  assertGoogleContactsAvailable(config);
  if (typeof store.replacePrivateContacts !== "function") throw new AppError(501, "Google Contacts are unavailable");
  const source = typeof store.getContactSourceSecret === "function"
    ? await store.getContactSourceSecret(userEmail, GOOGLE_CONTACTS_PROVIDER)
    : null;
  if (!accessToken) {
    if (!source?.encrypted_refresh_token) throw new AppError(409, "Connect Google Contacts first");
    accessToken = (await refreshAccessToken({
      refreshToken: await decryptSecret(source.encrypted_refresh_token, config.tokenSecret),
      config,
    })).access_token;
  }
  try {
    const { contacts, syncToken } = await fetchGoogleContacts(accessToken, { maxContacts: config.maxContacts });
    return store.replacePrivateContacts(userEmail, GOOGLE_CONTACTS_PROVIDER, contacts, {
      syncedAt: new Date().toISOString(),
      syncToken,
      accountEmail: source?.account_email || "",
    });
  } catch (error) {
    if (typeof store.upsertContactSource === "function") {
      await store.upsertContactSource(userEmail, GOOGLE_CONTACTS_PROVIDER, {
        sync_status: "error",
        error_message: publicErrorMessage(error),
      });
    }
    throw error;
  }
}

export async function disconnectGoogleContacts(store, userEmail) {
  if (typeof store.disconnectContactSource !== "function") throw new AppError(501, "Google Contacts are unavailable");
  return store.disconnectContactSource(userEmail, GOOGLE_CONTACTS_PROVIDER);
}

function assertGoogleContactsAvailable(config) {
  if (!googleContactsAvailable(config)) throw new AppError(404, "Google Contacts are not configured");
}

async function exchangeAuthorizationCode({ code, codeVerifier, redirectUri, config }) {
  const body = new URLSearchParams({
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
    code_verifier: codeVerifier,
  });
  return googleTokenRequest(body);
}

async function refreshAccessToken({ refreshToken, config }) {
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });
  return googleTokenRequest(body);
}

async function googleTokenRequest(body) {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new AppError(502, data.error_description || data.error || "Google authorization failed");
  }
  return data;
}

async function fetchGoogleContacts(accessToken, { maxContacts }) {
  const contacts = [];
  let pageToken = "";
  let syncToken = "";
  do {
    const url = new URL(PEOPLE_CONNECTIONS_URL);
    url.searchParams.set("pageSize", String(Math.min(1000, Math.max(1, maxContacts - contacts.length))));
    url.searchParams.set("personFields", "names,emailAddresses,metadata");
    url.searchParams.set("sortOrder", "FIRST_NAME_ASCENDING");
    url.searchParams.set("requestSyncToken", "true");
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    const response = await fetch(url.toString(), {
      headers: { authorization: `Bearer ${accessToken}` },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new AppError(502, data.error?.message || "Google Contacts sync failed");
    contacts.push(...contactsFromPeople(data.connections || []));
    pageToken = data.nextPageToken || "";
    syncToken = data.nextSyncToken || syncToken;
  } while (pageToken && contacts.length < maxContacts);
  return { contacts: contacts.slice(0, maxContacts), syncToken };
}

function contactsFromPeople(people) {
  const contacts = [];
  const seen = new Set();
  for (const person of people) {
    if (person.metadata?.deleted) continue;
    const name = primaryValue(person.names)?.displayName || "";
    const resourceName = person.resourceName || "";
    for (const emailEntry of person.emailAddresses || []) {
      const email = normalizeEmail(emailEntry.value);
      if (!email || seen.has(email)) continue;
      seen.add(email);
      contacts.push({
        email,
        display_name: name || emailEntry.displayName || email.split("@")[0],
        provider_contact_id: `${resourceName || "contact"}:${email}`,
        search_terms: [name, emailEntry.displayName, emailEntry.formattedType].filter(Boolean),
      });
    }
  }
  return contacts;
}

function primaryValue(values = []) {
  return values.find((value) => value.metadata?.primary) || values[0] || null;
}

async function encryptSecret(value, secret) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await encryptionKey(secret);
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, utf8(value));
  return JSON.stringify({
    v: 1,
    iv: base64Url(iv),
    data: base64Url(new Uint8Array(ciphertext)),
  });
}

async function decryptSecret(payload, secret) {
  const parsed = JSON.parse(payload || "{}");
  if (parsed.v !== 1 || !parsed.iv || !parsed.data) throw new AppError(500, "Stored Google Contacts token is invalid");
  const key = await encryptionKey(secret);
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64Url(parsed.iv) },
    key,
    fromBase64Url(parsed.data),
  );
  return text(new Uint8Array(plaintext));
}

async function encryptionKey(secret) {
  const digest = await crypto.subtle.digest("SHA-256", utf8(secret));
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"]);
}

async function sha256Base64Url(value) {
  const digest = await crypto.subtle.digest("SHA-256", utf8(value));
  return base64Url(new Uint8Array(digest));
}

function googleContactsRedirectUri(request) {
  const url = new URL(request.url);
  url.pathname = "/api/contacts/google/callback";
  url.search = "";
  return url.toString();
}

function safeRedirectPath(value) {
  const path = String(value || "/");
  if (!path.startsWith("/") || path.startsWith("//")) return "/";
  return path;
}

function addQuery(path, key, value) {
  const url = new URL(path, "https://shared-lists.local");
  url.searchParams.set(key, value);
  return `${url.pathname}${url.search}${url.hash}`;
}

function randomToken(bytes) {
  const data = crypto.getRandomValues(new Uint8Array(bytes));
  return base64Url(data);
}

function utf8(value) {
  return new TextEncoder().encode(String(value || ""));
}

function text(value) {
  return new TextDecoder().decode(value);
}

function base64Url(bytes) {
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value) {
  const padded = String(value || "").replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
}

function publicErrorMessage(error) {
  if (error instanceof AppError) return error.message;
  return "Google Contacts sync failed";
}
