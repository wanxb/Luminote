function getVariantConfig(variant: string) {
  switch (variant) {
    case "avatar":
      return { width: 640, height: 640, label: "AVATAR", fill: "#b69073" };
    case "thumb":
      return { width: 720, height: 900, label: "THUMB", fill: "#d9c8ad" };
    case "watermarked":
      return {
        width: 1600,
        height: 1100,
        label: "WATERMARKED",
        fill: "#b48263",
      };
    case "display":
    default:
      return { width: 1600, height: 1100, label: "DISPLAY", fill: "#8f5838" };
  }
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function handleMockStorage(request: Request): Response {
  const url = new URL(request.url);
  const parts = url.pathname.split("/").filter(Boolean);
  const variant = parts[1] ?? "display";
  const id = parts[2] ?? "unknown";
  const config = getVariantConfig(variant);

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${config.width}" height="${config.height}" viewBox="0 0 ${config.width} ${config.height}">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${config.fill}" />
        <stop offset="100%" stop-color="#1f1a17" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#bg)" />
    <circle cx="${config.width - 180}" cy="180" r="120" fill="rgba(255,255,255,0.08)" />
    <text x="72" y="${config.height - 140}" fill="rgba(255,255,255,0.95)" font-size="54" font-family="Georgia, serif">
      ${escapeXml(config.label)}
    </text>
    <text x="72" y="${config.height - 82}" fill="rgba(255,255,255,0.74)" font-size="28" font-family="ui-sans-serif, system-ui, sans-serif">
      ${escapeXml(id)}
    </text>
    <text x="${config.width - 72}" y="${config.height - 46}" text-anchor="end" fill="rgba(255,255,255,0.55)" font-size="24" font-family="ui-sans-serif, system-ui, sans-serif">
      © Luminote Mock Storage
    </text>
  </svg>`;

  return new Response(svg.trim(), {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=60",
    },
  });
}
