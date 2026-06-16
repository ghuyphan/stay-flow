export type PaymentSession = {
  id: string;
  checkoutUrl: string;
  expiresAt: Date;
};

export interface PaymentProvider {
  createSession(input: {
    bookingId: string;
    amount: number;
    currency: string;
    returnUrl: string;
  }): Promise<PaymentSession>;
  verifyWebhook(input: { payload: string; signature: string | null }): Promise<{
    valid: boolean;
    providerPaymentId?: string;
    status?: "paid" | "failed" | "refunded";
  }>;
}

export class MockPaymentProvider implements PaymentProvider {
  async createSession(input: {
    bookingId: string;
    amount: number;
    currency: string;
    returnUrl: string;
  }): Promise<PaymentSession> {
    return {
      id: `mock_${input.bookingId}`,
      checkoutUrl: `${input.returnUrl}?session=mock_${input.bookingId}`,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    };
  }

  async verifyWebhook() {
    return { valid: true, providerPaymentId: `mock_payment_${Date.now()}`, status: "paid" as const };
  }
}
