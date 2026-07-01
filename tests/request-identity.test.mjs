import test from "node:test";
import assert from "node:assert/strict";
import {
  CLOUDFLARE_ACCESS_JWT_HEADER,
  currentUserEmailFromRequest,
  DEV_USER_EMAIL_HEADER,
  OAI_AUTHENTICATED_USER_EMAIL_HEADER,
  resolveCurrentUserEmailFromRequest,
} from "../src/lib/request-identity.mjs";

test("request identity reads OpenAI Sites authenticated email", () => {
  const request = new Request("https://shared-lists.invalid/api/session", {
    headers: {
      [OAI_AUTHENTICATED_USER_EMAIL_HEADER]: "owner@local.test",
    },
  });

  assert.equal(currentUserEmailFromRequest(request), "owner@local.test");
});

test("request identity supports local development users", () => {
  const request = new Request("http://localhost:8001/api/session", {
    headers: {
      [DEV_USER_EMAIL_HEADER]: "member@local.test",
    },
  });

  assert.equal(currentUserEmailFromRequest(request), "member@local.test");
});

test("request identity returns the local default only on local hosts", () => {
  const localRequest = new Request("http://127.0.0.1:8001/api/session");
  const productionRequest = new Request("https://shared-lists.invalid/api/session");

  assert.equal(currentUserEmailFromRequest(localRequest), "local-user@local.test");
  assert.equal(currentUserEmailFromRequest(productionRequest), "");
});

test("request identity verifies Cloudflare Access JWTs when configured", async () => {
  const teamDomain = "https://team.cloudflareaccess.com";
  const policyAud = "policy-audience-id";
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"],
  );
  const jwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
  jwk.kid = "test-key";
  jwk.alg = "RS256";
  jwk.use = "sig";

  const token = await signJwt(
    { alg: "RS256", typ: "JWT", kid: "test-key" },
    {
      iss: teamDomain,
      aud: [policyAud],
      email: "Owner@Local.Test",
      exp: 2_000_000_000,
    },
    keyPair.privateKey,
  );
  const request = new Request("https://shared-lists.invalid/api/session", {
    headers: { [CLOUDFLARE_ACCESS_JWT_HEADER]: token },
  });

  const email = await resolveCurrentUserEmailFromRequest(request, {
    authProvider: "cloudflare-access",
    cloudflareAccess: {
      teamDomain,
      policyAud,
      fetcher: async () => Response.json({ keys: [jwk] }),
      now: () => 1_800_000_000,
    },
  });

  assert.equal(email, "owner@local.test");
});

test("Cloudflare mode rejects a Sites email header without an Access JWT", async () => {
  const request = new Request("https://shared-lists.invalid/api/session", {
    headers: {
      [OAI_AUTHENTICATED_USER_EMAIL_HEADER]: "spoofed@local.test",
    },
  });

  const email = await resolveCurrentUserEmailFromRequest(request, {
    authProvider: "cloudflare-access",
    cloudflareAccess: {
      teamDomain: "https://team.cloudflareaccess.com",
      policyAud: "policy-audience-id",
      fetcher: async () => Response.json({ keys: [] }),
    },
  });

  assert.equal(email, "");
});

test("OpenAI Sites mode rejects Cloudflare-only credentials", async () => {
  const request = new Request("https://shared-lists.invalid/api/session", {
    headers: {
      [CLOUDFLARE_ACCESS_JWT_HEADER]: "header.payload.signature",
    },
  });

  const email = await resolveCurrentUserEmailFromRequest(request, {
    authProvider: "openai-sites",
    cloudflareAccess: {
      teamDomain: "https://team.cloudflareaccess.com",
      policyAud: "policy-audience-id",
      fetcher: async () => Response.json({ keys: [] }),
    },
  });

  assert.equal(email, "");
});

async function signJwt(header, payload, privateKey) {
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const data = new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`);
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", privateKey, data);
  return `${encodedHeader}.${encodedPayload}.${base64UrlEncode(new Uint8Array(signature))}`;
}

function base64UrlEncode(value) {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
