import {json} from '@shopify/remix-oxygen';
import type {ActionFunctionArgs} from '@shopify/remix-oxygen';
import {SITE_DECISIONS} from '~/config/site-decisions';

export async function action({request, context}: ActionFunctionArgs) {
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim();
  const handle = String(form.get('handle') ?? '').trim();
  const variantId = String(form.get('variantId') ?? '').trim();

  if (!email || !email.includes('@')) {
    return json(
      {ok: false, message: 'Please enter a valid email.'},
      {status: 400},
    );
  }

  if (SITE_DECISIONS.backInStockProvider === 'klaviyo') {
    const apiKey = (context.env as any).KLAVIYO_PRIVATE_API_KEY as
      | string
      | undefined;

    if (!apiKey) {
      // No key configured in env yet; accept request so UI flow is testable.
      return json({
        ok: true,
        message:
          'Thanks. Your request was received. Back-in-stock notifications are being finalized.',
      });
    }

    try {
      const payload = {
        data: {
          type: 'back-in-stock-subscription',
          attributes: {
            profile: {
              data: {
                type: 'profile',
                attributes: {email},
              },
            },
            channels: ['EMAIL'],
          },
          relationships: {
            variant: {
              data: {
                type: 'catalog-variant',
                id: variantId,
              },
            },
          },
        },
      };

      const response = await fetch(
        'https://a.klaviyo.com/api/back-in-stock-subscriptions/',
        {
          method: 'POST',
          headers: {
            Authorization: `Klaviyo-API-Key ${apiKey}`,
            'Content-Type': 'application/json',
            revision: '2024-10-15',
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const details = await response.text();
        console.error('Klaviyo notify-me failed', {
          status: response.status,
          details,
          handle,
        });
        return json(
          {
            ok: false,
            message: 'Unable to subscribe right now. Please try again soon.',
          },
          {status: 502},
        );
      }

      return json({
        ok: true,
        message: 'You are subscribed. We will email when it is back in stock.',
      });
    } catch (error) {
      console.error('Notify-me request error', error);
      return json(
        {
          ok: false,
          message: 'Unable to subscribe right now. Please try again soon.',
        },
        {status: 500},
      );
    }
  }

  return json(
    {ok: false, message: 'Notify-me provider is not configured.'},
    {status: 500},
  );
}
