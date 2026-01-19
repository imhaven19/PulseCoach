import { User } from '../types';

export async function createCheckoutSession(
  provider: 'stripe' | 'nowpayments',
  user: User
) {
  const res = await fetch('/api/payments/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, userId: user.id })
  });

  if (!res.ok) throw new Error('Failed to create checkout session');
  return res.json();
}
