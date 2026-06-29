import { visit } from "unist-util-visit";

export default function remarkDirectiveHandler() {
  return (tree) => {
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
    });
  };
}
