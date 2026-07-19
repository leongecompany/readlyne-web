'use client';

import { useLocale } from '@/lib/locale';

export default function ContactPage() {
  const { locale } = useLocale();
  const cn = locale === 'cn';

  return (
    <div className="legal-page">
      <div className="legal-card">
        <h1>{cn ? '联系我们' : 'Contact'}</h1>
        <div className="contact-methods">
          <div className="contact-item">
            <div className="contact-icon">📧</div>
            <div>
              <h3>{cn ? '技术支持' : 'Support'}</h3>
              <p><a href="mailto:support@readlyne.com">support@readlyne.com</a></p>
            </div>
          </div>
          <div className="contact-item">
            <div className="contact-icon">🔒</div>
            <div>
              <h3>{cn ? '隐私相关' : 'Privacy'}</h3>
              <p><a href="mailto:privacy@readlyne.com">privacy@readlyne.com</a></p>
            </div>
          </div>
        </div>
        <h2>{cn ? '关于' : 'About'}</h2>
        <p>{cn ? 'Readlyne 由 Leon AI Studio 运营。\n悉尼，澳大利亚。' : 'Readlyne is operated by Leon AI Studio.\nSydney, Australia.'}</p>
      </div>
    </div>
  );
}
