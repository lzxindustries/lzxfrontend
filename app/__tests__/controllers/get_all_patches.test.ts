import {describe, expect, it, vi, beforeEach} from 'vitest';
import {getAllPatches} from '~/controllers/get_all_patches';
import {
  createMockContext,
  mockPatches,
  mockArtists,
  mockPatchVideos,
  mockPatchModules,
  mockModules,
  mockVideos,
} from '../fixtures';

vi.mock('~/lib/db.server', () => ({
  getDataCollection: vi.fn(),
  getDataDocument: vi.fn(),
}));

import {getDataCollection} from '~/lib/db.server';
const mockedGetDataCollection = vi.mocked(getDataCollection);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getAllPatches', () => {
  function setupMocks() {
    mockedGetDataCollection
      .mockResolvedValueOnce(mockPatches)
      .mockResolvedValueOnce(mockArtists)
      .mockResolvedValueOnce(mockPatchVideos)
      .mockResolvedValueOnce(mockPatchModules)
      .mockResolvedValueOnce(mockModules)
      .mockResolvedValueOnce(mockVideos);
  }

  it('fetches all required collections', async () => {
    setupMocks();
    const ctx = createMockContext();
    await getAllPatches(ctx);

    expect(mockedGetDataCollection).toHaveBeenCalledTimes(6);
    expect(mockedGetDataCollection).toHaveBeenCalledWith(ctx, 'Patch');
    expect(mockedGetDataCollection).toHaveBeenCalledWith(ctx, 'Artist');
    expect(mockedGetDataCollection).toHaveBeenCalledWith(ctx, 'PatchVideo');
    expect(mockedGetDataCollection).toHaveBeenCalledWith(ctx, 'PatchModule');
    expect(mockedGetDataCollection).toHaveBeenCalledWith(ctx, 'Module');
    expect(mockedGetDataCollection).toHaveBeenCalledWith(ctx, 'Video');
  });

  it('returns correct number of patches', async () => {
    setupMocks();
    const ctx = createMockContext();
    const result = await getAllPatches(ctx);
    expect(result).toHaveLength(2);
  });

  it('joins artist data to patch views', async () => {
    setupMocks();
    const ctx = createMockContext();
    const result = await getAllPatches(ctx);

    expect(result[0].artist.name).toBe('Lars Larsen');
    expect(result[1].artist.name).toBe('Andrei Jay');
  });

  it('joins videos to patch views', async () => {
    setupMocks();
    const ctx = createMockContext();
    const result = await getAllPatches(ctx);

    // patch-1 has one video linked
    expect(result[0].videos).toHaveLength(1);
    expect(result[0].videos[0].name).toBe('Tutorial 1');
    expect(result[0].videos[0].youtube).toBe('yt-1');

    // patch-2 has no videos
    expect(result[1].videos).toHaveLength(0);
  });

  it('joins modules to patch views', async () => {
    setupMocks();
    const ctx = createMockContext();
    const result = await getAllPatches(ctx);

    // patch-1 uses mod-1 and mod-2
    expect(result[0].modules).toHaveLength(2);
    expect(result[0].modules[0].name).toBe('Navigator');
    expect(result[0].modules[1].name).toBe('Chromagnon');

    // patch-2 has no modules
    expect(result[1].modules).toHaveLength(0);
  });

  it('maps all patch fields correctly', async () => {
    setupMocks();
    const ctx = createMockContext();
    const result = await getAllPatches(ctx);

    expect(result[0].name).toBe('Rainbow Generator');
    expect(result[0].diagram).toBe('rainbow-gen.png');
    expect(result[0].gif).toBe('rainbow-gen.gif');
    expect(result[0].notes).toBe('Basic rainbow patch');
    expect(result[0].youtube).toBe('https://youtube.com/watch?v=abc123');
  });

  it('uses "Unknown" for patches with no matching artist', async () => {
    const orphanPatch = {...mockPatches[0], _id: 'orphan', artist: 'no-match'};
    mockedGetDataCollection
      .mockResolvedValueOnce([orphanPatch])
      .mockResolvedValueOnce(mockArtists)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const ctx = createMockContext();
    const result = await getAllPatches(ctx);
    expect(result[0].artist.name).toBe('Unknown');
  });
});
