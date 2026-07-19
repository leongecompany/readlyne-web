'use client';

import { useState } from 'react';

const FAQS = [
  { q: 'What is Readlyne?', a: 'An AI-powered relationship communication assistant. Paste chat messages to get signal analysis, intention detection, risk assessment, and reply suggestions — plus deep psychological strategy reports.' },
  { q: 'How much does it cost?', a: 'First 10 basic analyses are free. After that, Standard Pack ($9.99/11 analyses) or Deep Strategy Pack ($9.99/5 reports).' },
  { q: 'How do I pay?', a: 'Payments are processed securely via Stripe. Credit cards, Alipay, and Apple Pay supported. Prices are in USD.' },
  { q: 'Is my chat data safe?', a: 'Messages are analyzed in real-time and not stored. Your content is never used to train AI models.' },
  { q: 'Can this replace a therapist?', a: 'No. Readlyne provides AI-generated suggestions for reference. It is not a substitute for professional counseling.' },
  { q: 'What platforms are supported?', a: 'Web and iOS. Android coming soon.' },
  { q: 'Can I get a refund?', a: 'Purchases are non-refundable. If a technical error prevents use of credits, contact support@readlyne.com.' },
  { q: 'How do I delete my data?', a: 'Email privacy@readlyne.com. We will process within 14 days.' },
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

export default function EnFaqPage() {
  return (
    <div className="legal-page">
      <div className="legal-card">
        <p style={{ fontSize: 13, color: 'var(--text-tertiary)', textAlign: 'right', margin: 0 }}>
          <a href="/faq" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>中文</a>
        </p>
        <h1>FAQ</h1>
        <div className="faq-list">
          {FAQS.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
        </div>
      </div>
    </div>
  );
}
