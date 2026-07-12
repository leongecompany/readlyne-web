import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseUpdate } from '@/lib/supabase';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('Stripe not configured');
  return new Stripe(key, { apiVersion: '2026-06-24.dahlia' });
}

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature || !WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
    }

    const stripe = getStripe();

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const reportId = session.metadata?.report_id;
        const paymentIntentId = session.payment_intent as string;

        if (!reportId) {
          console.error('No report_id in session metadata');
          break;
        }

        await supabaseUpdate('orders', 'stripe_session_id', session.id, {
          status: 'paid',
          stripe_payment_intent_id: paymentIntentId,
          paid_at: new Date().toISOString(),
        });

        await supabaseUpdate('reports', 'id', reportId, { status: 'paid' });

        console.log(`✅ Report ${reportId} unlocked via payment`);
        break;
      }

      case 'checkout.session.expired': {
        const expiredSession = event.data.object as Stripe.Checkout.Session;
        await supabaseUpdate('orders', 'stripe_session_id', expiredSession.id, { status: 'failed' });
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
