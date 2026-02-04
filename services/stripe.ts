import { User } from '../types';

/**
 * Check if Stripe is configured with API keys
 */
export function isStripeConfigured(): boolean {
  return !!(
    typeof window !== 'undefined' &&
    (import.meta.env?.VITE_STRIPE_PUBLIC_KEY || process.env.STRIPE_PUBLIC_KEY)
  );
}

/**
 * Process a Stripe subscription for a user
 */
export async function processStripeSubscription(
  user: User,
  plan: 'starter' | 'premium',
  isTrial: boolean = false
): Promise<{ success: boolean; sessionId?: string; error?: string }> {
  try {
    const res = await fetch('/api/payments/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        email: user.email,
        plan,
        isTrial,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create checkout session');
    }

    const data = await res.json();
    
    // Redirect to Stripe Checkout
    if (data.url) {
      window.location.href = data.url;
      return { success: true, sessionId: data.sessionId };
    }

    return { success: true, sessionId: data.sessionId };
  } catch (error) {
    console.error('Stripe subscription error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process payment',
    };
  }
}

/**
 * Verify a Stripe session after redirect
 */
export async function verifyStripeSession(
  sessionId: string
): Promise<{ success: boolean; subscriptionStatus?: string }> {
  try {
    const res = await fetch(`/api/payments/stripe/verify?session_id=${sessionId}`);
    
    if (!res.ok) {
      throw new Error('Failed to verify session');
    }

    const data = await res.json();
    return {
      success: data.status === 'complete',
      subscriptionStatus: data.subscriptionStatus,
    };
  } catch (error) {
    console.error('Stripe verification error:', error);
    return { success: false };
  }
}
