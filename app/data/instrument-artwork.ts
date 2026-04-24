const INSTRUMENT_ARTWORK: Record<string, string> = {
  bitvision: '/images/bitvision-manual-cover-square.jpg',
  videomancer: '/images/videomancer/hero-product-square.png',
  chromagnon: '/images/chromagnon-front-panel-square.png',
  vidiot: '/images/vidiot.PNG',
  'double-vision': '/images/double-vision-system-square.png',
  'double-vision-168': '/images/double-vision-system-168-square.png',
  'double-vision-expander': '/images/double-vision-expander-168-square.png',
  'andor-1-media-player': '/images/andor-1-photo-square.png',
};

export function getInstrumentArtworkPath(slug: string): string | null {
  return INSTRUMENT_ARTWORK[slug] ?? null;
}
