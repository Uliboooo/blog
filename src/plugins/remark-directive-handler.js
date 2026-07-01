import { visit } from "unist-util-visit";

export default function remarkDirectiveHandler() {
  return (tree, file) => {
    visit(tree, (node) => {
      if (
        node.type === "containerDirective" ||
        node.type === "leafDirective" ||
        node.type === "textDirective"
      ) {
        const data = node.data || (node.data = {});

        if (node.name === "details") {
          data.hName = "details";
          data.hProperties = {
            ...node.attributes,
            class:
              "details" +
              (node.attributes?.class ? ` ${node.attributes.class}` : ""),
          };

          // Try to find the label and convert it to <summary>
          if (node.children && node.children.length > 0) {
            const firstChild = node.children[0];
            if (firstChild.data?.directiveLabel) {
              firstChild.data.hName = "summary";
            }
          }
        } else {
          const tagName = node.type === "textDirective" ? "span" : "div";
          data.hName = tagName;
          data.hProperties = {
            ...node.attributes,
            class:
              node.name +
              (node.attributes?.class ? ` ${node.attributes.class}` : ""),
          };
        }
      }

      // Support inline pros/cons list items: `- :+ item` and `- :- item`
      if (node.type === "listItem") {
        const firstPara = node.children?.[0];
        if (firstPara?.type === "paragraph") {
          const firstChild = firstPara.children?.[0];
          if (firstChild?.type === "text") {
            const val = firstChild.value;
            const t = val.trimStart();
            if (t.startsWith(":+ ")) {
              const prefix = val.length - t.length;
              firstChild.value = val.slice(prefix + 3);
              const data = node.data || (node.data = {});
              const prevClass = data.hProperties?.class || "";
              data.hProperties = {
                ...data.hProperties,
                class: ("pros" + (prevClass ? ` ${prevClass}` : "")).trim(),
              };
            } else if (t.startsWith(":- ")) {
              const prefix = val.length - t.length;
              firstChild.value = val.slice(prefix + 3);
              const data = node.data || (node.data = {});
              const prevClass = data.hProperties?.class || "";
              data.hProperties = {
                ...data.hProperties,
                class: ("cons" + (prevClass ? ` ${prevClass}` : "")).trim(),
              };
            }
          }
        }
      }

      // Support + bullet lists as pros lists (for top-level individual pros lists)
      if (node.type === "list" && !node.ordered) {
        const start = node.position?.start;
        const src = typeof file?.value === "string" ? file.value : "";
        if (start && src[start.offset] === "+") {
          const data = node.data || (node.data = {});
          const prevClass = data.hProperties?.class || "";
          data.hProperties = {
            ...(data.hProperties || {}),
            class: ("pros" + (prevClass ? ` ${prevClass}` : "")).trim(),
          };
        }
      }
    });
  };
}
