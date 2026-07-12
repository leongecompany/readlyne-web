import { NextRequest, NextResponse } from 'next/server';
import { supabaseInsert, supabaseSelectOne } from '@/lib/supabase';
import { callProxy } from '@/lib/proxy';

const MAX_INPUT_LENGTH = 5000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, context } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ ok: false, error: '请输入聊天内容' }, { status: 400 });
    }

    if (message.length > MAX_INPUT_LENGTH) {
      return NextResponse.json(
        { ok: false, error: '输入内容太长了，请减少部分内容后再试' },
        { status: 400 },
      );
    }

    let proxyResult;
    try {
      proxyResult = await callProxy('analyze_subtext', message.trim(), context?.trim());
    } catch {
      return NextResponse.json(
        { ok: false, error: '分析超时了，请稍后再试' },
        { status: 504 },
      );
    }

    if (!proxyResult.ok) {
      return NextResponse.json(
        { ok: false, error: '分析暂时不可用，请稍后重试' },
        { status: 502 },
      );
    }

    let parsed: any;
    try {
      parsed = JSON.parse(proxyResult.content);
    } catch {
      return NextResponse.json(
        { ok: false, error: '分析结果格式异常，请稍后重试' },
        { status: 502 },
      );
    }

    const analysisResult = parsed.analysis_result || parsed;

    // Store in Supabase
    const { data: report, error: dbError } = await supabaseInsert('reports', {
      status: 'free',
      basic_result_json: analysisResult,
      transcript_redacted_json: {
        char_count: message.length,
        created_at: new Date().toISOString(),
      },
    });

    if (dbError) {
      console.error('DB insert error:', dbError);
    }

    return NextResponse.json({
      ok: true,
      report_id: report?.id || null,
      analysis: analysisResult,
      is_paid: false,
    });
  } catch (err: any) {
    console.error('Analyze error:', err);
    return NextResponse.json(
      { ok: false, error: '服务器错误，请稍后重试' },
      { status: 500 },
    );
  }
}
