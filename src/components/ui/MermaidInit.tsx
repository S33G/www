import { useEffect } from 'react';
import mermaid from 'mermaid';

function MermaidInit() {
  useEffect(() => {
    const renderMermaid = async () => {
      const nodes = Array.from(document.querySelectorAll('.mermaid')).filter(
        (node): node is HTMLElement =>
          node instanceof HTMLElement && !node.hasAttribute('data-processed')
      );
      if (nodes.length === 0) return;

      const isLight = document.documentElement.dataset.theme === 'light';

      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: isLight ? 'default' : 'dark',
      });

      await mermaid.run({ nodes });
    };

    renderMermaid();
    document.addEventListener('astro:after-swap', renderMermaid);
    document.addEventListener('preferences-change', renderMermaid);

    return () => {
      document.removeEventListener('astro:after-swap', renderMermaid);
      document.removeEventListener('preferences-change', renderMermaid);
    };
  }, []);

  return null;
}

export default MermaidInit;
