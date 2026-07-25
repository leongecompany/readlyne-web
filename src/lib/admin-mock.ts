// Admin Dashboard — Mock Data
// Replace with real API calls when backend is ready

export interface User {
  id: string;
  firstSeen: string;
  lastSeen: string;
  country: string;
  lang: string;
  analyzeCount: number;
  replyCount: number;
  deepCount: number;
  paid: boolean;
}

export interface RevenueRecord {
  id: string;
  time: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'refunded' | 'failed';
  userId: string;
}

export interface ErrorRecord {
  id: string;
  time: string;
  message: string;
  endpoint: string;
}

export interface DailyStat {
  date: string;
  users: number;
  analyzes: number;
}

const now = new Date();

function daysAgo(n: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export const stats = {
  totalVisitors: 127,
  newUsers: 8,
  todayAnalyzes: 32,
  todayReplies: 18,
  todayRevenue: 24.97,
  todayActiveUsers: 14,
  liveOnline: 3,
};

export const dailyStats: DailyStat[] = Array.from({ length: 30 }, (_, i) => ({
  date: daysAgo(29 - i).slice(0, 10),
  users: Math.floor(Math.random() * 30) + 5,
  analyzes: Math.floor(Math.random() * 50) + 10,
}));

export const featureRanking = [
  { name: '潜台词分析', count: 342, pct: 58 },
  { name: '回复建议', count: 186, pct: 32 },
  { name: '深度策略', count: 58, pct: 10 },
];

export const recentUsers: User[] = Array.from({ length: 20 }, (_, i) => ({
  id: `user_${String(i + 1).padStart(4, '0')}`,
  firstSeen: daysAgo(Math.floor(Math.random() * 60)),
  lastSeen: daysAgo(Math.floor(Math.random() * 3)),
  country: ['Australia', 'China', 'USA', 'Singapore', 'UK', 'Canada', 'Japan', 'Germany'][Math.floor(Math.random() * 8)],
  lang: Math.random() > 0.5 ? 'cn' : 'en',
  analyzeCount: Math.floor(Math.random() * 20),
  replyCount: Math.floor(Math.random() * 10),
  deepCount: Math.floor(Math.random() * 3),
  paid: Math.random() > 0.7,
}));

export const revenueRecords: RevenueRecord[] = Array.from({ length: 30 }, (_, i) => ({
  id: `py_${String(i + 1).padStart(5, '0')}`,
  time: daysAgo(Math.floor(Math.random() * 30)),
  amount: [4.99, 9.99, 29.99, 49.99][Math.floor(Math.random() * 4)],
  currency: ['AUD', 'USD', 'CNY'][Math.floor(Math.random() * 3)],
  status: (['paid', 'paid', 'paid', 'paid', 'refunded', 'failed'] as const)[Math.floor(Math.random() * 6)],
  userId: `user_${String(Math.floor(Math.random() * 100)).padStart(4, '0')}`,
}));

export const revenueSummary = {
  today: 24.97,
  thisWeek: 142.68,
  thisMonth: 589.32,
  payers: 19,
  refunds: 2,
};

export const errorRecords: ErrorRecord[] = Array.from({ length: 20 }, (_, i) => ({
  id: `err_${String(i + 1).padStart(3, '0')}`,
  time: daysAgo(Math.floor(Math.random() * 7)),
  message: [
    'DeepSeek API 400: invalid model name',
    'Stripe webhook signature verification failed',
    'reserve_credit: insufficient credits',
    'API rate limit exceeded for IP',
    'OpenAI connection timeout after 30s',
    'Database query timeout on api_requests',
    'Stripe checkout session expired',
    'Invalid JSON response from AI model',
    'CORS preflight rejected for unknown origin',
    'PostgreSQL connection pool exhausted',
  ][Math.floor(Math.random() * 10)],
  endpoint: [
    '/web/analyze', '/web/reply', '/web/deep-strategy',
    '/web/credits', '/web/create-checkout',
    '/stripe/webhook', '/api/v1/health',
  ][Math.floor(Math.random() * 7)],
}));

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = { AUD: 'A$', USD: '$', CNY: '¥' };
  return `${symbols[currency] || '$'}${amount.toFixed(2)}`;
}
