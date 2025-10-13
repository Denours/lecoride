export type PaymentMethodId = 'cash' | 'mobile_money' | 'card';

export interface PaymentOptionInt {
  id: PaymentMethodId;
  label: string;
  icon: string; // emoji or icon class
  description?: string;
}
