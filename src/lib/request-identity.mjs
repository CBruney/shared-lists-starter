export const OAI_AUTHENTICATED_USER_EMAIL_HEADER = "oai-authenticated-user-email";
export const DEV_USER_EMAIL_HEADER = "x-dev-user-email";
export const CLOUDFLARE_ACCESS_JWT_HEADER = "cf-access-jwt-assertion";
export const CLOUDFLARE_ACCESS_AUTH_COOKIE = "CF_Authorization";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
const DEFAULT_LOCAL_USER_EMAIL = "local-user@local.test";
const DEFAULT_AUTH_PROVIDER = "openai-sites";

export function currentUserEmailFromRequest(request, { defaultLocalUserEmail = DEFAULT_LOCAL_USER_EMAIL } = {}) {
  const authenticated = request.headers.get(OAI_AUTHENTICATED_USER_EMAIL_HEADER);
  if (authenticated) return authenticated;

  const url = new URL(request.url);
  if (LOCAL_HOSTS.has(url.hostname)) {
    return request.headers.get(DEV_USER_EMAIL_HEADER) || defaultLocalUserEmail;
  }

  return "";
}

export async function resolveCurrentUserEmailFromRequest(
  request,
  {
    authProvider = DEFAULT_AUTH_PROVIDER,
    defaultLocalUserEmail = DEFAULT_LOCAL_USER_EMAIL,
    cloudflareAccess = {},
  } = {},
) {
  const localOrSitesEmail = currentUserEmailFromRequest(request, { defaultLocalUserEmail });
  if (localOrSitesEmail) return localOrSitesEmail;

  if (normalizeAuthProvider(authProvider) !== "cloudflare-access") return "";
  return cloudflareAccessEmailFromRequest(request, cloudflareAccess);
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

function normalizeAuthProvider(value) {
  const provider = String(value || DEFAULT_AUTH_PROVIDER).trim().toLowerCase();
  return provider === "cloudflare-access" ? provider : DEFAULT_AUTH_PROVIDER;
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
