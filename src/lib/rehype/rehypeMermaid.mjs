import { visit } from 'unist-util-visit';

function normalizeClassList(className) {
  if (!className) return [];
  if (Array.isArray(className)) return className.map(String);
  return [String(className)];
}

export default function rehypeMermaid() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (!parent || typeof index !== 'number') return;
      if (node.tagName !== 'pre') return;

      const code = Array.isArray(node.children)
        ? node.children.find((child) => child.type === 'element' && child.tagName === 'code')
        : null;

      if (!code) return;

      const preLanguage =
        node.properties?.dataLanguage ??
        node.properties?.['data-language'] ??
        node.properties?.dataLang ??
        node.properties?.['data-lang'];

      const classList = normalizeClassList(code.properties?.className);

      console.log('Found code block:', {
        preLanguage,
        classList,
        properties: code.properties
      });

      const isMermaid =
        preLanguage === 'mermaid' ||
        classList.some((value) => value === 'language-mermaid' || value.endsWith('language-mermaid'));

      if (!isMermaid) return;

      const children = Array.isArray(code.children) ? code.children : [];
      if (children.length === 0) return;

      console.log('Converting mermaid code block to div');

      parent.children[index] = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['mermaid'] },
        children,
      };
    });
  };
}
