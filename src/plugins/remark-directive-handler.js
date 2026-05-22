import { visit } from 'unist-util-visit';

export default function remarkDirectiveHandler() {
  return (tree) => {
    visit(tree, (node) => {
      if (
        node.type === 'containerDirective' ||
        node.type === 'leafDirective' ||
        node.type === 'textDirective'
      ) {
        const data = node.data || (node.data = {});
        const tagName = node.type === 'textDirective' ? 'span' : 'div';

        data.hName = tagName;
        data.hProperties = {
          ...node.attributes,
          class: node.name + (node.attributes?.class ? ` ${node.attributes.class}` : ''),
        };
      }
    });
  };
}
