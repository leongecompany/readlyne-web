import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseSelectOne, supabaseInsert } from '@/lib/supabase';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('Stripe not configured');
  return new Stripe(key, { apiVersion: '2026-06-24.dahlia' });
}

const PRICE_AMOUNT = 990;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { report_id } = body;

    if (!report_id) {
      return NextResponse.json({ ok: false, error: '缺少 report_id' }, { status: 400 });
    }

    const { data: report, error: fetchError } = await supabaseSelectOne('reports', 'id', report_id, 'id,status');

    if (fetchError || !report) {
      return NextResponse.json({ ok: false, error: '报告不存在' }, { status: 404 });
    }

    if (report.status !== 'free') {
      return NextResponse.json({ ok: false, error: '该报告已解锁或已过期' }, { status: 400 });
    }

    const stripe = getStripe();
    const origin = req.headers.get('origin') || 'https://readlyne-web.vercel.app';
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'cny',
          product_data: {
            name: 'Readlyne 深度分析报告',
            description: '单次深度分析解锁 — 时间线、情绪变化、3种回复建议等',
          },
          unit_amount: PRICE_AMOUNT,
        },
        quantity: 1,
      }],
      metadata: { report_id },
      success_url: `${origin}/analyze?report_id=${report_id}&paid=true`,
      cancel_url: `${origin}/analyze?report_id=${report_id}&paid=false`,
    });

    const { error: orderError } = await supabaseInsert('orders', {
      report_id,
      stripe_session_id: session.id,
      amount: PRICE_AMOUNT,
      currency: 'cny',
      status: 'pending',
    });

    if (orderError) console.error('Order insert error:', orderError);

    return NextResponse.json({ ok: true, url: session.url, session_id: session.id });
  } catch (err: any) {
    console.error('Create checkout error:', err);
    return NextResponse.json({ ok: false, error: '创建支付失败，请稍后重试' }, { status: 500 });
  }
}
