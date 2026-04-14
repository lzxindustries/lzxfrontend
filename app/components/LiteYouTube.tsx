import {useState, useCallback} from 'react';

/**
 * Lightweight YouTube embed using the facade pattern.
 * Shows a thumbnail + play button; loads the iframe only on click.
 */
export function LiteYouTube({
  videoId,
  title,
  className = '',
}: {
  videoId: string;
  title: string;
  className?: string;
}) {
  const [active, setActive] = useState(false);

  const handleClick = useCallback(() => setActive(true), []);

  return (
    <div
      className={`relative aspect-video w-full overflow-hidden rounded-xl ring-1 ring-white/10 ${className}`}
    >
      {active ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          className="group absolute inset-0 flex h-full w-full cursor-pointer items-center justify-center bg-black"
          onClick={handleClick}
          aria-label={`Play ${title}`}
        >
          {/* YouTube high-res thumbnail */}
          <img
            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-80"
            loading="eager"
          />

          {/* Play button */}
          <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-mystic/90 shadow-lg shadow-mystic/30 transition-transform duration-200 group-hover:scale-110 sm:h-20 sm:w-20">
            <svg
              className="ml-1 h-7 w-7 text-white sm:h-8 sm:w-8"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </button>
      )}
    </div>
  );
}
