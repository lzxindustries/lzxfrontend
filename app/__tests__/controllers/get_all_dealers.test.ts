import {describe, expect, it, vi, beforeEach} from 'vitest';
import {getAllDealers} from '~/controllers/get_all_dealers';
import {createMockContext, mockDealers} from '../fixtures';

vi.mock('~/lib/db.server', () => ({
  getDataCollection: vi.fn(),
  getDataDocument: vi.fn(),
}));

import {getDataCollection} from '~/lib/db.server';
const mockedGetDataCollection = vi.mocked(getDataCollection);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getAllDealers', () => {
  it('fetches and transforms dealer data', async () => {
    mockedGetDataCollection.mockResolvedValueOnce(mockDealers);

    const ctx = createMockContext();
    const result = await getAllDealers(ctx);

    expect(mockedGetDataCollection).toHaveBeenCalledWith(ctx, 'Dealer');
    expect(result).toHaveLength(2);
  });

  it('maps dealer fields to DealerView', async () => {
    mockedGetDataCollection.mockResolvedValueOnce(mockDealers);

    const ctx = createMockContext();
    const result = await getAllDealers(ctx);

    expect(result[0]).toEqual({
      name: 'Control Voltage',
      url: 'https://controlvoltage.net',
      country: 'United States',
      city: 'Portland',
      logo: 'control-voltage.png',
      state: 'OR',
    });

    expect(result[1]).toEqual({
      name: 'Schneidersladen',
      url: 'https://schneidersladen.de',
      country: 'Germany',
      city: 'Berlin',
      logo: 'schneidersladen.png',
      state: '',
    });
  });

  it('handles empty dealer list', async () => {
    mockedGetDataCollection.mockResolvedValueOnce([]);

    const ctx = createMockContext();
    const result = await getAllDealers(ctx);
    expect(result).toEqual([]);
  });
});
