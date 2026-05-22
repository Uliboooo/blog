#!/usr/bin/env bun

import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import prompts from "prompts";

const is_project_root = existsSync("./package.json");

if (!is_project_root) {
  console.error("Run this command in project root");

  process.exit(1);
}

const resp = await prompts([
  {
    type: "text",
    name: "title",
    message: "input a new article title",
  },
  {
    type: "text",
    name: "desc",
    message: "description of new article",
  },
  {
    type: "text",
    name: "tags",
    message: "enter the values separated by ` ` or `,`.",
  },
  {
    type: "confirm",
    name: "is_public",
    message: "is public?",
    initial: true,
  },
]);

if (!resp.title) {
  console.error("canceled");
  process.exit(1);
}

const print_title = (resp.title ?? "").trim();

const slug = (resp.title ?? "")
  .trim()
  .toLowerCase()
  .replace(/\s+/g, "_")
  .replace(/[^\w-]/g, "");

const now = new Date();
const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
  now.getDate(),
).padStart(2, "0")}`;

const tags = String(resp.tags ?? "")
  .split(/[ ,]+/)
  .map((s) => s.trim())
  .filter(Boolean);

const input_meta_data = {
  title: print_title,
  date: formatted,
  writer: "Uliboooo",
  description: resp.desc ?? "",
  tags: tags,
  published: resp.is_public,
};

const frontmatter = [
  "---",
  `title: "${input_meta_data.title}"`,
  `date: ${input_meta_data.date}`,
  `writer: "${input_meta_data.writer}"`,
  `description: "${input_meta_data.description}"`,
  `tags: [${input_meta_data.tags.map((t) => `"${t}"`).join(", ")}]`,
  `published: ${input_meta_data.published}`,
  "---",
  "",
].join("\n");

const article_path = `./src/content/${slug}/${slug}.md`;
const file = Bun.file(article_path);

if (await file.exists()) {
  console.error("already exists article, please rename.");
  process.exit(1);
}
await mkdir(path.dirname(article_path), { recursive: true });
await Bun.write(article_path, frontmatter);
