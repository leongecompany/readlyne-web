import { NextRequest, NextResponse } from 'next/server';
import { supabaseSelectOne } from '@/lib/supabase';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ ok: false, error: '缺少报告 ID' }, { status: 400 });
    }

    const { data: report, error } = await supabaseSelectOne('reports', 'id', id, 'id,status,created_at,expires_at,basic_result_json');

    if (error || !report) {
      return NextResponse.json({ ok: false, error: '报告不存在' }, { status: 404 });
    }

    const isExpired = new Date(report.expires_at) < new Date();
    if (isExpired) {
      return NextResponse.json({
        ok: true,
        status: 'expired',
        created_at: report.created_at,
        expires_at: report.expires_at,
        analysis: null,
        is_paid: false,
      });
    }

    return NextResponse.json({
      ok: true,
      id: report.id,
      status: report.status,
      created_at: report.created_at,
      expires_at: report.expires_at,
      analysis: report.basic_result_json,
      is_paid: report.status === 'paid',
    });
  } catch (err: any) {
    console.error('Report fetch error:', err);
    return NextResponse.json({ ok: false, error: '获取报告失败' }, { status: 500 });
  }
}
