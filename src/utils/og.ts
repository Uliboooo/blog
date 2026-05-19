const OG_IMAGE_WIDTH = 1200;
const OG_IMAGE_HEIGHT = 630;
const MAX_LINES = 3;
const BASE_MAX_CHARS = 18;

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const truncateDescription = (desc: string) => {
  const maxDescChars = 65; // Adjust based on font size and width
  if (Array.from(desc).length > maxDescChars) {
    return Array.from(desc).slice(0, maxDescChars).join("") + "...";
  }
  return desc;
};

const splitTitle = (title: string) => {
  const trimmed = title.trim() || "Untitled";
  const hasSpace = /\s/.test(trimmed);
  const maxChars = BASE_MAX_CHARS;

  if (hasSpace) {
    const words = trimmed.split(/\s+/);
    const lines: string[] = [];
    let current = "";

    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (Array.from(candidate).length > maxChars && current) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }

    if (current) lines.push(current);
    if (lines.length > MAX_LINES) {
      const head = lines.slice(0, MAX_LINES - 1);
      const tail = lines.slice(MAX_LINES - 1).join(" ");
      return [...head, tail];
    }
    return lines;
  }

  const chars = Array.from(trimmed);
  const lines: string[] = [];
  for (let i = 0; i < chars.length; i += maxChars) {
    lines.push(chars.slice(i, i + maxChars).join(""));
  }
  if (lines.length > MAX_LINES) {
    const head = lines.slice(0, MAX_LINES - 1);
    const tail = lines.slice(MAX_LINES - 1).join("");
    return [...head, tail];
  }
  return lines;
};

const resolveFontSize = (lines: string[]) => {
  const longest = Math.max(...lines.map((line) => Array.from(line).length));
  if (lines.length >= 3 || longest > 24) return 48;
  if (lines.length === 2 || longest > 18) return 56;
  return 64;
};

export const buildOgSvg = (title: string, description?: string) => {
  const lines = splitTitle(title);
  const fontSize = resolveFontSize(lines);
  const lineHeight = Math.round(fontSize * 1.25);
  
  // Calculate starting Y position. Adjust slightly up if there's a description
  let startY = Math.round(
    (OG_IMAGE_HEIGHT - lineHeight * (lines.length - 1)) / 2,
  );
  if (description) {
      startY = startY - 20; // Shift title up to make room
  }

  const textX = 120;
  const tspans = lines
    .map((line, index) => {
      const dy = index === 0 ? 0 : lineHeight;
      return `<tspan x="${textX}" dy="${dy}">${escapeXml(line)}</tspan>`;
    })
    .join("");

  const fontFamily =
    "Noto Sans JP, Hiragino Kaku Gothic ProN, Hiragino Sans, Yu Gothic, Meiryo, Segoe UI, sans-serif";
    
  let descriptionElement = "";
  if (description) {
    const descFontSize = 28;
    // Position description below the last line of the title
    const descY = startY + (lineHeight * (lines.length - 1)) + 60;
    const cleanDesc = truncateDescription(description.replace(/\n/g, " "));
    descriptionElement = `<text x="${textX}" y="${descY}" fill="#555555" font-family="${fontFamily}" font-size="${descFontSize}" font-weight="500">${escapeXml(cleanDesc)}</text>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${OG_IMAGE_WIDTH}" height="${OG_IMAGE_HEIGHT}" viewBox="0 0 ${OG_IMAGE_WIDTH} ${OG_IMAGE_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#faf5ff"/>
      <stop offset="100%" stop-color="#ffeefc"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)" />
  <rect x="56" y="56" width="${OG_IMAGE_WIDTH - 112}" height="${OG_IMAGE_HEIGHT - 112}" rx="36" fill="#ffffff" stroke="#f1d5f0" stroke-width="2" />
  <text x="${textX}" y="${startY}" fill="#111111" font-family="${fontFamily}" font-size="${fontSize}" font-weight="700">
    ${tspans}
  </text>
  ${descriptionElement}
  <text x="${textX}" y="${OG_IMAGE_HEIGHT - 120}" fill="#666666" font-family="${fontFamily}" font-size="32" font-weight="600">
    Uliboooo's blog
  </text>
</svg>`;
};
