export function injectSharedListsConfig(html, config) {
  return html.replace("__SHARED_LISTS_CONFIG__", escapeScriptJson(JSON.stringify(config)));
}

export function applyDocumentMetadata(html, config) {
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

export function renderManifest(manifest, config, { installIconDataUri = "" } = {}) {
  const parsed = JSON.parse(manifest);
  parsed.name = normalizeAppName(config.appName);
  parsed.short_name = parsed.name.length > 12 ? "Shared Lists" : parsed.name;
  parsed.description = String(config.manifestDescription || parsed.description || "Private shared lists with list-level permissions.").trim();
  if (installIconDataUri) {
    parsed.icons = parsed.icons.map((icon) =>
      icon.src === "/apple-touch-icon.png" ? { ...icon, src: installIconDataUri } : icon,
    );
  }
  return `${JSON.stringify(parsed, null, 2)}\n`;
}

export function normalizeAppName(value) {
  return String(value || "Shared Lists").trim().slice(0, 80) || "Shared Lists";
}

function escapeScriptJson(value) {
  return value.replace(/</g, "\\u003c");
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
