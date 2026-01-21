import { visit } from 'unist-util-visit';

function nodeToText(node) {
  if (!node) return '';
  if (node.type === 'text') return node.value ?? '';
  if (!Array.isArray(node.children)) return '';
  return node.children.map(nodeToText).join('');
}

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

      const isMermaid =
        preLanguage === 'mermaid' ||
        classList.some((value) => value === 'language-mermaid' || value.endsWith('language-mermaid'));

      if (!isMermaid) return;

      const diagram = nodeToText(code).trim();
      if (!diagram) return;

      parent.children[index] = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['mermaid'] },
        children: [{ type: 'text', value: diagram }],
      };
    });
  };
}
