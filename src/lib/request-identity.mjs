export const OAI_AUTHENTICATED_USER_EMAIL_HEADER = "oai-authenticated-user-email";
export const DEV_USER_EMAIL_HEADER = "x-dev-user-email";
export const CLOUDFLARE_ACCESS_JWT_HEADER = "cf-access-jwt-assertion";
export const CLOUDFLARE_ACCESS_AUTH_COOKIE = "CF_Authorization";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
const DEFAULT_LOCAL_USER_EMAIL = "local-user@local.test";
const AUTH_PROVIDERS = new Set(["openai-sites", "cloudflare-access"]);

export class AuthProviderConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = "AuthProviderConfigurationError";
  }
}

export function currentUserEmailFromRequest(request, { defaultLocalUserEmail = DEFAULT_LOCAL_USER_EMAIL } = {}) {
  const authenticated = openAiSitesEmailFromRequest(request);
  if (authenticated) return authenticated;

  return localDevEmailFromRequest(request, { defaultLocalUserEmail });
}

function openAiSitesEmailFromRequest(request) {
  return normalizeEmailHeader(request.headers.get(OAI_AUTHENTICATED_USER_EMAIL_HEADER));
}

function localDevEmailFromRequest(request, { defaultLocalUserEmail = DEFAULT_LOCAL_USER_EMAIL } = {}) {
  const url = new URL(request.url);
  if (LOCAL_HOSTS.has(url.hostname)) {
    return normalizeEmailHeader(request.headers.get(DEV_USER_EMAIL_HEADER)) || normalizeEmailHeader(defaultLocalUserEmail);
  }

  return "";
}

export async function resolveCurrentUserEmailFromRequest(
  request,
  {
    authProvider,
    defaultLocalUserEmail = DEFAULT_LOCAL_USER_EMAIL,
    cloudflareAccess = {},
  } = {},
) {
  const localDevEmail = localDevEmailFromRequest(request, { defaultLocalUserEmail });
  if (localDevEmail) return localDevEmail;

  const provider = normalizeAuthProvider(authProvider);
  if (provider === "cloudflare-access") {
    return cloudflareAccessEmailFromRequest(request, cloudflareAccess);
  }

  return openAiSitesEmailFromRequest(request);
}

export async function cloudflareAccessEmailFromRequest(
  request,
  {
    teamDomain = "",
    policyAud = "",
    fetcher = globalThis.fetch,
    now = () => Math.floor(Date.now() / 1000),
  } = {},
) {
  const token = cloudflareAccessJwtFromRequest(request);
  const normalizedTeamDomain = normalizeCloudflareTeamDomain(teamDomain);
  const expectedAud = String(policyAud || "").trim();
  if (!token || !normalizedTeamDomain || !expectedAud || typeof fetcher !== "function") return "";

  const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");
  if (!encodedHeader || !encodedPayload || !encodedSignature) return "";

  const header = parseBase64UrlJson(encodedHeader);
  const payload = parseBase64UrlJson(encodedPayload);
  if (!header || !payload || header.alg !== "RS256" || !header.kid) return "";
  if (!cloudflareAccessPayloadLooksValid(payload, normalizedTeamDomain, expectedAud, now())) return "";

  const response = await fetcher(`${normalizedTeamDomain}/cdn-cgi/access/certs`);
  if (!response?.ok) return "";
  const jwks = await response.json();
  const jwk = Array.isArray(jwks?.keys) ? jwks.keys.find((key) => key.kid === header.kid) : null;
  if (!jwk || !globalThis.crypto?.subtle) return "";

  const key = await globalThis.crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const data = new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`);
  const signature = base64UrlToBytes(encodedSignature);
  const verified = await globalThis.crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, signature, data);
  return verified ? String(payload.email || payload.common_name || "").trim().toLowerCase() : "";
}

export function normalizeAuthProvider(value) {
  const provider = String(value || "").trim().toLowerCase();
  if (AUTH_PROVIDERS.has(provider)) return provider;
  throw new AuthProviderConfigurationError(
    "SHARED_LISTS_AUTH_PROVIDER must be set to openai-sites or cloudflare-access",
  );
}

function normalizeEmailHeader(value) {
  return String(value || "").trim().toLowerCase();
}

function cloudflareAccessJwtFromRequest(request) {
  const headerToken = request.headers.get(CLOUDFLARE_ACCESS_JWT_HEADER);
  if (headerToken) return headerToken.trim();
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|;\s*)CF_Authorization=([^;]+)/);
  return match ? decodeURIComponent(match[1]).trim() : "";
}

function normalizeCloudflareTeamDomain(value) {
  const text = String(value || "").trim().replace(/\/+$/, "");
  if (!text) return "";
  return text.startsWith("https://") ? text : `https://${text}`;
}

function cloudflareAccessPayloadLooksValid(payload, teamDomain, expectedAud, nowSeconds) {
  if (!payload || typeof payload !== "object") return false;
  const issuer = String(payload.iss || "").replace(/\/+$/, "");
  if (issuer !== teamDomain) return false;
  const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!aud.includes(expectedAud)) return false;
  if (Number(payload.exp || 0) <= nowSeconds) return false;
  if (payload.nbf && Number(payload.nbf) > nowSeconds) return false;
  const email = String(payload.email || payload.common_name || "").trim();
  return Boolean(email && email.includes("@"));
}

function parseBase64UrlJson(value) {
  try {
    return JSON.parse(new TextDecoder().decode(base64UrlToBytes(value)));
  } catch {
    return null;
  }
}

function base64UrlToBytes(value) {
  const normalized = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}
