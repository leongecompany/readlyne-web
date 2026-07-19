'use client';

import { useState } from 'react';

const FAQS = [
  { q: 'Readlyne 是什么？', a: 'AI 聊天洞察助手。粘贴聊天内容，分析信号、意图、风险和回复技巧，还有深度心理学策略报告。' },
  { q: '收费吗？', a: '前 10 次基础分析免费。之后可购买标准包（$9.99/11次）或深度策略包（$9.99/5次）。' },
  { q: '怎么付款？', a: '通过 Stripe 安全处理，支持信用卡和支付宝。价格是美元，按实时汇率换算。' },
  { q: '聊天内容安全吗？', a: '内容实时分析后不保存。你粘贴的内容不会被用于训练 AI 模型。' },
  { q: '能替代心理咨询吗？', a: '不能。Readlyne 提供 AI 生成的参考建议，不替代专业心理咨询或情感治疗。' },
  { q: '支持哪些平台？', a: '网页版和 iOS App。Android 暂不支持。' },
  { q: '可以退款吗？', a: '原则上不支持退款。因系统故障导致次数无法使用，联系 support@readlyne.com 处理。' },
  { q: '如何删除数据？', a: '发邮件到 privacy@readlyne.com，14 天内处理。' },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item${open ? ' open' : ''}`}>
      <button className="faq-question" onClick={() => setOpen(!open)}>
        <span>{q}</span>
        <span className="faq-arrow">{open ? '−' : '+'}</span>
      </button>
      {open && <p className="faq-answer">{a}</p>}
    </div>
  );
}

export default function FaqPage() {
  return (
    <div className="legal-page">
      <div className="legal-card">
        <p style={{ fontSize: 13, color: 'var(--text-tertiary)', textAlign: 'right', margin: 0 }}>
          <a href="/en/faq" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>EN</a>
        </p>
        <h1>常见问题</h1>
        <div className="faq-list">
          {FAQS.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
        </div>
      </div>
    </div>
  );
}
