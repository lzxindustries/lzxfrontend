import {afterEach, describe, expect, it, vi} from 'vitest';
import {action} from '../($lang).api.notify-me';

type NotifyResponse = {
  ok: boolean;
  message: string;
};

function buildRequest(form: Record<string, string>) {
  const body = new FormData();
  for (const [key, value] of Object.entries(form)) {
    body.set(key, value);
  }
  return new Request('http://localhost/api/notify-me', {
    method: 'POST',
    body,
  });
}

async function runAction({
  form,
  env = {},
}: {
  form: Record<string, string>;
  env?: Record<string, string | undefined>;
}) {
  const response = await action({
    request: buildRequest(form),
    context: {env},
  } as any);

  const payload = (await response.json()) as NotifyResponse;
  return {response, payload};
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('notify-me action', () => {
  it('returns 400 for invalid email', async () => {
    const {response, payload} = await runAction({
      form: {
        email: 'bad-email',
        handle: 'videomancer',
        variantId: 'gid://shopify/ProductVariant/1',
      },
    });

    expect(response.status).toBe(400);
    expect(payload.ok).toBe(false);
    expect(payload.message).toContain('valid email');
  });

  it('returns 503 with honest copy when klaviyo key is missing', async () => {
    const {response, payload} = await runAction({
      form: {
        email: 'user@example.com',
        handle: 'videomancer',
        variantId: 'gid://shopify/ProductVariant/1',
      },
    });

    expect(response.status).toBe(503);
    expect(payload.ok).toBe(false);
    expect(payload.message).toContain('not available yet');
  });

  it('returns success when klaviyo accepts subscription', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('{}', {
        status: 202,
        headers: {'Content-Type': 'application/json'},
      }),
    );

    const {response, payload} = await runAction({
      form: {
        email: 'user@example.com',
        handle: 'videomancer',
        variantId: 'gid://shopify/ProductVariant/1',
      },
      env: {KLAVIYO_PRIVATE_API_KEY: 'test-key'},
    });

    expect(globalThis.fetch).toHaveBeenCalledOnce();
    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.message).toContain('subscribed');
  });

  it('returns 502 when klaviyo rejects subscription', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('bad request', {
        status: 400,
      }),
    );

    const {response, payload} = await runAction({
      form: {
        email: 'user@example.com',
        handle: 'videomancer',
        variantId: 'gid://shopify/ProductVariant/1',
      },
      env: {KLAVIYO_PRIVATE_API_KEY: 'test-key'},
    });

    expect(response.status).toBe(502);
    expect(payload.ok).toBe(false);
    expect(payload.message).toContain('Unable to subscribe');
  });

  it('returns 500 when request throws', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network down'));

    const {response, payload} = await runAction({
      form: {
        email: 'user@example.com',
        handle: 'videomancer',
        variantId: 'gid://shopify/ProductVariant/1',
      },
      env: {KLAVIYO_PRIVATE_API_KEY: 'test-key'},
    });

    expect(response.status).toBe(500);
    expect(payload.ok).toBe(false);
    expect(payload.message).toContain('Unable to subscribe');
  });
});
