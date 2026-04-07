import {describe, expect, it, vi, beforeEach} from 'vitest';
import {getDataCollection, getDataDocument} from '~/lib/db.server';
import {createMockContext} from '../fixtures';

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

describe('getDataCollection', () => {
  it('sends correct request to MongoDB Data API aggregate endpoint', async () => {
    const ctx = createMockContext();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({documents: [{_id: '1', name: 'Test'}]}),
    });

    const pipeline = [{$limit: 100}];
    await getDataCollection(ctx, 'Module', pipeline);

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, config] = mockFetch.mock.calls[0];
    expect(url).toBe(
      'https://data.mongodb-api.com/app/test/endpoint/data/v1/action/aggregate',
    );
    expect(config.method).toBe('post');

    const body = JSON.parse(config.body);
    expect(body.collection).toBe('Module');
    expect(body.database).toBe('test-lzxdb');
    expect(body.dataSource).toBe('test-cluster');
    expect(body.pipeline).toEqual(pipeline);
  });

  it('sends api-key header', async () => {
    const ctx = createMockContext();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({documents: []}),
    });

    await getDataCollection(ctx, 'Module');

    const [, config] = mockFetch.mock.calls[0];
    expect(config.headers.get('api-key')).toBe('test-api-key');
  });

  it('returns documents array from response', async () => {
    const ctx = createMockContext();
    const docs = [{_id: '1', name: 'A'}, {_id: '2', name: 'B'}];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({documents: docs}),
    });

    const result = await getDataCollection(ctx, 'Module');
    expect(result).toEqual(docs);
  });

  it('returns empty array when documents is null', async () => {
    const ctx = createMockContext();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({documents: null}),
    });

    const result = await getDataCollection(ctx, 'Module');
    expect(result).toEqual([]);
  });

  it('uses default pipeline when none provided', async () => {
    const ctx = createMockContext();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({documents: []}),
    });

    await getDataCollection(ctx, 'Module');

    const [, config] = mockFetch.mock.calls[0];
    const body = JSON.parse(config.body);
    expect(body.pipeline).toEqual([{$limit: 256}]);
  });

  it('throws on HTTP error response', async () => {
    const ctx = createMockContext();
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    await expect(getDataCollection(ctx, 'Module')).rejects.toThrow(
      'Data API error (Module)',
    );
  });

  it('throws on network failure', async () => {
    const ctx = createMockContext();
    mockFetch.mockRejectedValueOnce(new Error('Network timeout'));

    await expect(getDataCollection(ctx, 'Module')).rejects.toThrow(
      'Data API error (Module): Network timeout',
    );
  });
});

describe('getDataDocument', () => {
  it('sends correct request to findOne endpoint', async () => {
    const ctx = createMockContext();
    const filter = {id: 'gid://shopify/Product/123'};
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({document: {_id: '1', name: 'Test'}}),
    });

    await getDataDocument(ctx, 'Module', filter);

    const [url, config] = mockFetch.mock.calls[0];
    expect(url).toBe(
      'https://data.mongodb-api.com/app/test/endpoint/data/v1/action/findOne',
    );

    const body = JSON.parse(config.body);
    expect(body.collection).toBe('Module');
    expect(body.filter).toEqual(filter);
  });

  it('returns the document from response', async () => {
    const ctx = createMockContext();
    const doc = {_id: '1', name: 'Navigator', hp: 16};
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({document: doc}),
    });

    const result = await getDataDocument(ctx, 'Module', {id: '123'});
    expect(result).toEqual(doc);
  });

  it('returns empty object when document is null', async () => {
    const ctx = createMockContext();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({document: null}),
    });

    const result = await getDataDocument(ctx, 'Module', {id: 'nonexistent'});
    expect(result).toEqual({});
  });

  it('throws on HTTP error response', async () => {
    const ctx = createMockContext();
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    await expect(
      getDataDocument(ctx, 'Module', {id: '123'}),
    ).rejects.toThrow('Data API error (Module)');
  });
});
