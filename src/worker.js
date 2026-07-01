import { routeApiRequest } from "./lib/api-router.mjs";
import { D1Store } from "./lib/d1-store.mjs";
import { googleContactsConfig } from "./lib/google-contacts.mjs";
import { resolveCurrentUserEmailFromRequest } from "./lib/request-identity.mjs";

export default {
  async fetch(request, env, context) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      const store = new D1Store(env.DB, {
        runtimeSchemaBootstrap: env.RUNTIME_SCHEMA_BOOTSTRAP === "true",
      });
      const currentUserEmail = await resolveCurrentUserEmailFromRequest(request, identityOptions(env));
      return routeApiRequest(request, {
        store,
        currentUserEmail,
        accessAuditEnabled: env.ENABLE_ACCESS_AUDIT === "true",
        adminEmails: adminEmails(env.ACCESS_AUDIT_ADMINS),
        firstOwnerEmails: adminEmails(env.FIRST_OWNER_EMAILS),
        firstOwnerSetupEnabled: env.ENABLE_FIRST_OWNER_SETUP !== "false",
        peopleImportEnabled: env.ENABLE_PEOPLE_IMPORT === "true",
        quickActionIntegrationEnabled: env.QUICK_ACTION_INTEGRATION_ENABLED === "true",
        quickActionIntegrationOrigins: env.QUICK_ACTION_INTEGRATION_ORIGINS,
        privateContactsConfig: {
          google: googleContactsConfig(env),
        },
        logger: logApiEvent,
        defer: backgroundDefer(context),
      });
    }

    if (url.pathname === "/admin/access-audit") {
      if (env.ENABLE_ACCESS_AUDIT !== "true") return new Response("Not found", { status: 404 });
      const store = new D1Store(env.DB, {
        runtimeSchemaBootstrap: env.RUNTIME_SCHEMA_BOOTSTRAP === "true",
      });
      const currentUserEmail = await resolveCurrentUserEmailFromRequest(request, identityOptions(env));
      const apiUrl = new URL(request.url);
      apiUrl.pathname = "/api/admin/access-audit";
      const apiRequest = new Request(apiUrl.toString(), {
        method: "GET",
        headers: request.headers,
      });
      const response = await routeApiRequest(apiRequest, {
        store,
        currentUserEmail,
        accessAuditEnabled: true,
        adminEmails: adminEmails(env.ACCESS_AUDIT_ADMINS),
        firstOwnerEmails: adminEmails(env.FIRST_OWNER_EMAILS),
        firstOwnerSetupEnabled: env.ENABLE_FIRST_OWNER_SETUP !== "false",
        peopleImportEnabled: env.ENABLE_PEOPLE_IMPORT === "true",
        quickActionIntegrationEnabled: env.QUICK_ACTION_INTEGRATION_ENABLED === "true",
        quickActionIntegrationOrigins: env.QUICK_ACTION_INTEGRATION_ORIGINS,
        privateContactsConfig: {
          google: googleContactsConfig(env),
        },
        logger: logApiEvent,
        defer: backgroundDefer(context),
      });
      const body = await response.text();
      return new Response(renderDiagnosticsPage(body), {
        status: response.status,
        headers: {
          "cache-control": "no-store",
          "content-type": "text/html; charset=utf-8",
        },
      });
    }

    if (url.pathname === "/people-import.html") {
      if (env.ENABLE_PEOPLE_IMPORT !== "true") return new Response("Not found", { status: 404 });
      const userEmail = (await resolveCurrentUserEmailFromRequest(request, identityOptions(env))).trim().toLowerCase();
      if (!userEmail || !adminEmails(env.ACCESS_AUDIT_ADMINS).has(userEmail)) {
        return new Response("Forbidden", { status: 403 });
      }
      if (!env.ASSETS) return new Response("People import unavailable", { status: 503 });
      return withStaticResponseHeaders(request, await env.ASSETS.fetch(request));
    }

    if (env.ASSETS) {
      return withStaticResponseHeaders(request, await env.ASSETS.fetch(request));
    }

    return new Response("Shared Lists", {
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  },
};

function backgroundDefer(context) {
  if (typeof context?.waitUntil !== "function") return null;
  return (promise) => context.waitUntil(promise);
}

function adminEmails(value) {
  const emails = String(value || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  return new Set(emails);
}

function identityOptions(env) {
  return {
    authProvider: env.SHARED_LISTS_AUTH_PROVIDER || "openai-sites",
    defaultLocalUserEmail: env.DEV_DEFAULT_USER_EMAIL || "local-user@local.test",
    cloudflareAccess: {
      teamDomain: env.CLOUDFLARE_ACCESS_TEAM_DOMAIN,
      policyAud: env.CLOUDFLARE_ACCESS_AUD,
    },
  };
}

function logApiEvent(entry) {
  console.log(JSON.stringify({ source: "shared_lists_api", ...entry }));
}

async function withStaticResponseHeaders(request, response) {
  const url = new URL(request.url);
  const headers = new Headers(response.headers);
  const contentType = headers.get("content-type") || "";
  const shell = url.pathname === "/shell.html";
  const html = url.pathname === "/" || url.pathname === "/index.html" || contentType.includes("text/html");

  if (url.pathname === "/people-import.html") {
    headers.set("cache-control", "no-store");
  } else if (shell) {
    headers.set("cache-control", "public, max-age=86400, stale-while-revalidate=604800");
  } else if (html) {
    headers.set("cache-control", "public, max-age=60, stale-while-revalidate=86400");
  } else if (url.pathname === "/app.js" || url.pathname === "/styles.css") {
    headers.set(
      "cache-control",
      url.searchParams.has("v") ? "public, max-age=31536000, immutable" : "public, max-age=60, stale-while-revalidate=86400",
    );
  } else if (url.pathname.startsWith("/icons/") || url.pathname === "/apple-touch-icon.png") {
    headers.set("cache-control", "public, max-age=86400, stale-while-revalidate=604800");
  } else if (url.pathname === "/manifest.webmanifest") {
    headers.set("cache-control", "public, max-age=300, stale-while-revalidate=3600");
  } else if (url.pathname === "/service-worker.js") {
    headers.set("cache-control", "no-cache");
  } else if (url.pathname === "/offline.html") {
    headers.set("cache-control", "public, max-age=86400, stale-while-revalidate=604800");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function renderDiagnosticsPage(body) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Shared Lists Access Audit</title>
    <style>
      body { color: #111827; font: 14px/1.45 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 24px; }
      pre { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; overflow: auto; padding: 16px; white-space: pre-wrap; }
    </style>
  </head>
  <body>
    <h1>Shared Lists Access Audit</h1>
    <pre>${escapeHtml(body)}</pre>
  </body>
</html>`;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
