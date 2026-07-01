import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { transform } from "esbuild";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const dist = join(root, "dist");
const execFileAsync = promisify(execFile);

await rm(dist, { recursive: true, force: true });
await mkdir(join(dist, "server", "lib"), { recursive: true });
await mkdir(join(dist, "client"), { recursive: true });
await mkdir(join(dist, "_appgen_meta"), { recursive: true });

await cp(join(root, "src", "worker.js"), join(dist, "server", "index.js"));
await cp(join(root, "src", "lib"), join(dist, "server", "lib"), { recursive: true });
await cp(join(root, "src", "manifest.webmanifest"), join(dist, "client", "manifest.webmanifest"));
await cp(join(root, "src", "apple-touch-icon.png"), join(dist, "client", "apple-touch-icon.png"));
await cp(join(root, "src", "icons"), join(dist, "client", "icons"), { recursive: true });
await cp(join(root, "src", "license.html"), join(dist, "client", "license.html"));
await cp(join(root, "src", "offline.html"), join(dist, "client", "offline.html"));
await cp(join(root, "src", "people-import.html"), join(dist, "client", "people-import.html"));
await cp(join(root, "src", "service-worker.js"), join(dist, "client", "service-worker.js"));
await cp(join(root, "src", "social-preview.png"), join(dist, "client", "social-preview.png"));
await cp(join(root, "src", "social-preview.svg"), join(dist, "client", "social-preview.svg"));
await cp(join(root, ".openai", "hosting.json"), join(dist, "_appgen_meta", "appgarden.json"));
await cp(join(root, "drizzle"), join(dist, "_appgen_meta", "drizzle"), { recursive: true });

const [appSource, stylesSource] = await Promise.all([
  readFile(join(root, "src", "app.js"), "utf8"),
  readFile(join(root, "src", "styles.css"), "utf8"),
]);
const [appBuild, stylesBuild] = await Promise.all([
  transform(appSource, { loader: "js", minify: true, target: "es2020", legalComments: "none" }),
  transform(stylesSource, { loader: "css", minify: true, target: "es2020", legalComments: "none" }),
]);
await Promise.all([
  writeFile(join(dist, "client", "app.js"), appBuild.code),
  writeFile(join(dist, "client", "styles.css"), stylesBuild.code),
]);

const assetVersion = await resolveAssetVersion();
const installIconDataUri = await readInstallIconDataUri();
const sharedListsConfig = await readSharedListsConfig();
const index = await readFile(join(root, "src", "index.html"), "utf8");
const configuredIndex = applyDocumentMetadata(injectSharedListsConfig(index, sharedListsConfig), sharedListsConfig);
const builtIndex = markGenericDocument(
  stripDevUserOptions(versionClientAssets(configuredIndex, assetVersion)),
);
await writeFile(join(dist, "client", "index.html"), builtIndex);
await writeFile(join(dist, "client", "shell.html"), builtIndex);
const manifest = await readFile(join(dist, "client", "manifest.webmanifest"), "utf8");
await writeFile(join(dist, "client", "manifest.webmanifest"), renderManifest(manifest, installIconDataUri, sharedListsConfig));
const serviceWorker = await readFile(join(dist, "client", "service-worker.js"), "utf8");
await writeFile(join(dist, "client", "service-worker.js"), versionServiceWorker(serviceWorker, assetVersion));

const worker = await readFile(join(dist, "server", "index.js"), "utf8");
await writeFile(join(dist, "server", "index.js"), worker.replaceAll("./lib/", "./lib/"));

console.log("Built dist/server/index.js and dist/client assets.");

async function resolveAssetVersion() {
  const contentHash = createHash("sha256");
  for (const file of ["shared-lists.config.json", "src/app.js", "src/styles.css", "src/index.html", "src/service-worker.js", "src/social-preview.png"]) {
    contentHash.update(await readFile(join(root, file)));
  }
  const digest = contentHash.digest("hex").slice(0, 12);
  try {
    const { stdout } = await execFileAsync("git", ["rev-parse", "--short", "HEAD"], { cwd: root });
    const revision = stdout.trim();
    return revision ? `${revision}-${digest}` : digest;
  } catch {
    return digest;
  }
}

async function readInstallIconDataUri() {
  const icon = await readFile(join(root, "src", "apple-touch-icon.png"));
  return `data:image/png;base64,${icon.toString("base64")}`;
}

async function readSharedListsConfig() {
  try {
    return JSON.parse(await readFile(process.env.SHARED_LISTS_CONFIG_PATH || join(root, "shared-lists.config.json"), "utf8"));
  } catch {
    return {};
  }
}

function injectSharedListsConfig(html, config) {
  return html.replace("__SHARED_LISTS_CONFIG__", escapeScriptJson(JSON.stringify(config)));
}

function escapeScriptJson(value) {
  return value.replace(/</g, "\\u003c");
}

function applyDocumentMetadata(html, config) {
  const publicUrl = String(config.publicUrl || "").trim().replace(/\/+$/, "");
  const appName = normalizeAppName(config.appName);
  const rootUrl = publicUrl || "/";
  const socialPreviewUrl = publicUrl ? `${publicUrl}/social-preview.png` : "/social-preview.png";
  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(appName)}</title>`)
    .replace(/<main class="app-shell" aria-label="[^"]*"/, `<main class="app-shell" aria-label="${escapeAttr(appName)}"`)
    .replace(/<h1>Shared Lists<\/h1>/, `<h1>${escapeHtml(appName)}</h1>`)
    .replace(/<meta name="apple-mobile-web-app-title" content="[^"]*"/, `<meta name="apple-mobile-web-app-title" content="${escapeAttr(appName)}"`)
    .replace(/<meta property="og:site_name" content="[^"]*"/, `<meta property="og:site_name" content="${escapeAttr(appName)}"`)
    .replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${escapeAttr(appName)}"`)
    .replace(/<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${escapeAttr(rootUrl)}"`)
    .replace(/<meta property="og:image" content="[^"]*"/, `<meta property="og:image" content="${escapeAttr(socialPreviewUrl)}"`)
    .replace(/<meta property="og:image:secure_url" content="[^"]*"/, `<meta property="og:image:secure_url" content="${escapeAttr(socialPreviewUrl)}"`)
    .replace(/<meta property="og:image:alt" content="[^"]*"/, `<meta property="og:image:alt" content="${escapeAttr(`${appName}. Share and collaborate.`)}"`)
    .replace(/<meta name="twitter:title" content="[^"]*"/, `<meta name="twitter:title" content="${escapeAttr(appName)}"`)
    .replace(/<meta name="twitter:image" content="[^"]*"/, `<meta name="twitter:image" content="${escapeAttr(socialPreviewUrl)}"`);
}

function versionClientAssets(html, version) {
  return html
    .replace(/href="\/styles\.css(?:\?v=[^"]*)?"/, `href="/styles.css?v=${version}"`)
    .replace(/src="\/app\.js(?:\?v=[^"]*)?"/, `src="/app.js?v=${version}"`);
}

function renderManifest(manifest, dataUri, config) {
  const parsed = JSON.parse(manifest);
  parsed.name = normalizeAppName(config.appName);
  parsed.short_name = parsed.name.length > 12 ? "Shared Lists" : parsed.name;
  parsed.description = String(config.manifestDescription || parsed.description || "Private shared lists with list-level permissions.").trim();
  parsed.icons = parsed.icons.map((icon) =>
    icon.src === "/apple-touch-icon.png" ? { ...icon, src: dataUri } : icon,
  );
  return `${JSON.stringify(parsed, null, 2)}\n`;
}

function normalizeAppName(value) {
  return String(value || "Shared Lists").trim().slice(0, 80) || "Shared Lists";
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/"/g, "&quot;");
}

function stripDevUserOptions(html) {
  return html.replace(/(<select id="dev-user-switcher"[\s\S]*?>)[\s\S]*?(<\/select>)/, "$1$2");
}

function markGenericDocument(html) {
  return html.replace("<body ", '<body data-generic-shell="true" ');
}

function versionServiceWorker(serviceWorker, version) {
  return serviceWorker.replaceAll("__APP_VERSION__", version);
}
