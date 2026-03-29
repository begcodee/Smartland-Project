/**
 * Paystack REST API (Ghana GHS — amount in pesewas).
 * @see https://paystack.com/docs/api/
 */

const PAYSTACK_BASE = 'https://api.paystack.co';

function secret(): string {
  const k = process.env.PAYSTACK_SECRET_KEY;
  if (!k) throw new Error('PAYSTACK_SECRET_KEY is not configured');
  return k;
}

export type InitializeInput = {
  email: string;
  amountGhs: number;
  reference: string;
  callbackUrl: string;
  /** Limit Paystack checkout to Mobile Money or bank-style channels */
  channels: string[];
  /** Paystack metadata values are typically strings */
  metadata?: Record<string, string>;
};

export async function initializeTransaction(input: InitializeInput) {
  const amountPesewas = Math.round(input.amountGhs * 100);
  if (amountPesewas < 100) {
    throw new Error('Amount too small (minimum 1 GHS)');
  }

  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: input.email,
      amount: amountPesewas,
      currency: 'GHS',
      reference: input.reference,
      callback_url: input.callbackUrl,
      channels: input.channels,
      metadata: input.metadata
    })
  });

  const json = (await res.json()) as {
    status: boolean;
    message: string;
    data?: { authorization_url: string; access_code: string; reference: string };
  };

  if (!res.ok || !json.status || !json.data?.authorization_url) {
    throw new Error(json.message || 'Paystack initialize failed');
  }

  return json.data;
}

export async function verifyTransaction(reference: string) {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret()}` }
  });

  const json = (await res.json()) as {
    status: boolean;
    message: string;
    data?: {
      status: string;
      reference: string;
      amount: number;
      currency: string;
      channel?: string;
      metadata?: Record<string, unknown>;
    };
  };

  if (!res.ok || !json.status) {
    throw new Error(json.message || 'Paystack verify failed');
  }

  return json;
}
