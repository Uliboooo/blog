import { visit } from "unist-util-visit";

const FOOTNOTE_OPEN = "#footnote[";
const HEADING_MARKER = /^(={1,5})[ \t]+/;

// Typst-style syntax on top of markdown:
//   *strong* / _emphasis_  (CommonMark parses both as emphasis; the
//   original delimiter is recovered from the source via position offsets)
//   #footnote[content]     (inline footnote, auto-numbered)
//   = heading              (`=` is h2 ... `=====` is h6; h1 is the title)
export default function remarkTypst() {
  return (tree, file) => {
    const src = typeof file?.value === "string" ? file.value : String(file);

    typstHeadings(tree);

    visit(tree, "emphasis", (node) => {
      const offset = node.position?.start?.offset;
      if (offset != null && src[offset] === "*") {
        node.type = "strong";
      }
    });

    const definitions = [];
    let counter = 0;

    visit(tree, (node) => {
      if (!Array.isArray(node.children)) return;
      if (node.type === "footnoteDefinition") return;

      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (child.type !== "text") continue;

        const open = child.value.indexOf(FOOTNOTE_OPEN);
        if (open === -1) continue;

        const match = findClosing(node.children, i, open + FOOTNOTE_OPEN.length);
        if (!match) continue;

        const identifier = `fn-${++counter}`;
        const before = child.value.slice(0, open);
        const contentHead = child.value.slice(open + FOOTNOTE_OPEN.length);

        // Inline nodes making up the footnote content: the tail of the
        // opening text node, any whole siblings in between, and the head
        // of the closing text node.
        const content = [];
        if (match.endIndex === i) {
          const inner = child.value.slice(open + FOOTNOTE_OPEN.length, match.endOffset);
          if (inner) content.push({ type: "text", value: inner });
        } else {
          if (contentHead) content.push({ type: "text", value: contentHead });
          content.push(...node.children.slice(i + 1, match.endIndex));
          const closing = node.children[match.endIndex];
          const closingHead = closing.value.slice(0, match.endOffset);
          if (closingHead) content.push({ type: "text", value: closingHead });
        }

        definitions.push({
          type: "footnoteDefinition",
          identifier,
          label: identifier,
          children: [{ type: "paragraph", children: content }],
        });

        const closingTail = node.children[match.endIndex].value.slice(match.endOffset + 1);
        const replacement = [];
        if (before) replacement.push({ type: "text", value: before });
        replacement.push({ type: "footnoteReference", identifier, label: identifier });
        if (closingTail) replacement.push({ type: "text", value: closingTail });

        node.children.splice(i, match.endIndex - i + 1, ...replacement);
        // Re-scan from the node after the reference (closingTail may hold
        // another #footnote[).
        i = i + replacement.length - (closingTail ? 2 : 1);
      }
    });

    if (definitions.length > 0) {
      tree.children.push(...definitions);
    }
  };
}

// CommonMark parses a `= heading` line as a plain paragraph, so headings are
// recovered from those paragraphs here. A marker line must form a paragraph of
// its own (i.e. have a blank line before it): otherwise it is a lazy
// continuation of the preceding paragraph and stays body text.
function typstHeadings(tree) {
  visit(tree, "paragraph", (node, _index, parent) => {
    // A list item never holds a heading, and `- = ...` is ordinary text.
    if (parent?.type === "listItem") return;

    const first = node.children[0];
    if (first?.type !== "text") return;

    const match = HEADING_MARKER.exec(first.value);
    if (!match) return;

    // Multi-line paragraphs are left alone: the marker line cannot be split
    // off without cutting through inline nodes.
    if (node.children.some((child) => child.type === "text" && child.value.includes("\n"))) return;

    const head = first.value.slice(match[0].length);
    if (!head && node.children.length === 1) return;

    if (head) first.value = head;
    else node.children.shift();

    node.type = "heading";
    node.depth = match[1].length + 1;
  });
}

// Finds the `]` matching an already-consumed `[`, scanning text siblings
// from children[startIndex] at text offset startOffset. Non-text siblings
// (emphasis, links, ...) are treated as opaque content. Returns
// { endIndex, endOffset } of the closing bracket, or null if unbalanced.
function findClosing(children, startIndex, startOffset) {
  let depth = 1;
  for (let idx = startIndex; idx < children.length; idx++) {
    const sibling = children[idx];
    if (sibling.type !== "text") continue;
    const from = idx === startIndex ? startOffset : 0;
    for (let pos = from; pos < sibling.value.length; pos++) {
      const ch = sibling.value[pos];
      if (ch === "[") depth++;
      else if (ch === "]" && --depth === 0) {
        return { endIndex: idx, endOffset: pos };
      }
    }
  }
  return null;
}
