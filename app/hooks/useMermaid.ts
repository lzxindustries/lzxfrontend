import {useEffect} from 'react';

/**
 * Initializes Mermaid.js on the client side to render any
 * <div class="mermaid"> elements within the given container ref.
 */
export function useMermaid(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const mermaidDivs = container.querySelectorAll('.mermaid');
    if (mermaidDivs.length === 0) return;

    let cancelled = false;

    import('mermaid').then((mod) => {
      if (cancelled) return;
      const mermaid = mod.default;
      mermaid.initialize({
        startOnLoad: false,
        theme: 'neutral',
        securityLevel: 'loose',
      });
      mermaid.run({nodes: mermaidDivs as unknown as ArrayLike<HTMLElement>});
    });

    return () => {
      cancelled = true;
    };
  }, [ref]);
}
