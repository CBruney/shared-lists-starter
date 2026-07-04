import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { MemoryStore } from "../src/lib/shared-lists-core.mjs";
import { routeApiRequest } from "../src/lib/api-router.mjs";
import { googleContactsConfig } from "../src/lib/google-contacts.mjs";
import { applyDocumentMetadata, injectSharedListsConfig, renderManifest } from "./render-client-config.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const clientRoot = join(root, "src");
await loadDotEnv(join(root, ".env"));
const store = new MemoryStore();
const defaultPort = Number(process.env.PORT || 8001);
const host = process.env.HOST || "127.0.0.1";
const defaultDevUserEmail = process.env.DEV_DEFAULT_USER_EMAIL || "local-user@local.test";
const devConfig = await readSharedListsConfig();

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    if (url.pathname.startsWith("/api/")) {
      const body = await readBody(req);
      const request = new Request(url, {
        method: req.method,
        headers: req.headers,
        body: req.method === "GET" || req.method === "HEAD" ? undefined : body,
      });
      const response = await routeApiRequest(request, {
        store,
        currentUserEmail: req.headers["x-dev-user-email"] || defaultDevUserEmail,
        firstOwnerEmails: emailSet(process.env.FIRST_OWNER_EMAILS),
        firstOwnerSetupEnabled: process.env.ENABLE_FIRST_OWNER_SETUP !== "false",
        allowAnyFirstOwner: process.env.ALLOW_ANY_FIRST_OWNER === "true",
        privateContactsConfig: {
          google: googleContactsConfig(process.env),
        },
      });
      await sendWebResponse(res, response);
      return;
    }

    await serveStatic(url, res);
  } catch (error) {
    console.error(error);
    res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    res.end("Internal server error");
  }
});

const port = await listen(defaultPort);
console.log(`Shared Lists dev server running at http://localhost:${port}`);

async function listen(port) {
  return new Promise((resolve, reject) => {
    server.once("error", (error) => {
      if (error.code === "EADDRINUSE" && port < defaultPort + 20) {
        resolve(listen(port + 1));
      } else {
        reject(error);
      }
    });
    server.listen(port, host, () => resolve(port));
  });
}

async function serveStatic(url, res) {
  const pathname = url.pathname === "/" || url.pathname === "/shell.html" ? "/index.html" : url.pathname;
  const candidate = normalize(join(clientRoot, decodeURIComponent(pathname)));
  if (!candidate.startsWith(clientRoot)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const fileStat = await stat(candidate);
    if (!fileStat.isFile()) throw new Error("Not a file");
    const rawContent = await readFile(candidate);
    const content = renderStaticContent(pathname, rawContent);
    res.writeHead(200, {
      "content-type": contentType(candidate),
      "cache-control": "no-store",
    });
    res.end(content);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(chunks.length ? Buffer.concat(chunks) : undefined));
    req.on("error", reject);
  });
}

function emailSet(value) {
  return new Set(
    String(value || "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

async function readSharedListsConfig() {
  try {
    return JSON.parse(await readFile(process.env.SHARED_LISTS_CONFIG_PATH || join(root, "shared-lists.config.json"), "utf8"));
  } catch {
    return {};
  }
}

async function loadDotEnv(file) {
  let content = "";
  try {
    content = await readFile(file, "utf8");
  } catch {
    return;
  }
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const [key, ...valueParts] = line.split("=");
    const name = key.trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name) || process.env[name] !== undefined) continue;
    process.env[name] = unquoteEnvValue(valueParts.join("=").trim());
  }
}

function unquoteEnvValue(value) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value.replace(/\s+#.*$/, "").trim();
}

function renderStaticContent(pathname, rawContent) {
  if (pathname === "/index.html") {
    return Buffer.from(applyDocumentMetadata(injectSharedListsConfig(rawContent.toString("utf8"), devConfig), devConfig));
  }
  if (pathname === "/manifest.webmanifest") {
    return Buffer.from(renderManifest(rawContent.toString("utf8"), devConfig));
  }
  return rawContent;
}

async function sendWebResponse(res, response) {
  const headers = Object.fromEntries(response.headers.entries());
  res.writeHead(response.status, headers);
  const body = Buffer.from(await response.arrayBuffer());
  res.end(body);
}

function contentType(file) {
  const ext = extname(file);
  if (ext === ".html") return "text/html; charset=utf-8";
  if (ext === ".css") return "text/css; charset=utf-8";
  if (ext === ".js") return "text/javascript; charset=utf-8";
  if (ext === ".json" || ext === ".webmanifest") return "application/manifest+json; charset=utf-8";
  if (ext === ".png") return "image/png";
  if (ext === ".svg") return "image/svg+xml";
  return "application/octet-stream";
}
