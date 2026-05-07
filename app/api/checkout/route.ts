import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY 未配置');
  }

  return new Stripe(secretKey, {
    apiVersion: '2026-04-22.dahlia',
  });
}

export async function POST(request: NextRequest) {
  try {
    const { gameId, gameName } = await request.json();
    const stripe = getStripeClient();

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'cny',
            product_data: {
              name: `解锁高级游戏: ${gameName}`,
              description: `一次性购买，永久解锁「${gameName}」完整版`,
            },
            unit_amount: 990, // ¥9.90
          },
          quantity: 1,
        },
      ],
      success_url: `${request.nextUrl.origin}/premium?success=true&game=${gameId}`,
      cancel_url: `${request.nextUrl.origin}/premium?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
