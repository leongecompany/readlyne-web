'use client';

import { useEffect } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';

export default function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const router = useRouter();
  useEffect(() => {
    router.replace(`/${locale}/analyze/`);
  }, [router, locale]);
  return null;
}
