'use client';

import { useState } from 'react';

const FAQS = [
  { q: 'What is Readlyne?', a: 'Readlyne is an AI-powered relationship communication assistant. Paste your chat messages and get insights on tone, intentions, risks, and reply suggestions — plus deep psychological strategy analysis.' },
  { q: 'Is Readlyne free?', a: 'Basic chat analysis is free. For deep psychological strategy reports, you can purchase analysis packs (¥9.9 / 5 analyses) or subscribe to Pro ($29.99/month) for unlimited access.' },
  { q: 'How does the payment work?', a: 'Payments are processed through Stripe. You can pay with credit cards or Alipay (for the ¥9.9 pack). Your card details are never stored on our servers.' },
  { q: 'Is my chat data private?', a: 'Yes. Chat content you paste is analyzed in real-time and not permanently stored on our servers. Your privacy is our priority.' },
  { q: 'Is this a replacement for therapy?', a: 'No. Readlyne provides AI-generated insights for informational purposes. It is not a substitute for professional relationship counseling or therapy.' },
  { q: 'Which platforms are supported?', a: 'Readlyne is available as a web app and on iOS (App Store). Android support is planned.' },
  { q: 'Can I get a refund?', a: 'Purchased credits are non-refundable. If a technical error prevents you from using your credits, contact us and we will resolve it.' },
  { q: 'How accurate is the AI analysis?', a: 'Readlyne uses advanced AI (DeepSeek) to analyze text based on psychological frameworks. Accuracy depends on the quality of input. Always use your own judgment alongside AI insights.' },
  { q: 'How do I contact support?', a: 'Email us at support@readlyne.com. We aim to respond within 24 hours.' },
  { q: 'Can I delete my data?', a: 'Yes. Contact us at privacy@readlyne.com with your account email and we will delete your data within 14 days.' },
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
        <h1>Frequently Asked Questions</h1>
        <div className="faq-list">
          {FAQS.map((faq, i) => (
            <FaqItem key={i} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>
    </div>
  );
}
