'use client';

import { useState } from 'react';
import { useLocale } from '@/lib/locale';

export default function FaqPage() {
  const { locale } = useLocale();
  const cn = locale === 'cn';

  const faqs = cn ? [
    { q: 'Readlyne 是什么？', a: 'AI 聊天洞察助手。粘贴聊天内容，分析信号、意图、风险和回复技巧，还有深度心理学策略报告。' },
    { q: '收费吗？', a: '前 10 次基础分析免费。之后可购买标准包（$9.99/11次）或深度策略包（$9.99/5次）。' },
    { q: '怎么付款？', a: '通过 Stripe 安全处理，支持信用卡和支付宝。价格是美元，按实时汇率换算。' },
    { q: '聊天内容安全吗？', a: '内容实时分析后不保存。你粘贴的内容不会被用于训练 AI 模型。' },
    { q: '能替代心理咨询吗？', a: '不能。Readlyne 提供 AI 生成的参考建议，不替代专业心理咨询。' },
    { q: '可以退款吗？', a: '原则上不支持。因系统故障导致无法使用，联系 support@readlyne.com 处理。' },
    { q: '支持哪些平台？', a: '网页版和 iOS App。Android 暂不支持。' },
    { q: '如何删除数据？', a: '发邮件到 privacy@readlyne.com，14 天内处理。' },
  ] : [
    { q: 'What is Readlyne?', a: 'AI-powered relationship communication assistant. Paste chats for signal analysis, intention detection, risk assessment, and reply suggestions — plus deep psychological strategy reports.' },
    { q: 'How much does it cost?', a: 'First 10 basic analyses are free. Then Standard Pack ($9.99/11 analyses) or Deep Strategy ($9.99/5 reports).' },
    { q: 'How do I pay?', a: 'Securely via Stripe. Credit cards, Alipay, Apple Pay. Prices in USD.' },
    { q: 'Is my chat data safe?', a: 'Analyzed in real-time and not stored. Never used to train AI models.' },
    { q: 'Can this replace a therapist?', a: 'No. Readlyne provides AI suggestions for reference — not professional counseling.' },
    { q: 'Can I get a refund?', a: 'Non-refundable. If a technical error prevents use, contact support@readlyne.com.' },
    { q: 'What platforms?', a: 'Web and iOS. Android coming soon.' },
    { q: 'How do I delete my data?', a: 'Email privacy@readlyne.com. Processed within 14 days.' },
  ];

  function FaqItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
      <div className={`faq-item${open ? ' open' : ''}`}>
        <button className="faq-question" onClick={() => setOpen(!open)}>
          <span>{q}</span><span className="faq-arrow">{open ? '−' : '+'}</span>
        </button>
        {open && <p className="faq-answer">{a}</p>}
      </div>
    );
  }

  return (
    <div className="legal-page">
      <div className="legal-card">
        <h1>{cn ? '常见问题' : 'FAQ'}</h1>
        <div className="faq-list">{faqs.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}</div>
      </div>
    </div>
  );
}
