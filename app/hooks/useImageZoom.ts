import {useEffect, useRef} from 'react';

/**
 * Attaches medium-zoom to all images within the given container ref.
 * Call this hook in any layout that renders markdown content.
 */
export function useImageZoom(containerRef: React.RefObject<HTMLElement | null>) {
  const zoomRef = useRef<ReturnType<typeof import('medium-zoom')['default']> | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const images = container.querySelectorAll('img');
    if (images.length === 0) return;

    let cancelled = false;

    import('medium-zoom').then(({default: mediumZoom}) => {
      if (cancelled) return;

      zoomRef.current = mediumZoom(Array.from(images), {
        margin: 24,
        background: 'rgba(255, 255, 255, 0.95)',
      });
    });

    return () => {
      cancelled = true;
      zoomRef.current?.detach();
      zoomRef.current = null;
    };
  }, [containerRef]);
}
