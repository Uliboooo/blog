import { readFileSync } from "node:fs";
import path from "node:path";
import { html } from "satori-html";

export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

const fontPath = path.resolve(
  process.cwd(),
  "public/fonts/NotoSansJP-Bold.ttf",
);
const fontData = readFileSync(fontPath);

const ogFonts = [
  { name: "Noto Sans JP", data: fontData, weight: 700, style: "normal" },
  { name: "Noto Sans JP", data: fontData, weight: 600, style: "normal" },
  { name: "Noto Sans JP", data: fontData, weight: 500, style: "normal" },
];

export const loadOgFonts = () => ogFonts;

export const buildOgVNode = (title: string, description?: string) => {
  const safeTitle = title.trim() || "Uliboooo's blog";
  const safeDescription = description?.trim();

  return html`<div
    style="width:${OG_IMAGE_WIDTH}px;height:${OG_IMAGE_HEIGHT}px;display:flex;background:linear-gradient(135deg,#faf5ff,#ffeefc);font-family:'Noto Sans JP',sans-serif;"
  >
    <div
      style="margin:56px;flex:1;background:#ffffff;border-radius:36px;border:2px solid #f1d5f0;display:flex;flex-direction:column;box-sizing:border-box;padding:64px;"
    >
      <div
        style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:24px;"
      >
        <div
          style="font-size:64px;font-weight:700;line-height:1.25;color:#111111;word-break:break-word;white-space:pre-wrap;"
        >
          ${safeTitle}
        </div>
        ${
          safeDescription
            ? html`<div
                style="font-size:28px;font-weight:500;line-height:1.5;color:#555555;word-break:break-word;white-space:pre-wrap;"
              >
                ${safeDescription}
              </div>`
            : ""
        }
      </div>
      <div style="font-size:32px;font-weight:600;color:#666666;">
        Uliboooo's blog
      </div>
    </div>
  </div>`;
};
