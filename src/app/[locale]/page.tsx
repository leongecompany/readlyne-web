import { use } from 'react';
import { redirect } from 'next/navigation';

export default function LocaleHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  redirect(`/${locale}/analyze`);
}
