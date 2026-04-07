import {describe, expect, it, vi, beforeEach} from 'vitest';
import {getModuleDetails} from '~/controllers/get_module_details';
import {
  createMockContext,
  mockModules,
  mockCompanies,
  mockModuleConnectors,
  mockModuleControls,
  mockModuleFeatures,
  mockModuleVideos,
  mockModuleAssets,
  mockVideos,
  mockParts,
  mockAssets,
} from '../fixtures';

vi.mock('~/lib/db.server', () => ({
  getDataCollection: vi.fn(),
  getDataDocument: vi.fn(),
}));

import {getDataCollection, getDataDocument} from '~/lib/db.server';
const mockedGetDataCollection = vi.mocked(getDataCollection);
const mockedGetDataDocument = vi.mocked(getDataDocument);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getModuleDetails', () => {
  function setupMocks() {
    mockedGetDataDocument.mockResolvedValueOnce(mockModules[0]);
    mockedGetDataCollection
      .mockResolvedValueOnce(mockCompanies)
      .mockResolvedValueOnce(mockModuleVideos)
      .mockResolvedValueOnce(mockModuleAssets)
      .mockResolvedValueOnce(mockVideos)
      .mockResolvedValueOnce(mockModuleControls)
      .mockResolvedValueOnce(mockModuleConnectors)
      .mockResolvedValueOnce(mockModuleFeatures)
      .mockResolvedValueOnce(mockParts)
      .mockResolvedValueOnce(mockAssets);
  }

  it('fetches module by id and related data', async () => {
    setupMocks();
    const ctx = createMockContext();
    await getModuleDetails(ctx, 'gid://shopify/Product/1001');

    expect(mockedGetDataDocument).toHaveBeenCalledWith(ctx, 'Module', {
      id: 'gid://shopify/Product/1001',
    });
    expect(mockedGetDataCollection).toHaveBeenCalledTimes(9);
  });

  it('returns a ModuleView with company data', async () => {
    setupMocks();
    const ctx = createMockContext();
    const result = await getModuleDetails(ctx, 'gid://shopify/Product/1001');

    expect(result.name).toBe('Navigator');
    expect(result.company.name).toBe('LZX Industries');
    expect(result.company.legalName).toBe('LZX Industries LLC');
  });

  it('populates connectors with part data', async () => {
    setupMocks();
    const ctx = createMockContext();
    const result = await getModuleDetails(ctx, 'gid://shopify/Product/1001');

    expect(result.connectors).toHaveLength(2);
    expect(result.connectors[0].name).toBe('Video In');
    expect(result.connectors[0].refDes).toBe('J1');
    expect(result.connectors[0].is_input).toBe(true);
    expect(result.connectors[0].part.name).toBe('3.5mm Jack');
    expect(result.connectors[1].name).toBe('Video Out');
    expect(result.connectors[1].is_output).toBe(true);
  });

  it('populates controls with part data', async () => {
    setupMocks();
    const ctx = createMockContext();
    const result = await getModuleDetails(ctx, 'gid://shopify/Product/1001');

    expect(result.controls).toHaveLength(1);
    expect(result.controls[0].name).toBe('Gain');
    expect(result.controls[0].is_gain).toBe(true);
    expect(result.controls[0].part.name).toBe('Potentiometer');
  });

  it('populates features', async () => {
    setupMocks();
    const ctx = createMockContext();
    const result = await getModuleDetails(ctx, 'gid://shopify/Product/1001');

    expect(result.features).toHaveLength(1);
    expect(result.features[0].name).toBe('Dual Channel');
    expect(result.features[0].topic).toBe('Processing');
  });

  it('populates videos', async () => {
    setupMocks();
    const ctx = createMockContext();
    const result = await getModuleDetails(ctx, 'gid://shopify/Product/1001');

    expect(result.videos).toHaveLength(1);
    expect(result.videos[0].name).toBe('Tutorial 1');
    expect(result.videos[0].youtube).toBe('yt-1');
  });

  it('populates assets', async () => {
    setupMocks();
    const ctx = createMockContext();
    const result = await getModuleDetails(ctx, 'gid://shopify/Product/1001');

    expect(result.assets).toHaveLength(1);
    expect(result.assets[0].name).toBe('User Manual');
    expect(result.assets[0].file_name).toBe('navigator-manual.pdf');
  });
});
