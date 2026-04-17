import {useRef, useState, useCallback, useEffect} from 'react';

interface BeforeAfterSliderProps {
  sourceUrl: string;
  processedUrl: string;
  sourceLabel?: string;
  processedLabel?: string;
  title?: string;
  programName?: string;
}

export function BeforeAfterSlider({
  sourceUrl,
  processedUrl,
  sourceLabel = 'SOURCE',
  processedLabel = 'PROCESSED',
  title,
  programName,
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  // Track container width for source image sizing
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(container);
    setContainerWidth(container.offsetWidth);
    return () => observer.disconnect();
  }, []);

  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(pct);
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      isDraggingRef.current = true;
      setIsDragging(true);
      containerRef.current?.setPointerCapture(e.pointerId);
      updatePosition(e.clientX);
    },
    [updatePosition],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingRef.current) return;
      updatePosition(e.clientX);
    },
    [updatePosition],
  );

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
  }, []);

  // Keyboard support
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      setPosition((prev) => Math.max(0, prev - 2));
    } else if (e.key === 'ArrowRight') {
      setPosition((prev) => Math.min(100, prev + 2));
    }
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d]">
      <div
        ref={containerRef}
        className="relative aspect-video w-full cursor-ew-resize select-none overflow-hidden"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
        role="slider"
        aria-label={`Before and after comparison${title ? `: ${title}` : ''}`}
        aria-valuenow={Math.round(position)}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
      >
        {/* Processed (full background) */}
        <img
          src={processedUrl}
          alt={`${title ?? 'Processed'} output`}
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />

        {/* Source (clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{width: `${position}%`}}
        >
          <img
            src={sourceUrl}
            alt={`${title ?? 'Source'} input`}
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              width: containerWidth > 0 ? `${containerWidth}px` : '100%',
              maxWidth: 'none',
            }}
            draggable={false}
          />
        </div>

        {/* Divider line */}
        <div
          className="absolute top-0 bottom-0 z-10 w-0.5 bg-white/80 shadow-[0_0_8px_rgba(0,0,0,0.5)]"
          style={{left: `${position}%`, transform: 'translateX(-50%)'}}
        />

        {/* Handle */}
        <div
          className="absolute top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-black/60 shadow-lg backdrop-blur-sm transition-transform duration-100"
          style={{
            left: `${position}%`,
            transform: `translate(-50%, -50%)${
              isDragging ? ' scale(1.15)' : ''
            }`,
          }}
        >
          <svg
            className="h-5 w-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7l-4 5 4 5M16 7l4 5-4 5"
            />
          </svg>
        </div>

        {/* Labels */}
        <span className="absolute left-3 top-3 z-10 rounded-full bg-black/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70 backdrop-blur-sm">
          {sourceLabel}
        </span>
        <span className="absolute right-3 top-3 z-10 rounded-full bg-mystic/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-moonwax backdrop-blur-sm">
          {processedLabel}
        </span>
      </div>

      {/* Footer info bar */}
      {(title || programName) && (
        <div className="flex items-center justify-between border-t border-white/10 px-4 py-3">
          {title && (
            <p className="text-xs uppercase tracking-[0.14em] text-white/65">
              {title}
            </p>
          )}
          {programName && (
            <p className="text-[10px] uppercase tracking-[0.12em] text-mystic-light">
              {programName}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
