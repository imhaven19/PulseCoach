import { User } from '../types';

export interface CryptoInvoice {
  id: string;
  invoiceUrl: string;
  paymentStatus: 'waiting' | 'confirming' | 'confirmed' | 'sending' | 'finished' | 'failed' | 'expired';
  payAddress: string;
  payAmount: number;
  payCurrency: string;
  priceAmount: number;
  priceCurrency: string;
  createdAt: string;
  expiresAt: string;
}

/**
 * Create a crypto payment invoice via NOWPayments
 */
export async function createInvoice(
  user: User,
  plan: 'starter' | 'premium',
  isTrial: boolean = false
): Promise<CryptoInvoice | null> {
  try {
    const priceAmount = plan === 'premium' ? 19.99 : 9.99;
    
    const res = await fetch('/api/payments/crypto/invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        email: user.email,
        plan,
        isTrial,
        priceAmount,
        priceCurrency: 'USD',
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create crypto invoice');
    }

    const data = await res.json();
    
    return {
      id: data.id || data.invoice_id,
      invoiceUrl: data.invoice_url,
      paymentStatus: data.payment_status || 'waiting',
      payAddress: data.pay_address,
      payAmount: data.pay_amount,
      payCurrency: data.pay_currency,
      priceAmount: data.price_amount,
      priceCurrency: data.price_currency,
      createdAt: data.created_at || new Date().toISOString(),
      expiresAt: data.expiration_estimate_date || new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };
  } catch (error) {
    console.error('NOWPayments invoice error:', error);
    return null;
  }
}

/**
 * Check the status of a crypto payment
 */
export async function checkPaymentStatus(
  paymentId: string
): Promise<{ status: string; isComplete: boolean }> {
  try {
    const res = await fetch(`/api/payments/crypto/status?payment_id=${paymentId}`);
    
    if (!res.ok) {
      throw new Error('Failed to check payment status');
    }

    const data = await res.json();
    const isComplete = ['confirmed', 'sending', 'finished'].includes(data.payment_status);
    
    return {
      status: data.payment_status,
      isComplete,
    };
  } catch (error) {
    console.error('Payment status check error:', error);
    return { status: 'unknown', isComplete: false };
  }
}

/**
 * Check if NOWPayments is configured
 */
export function isNowPaymentsConfigured(): boolean {
  return !!(
    typeof window !== 'undefined' &&
    (import.meta.env?.VITE_NOWPAYMENTS_API_KEY || process.env.NOWPAYMENTS_API_KEY)
  );
}
