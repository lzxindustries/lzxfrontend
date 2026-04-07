import {describe, expect, it, vi, beforeEach} from 'vitest';
import {getAllModules} from '~/controllers/get_all_modules';
import {
  createMockContext,
  mockModules,
  mockCompanies,
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

describe('getAllModules', () => {
  it('fetches modules and companies in parallel', async () => {
    mockedGetDataCollection
      .mockResolvedValueOnce(mockModules)
      .mockResolvedValueOnce(mockCompanies);

    const ctx = createMockContext();
    await getAllModules(ctx);

    expect(mockedGetDataCollection).toHaveBeenCalledTimes(2);
    expect(mockedGetDataCollection).toHaveBeenCalledWith(ctx, 'Module', [
      {$limit: 1024},
      {$sort: {is_active_product: -1}},
    ]);
    expect(mockedGetDataCollection).toHaveBeenCalledWith(ctx, 'Company');
  });

  it('returns ModuleView array with correct length', async () => {
    mockedGetDataCollection
      .mockResolvedValueOnce(mockModules)
      .mockResolvedValueOnce(mockCompanies);

    const ctx = createMockContext();
    const result = await getAllModules(ctx);

    expect(result).toHaveLength(3);
  });

  it('joins company data to module views', async () => {
    mockedGetDataCollection
      .mockResolvedValueOnce(mockModules)
      .mockResolvedValueOnce(mockCompanies);

    const ctx = createMockContext();
    const result = await getAllModules(ctx);

    // mod-1 belongs to company-1 (LZX Industries)
    expect(result[0].company.name).toBe('LZX Industries');
    expect(result[0].company.legalName).toBe('LZX Industries LLC');

    // mod-3 belongs to company-2 (Brownshoesonly)
    expect(result[2].company.name).toBe('Brownshoesonly');
  });

  it('uses "Unknown" for modules with no matching company', async () => {
    const orphanModule = {...mockModules[0], _id: 'orphan', company: 'no-match'};
    mockedGetDataCollection
      .mockResolvedValueOnce([orphanModule])
      .mockResolvedValueOnce(mockCompanies);

    const ctx = createMockContext();
    const result = await getAllModules(ctx);

    expect(result[0].company.name).toBe('Unknown');
    expect(result[0].company.legalName).toBe('Unknown');
  });

  it('maps all module fields to view correctly', async () => {
    mockedGetDataCollection
      .mockResolvedValueOnce([mockModules[0]])
      .mockResolvedValueOnce(mockCompanies);

    const ctx = createMockContext();
    const result = await getAllModules(ctx);
    const view = result[0];

    expect(view.id).toBe('gid://shopify/Product/1001');
    expect(view.name).toBe('Navigator');
    expect(view.hp).toBe(16);
    expect(view.max_pos_12v_ma).toBe(130);
    expect(view.max_neg_12v_ma).toBe(100);
    expect(view.mounting_depth_mm).toBe(32);
    expect(view.is_active_product).toBe(true);
    expect(view.has_eurorack_power_entry).toBe(true);
    expect(view.frontpanel).toBe('navigator-front-panel.jpg');
    expect(view.connectors).toEqual([]);
    expect(view.features).toEqual([]);
    expect(view.controls).toEqual([]);
    expect(view.assets).toEqual([]);
    expect(view.videos).toEqual([]);
  });

  it('handles empty module list', async () => {
    mockedGetDataCollection
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(mockCompanies);

    const ctx = createMockContext();
    const result = await getAllModules(ctx);
    expect(result).toEqual([]);
  });
});
