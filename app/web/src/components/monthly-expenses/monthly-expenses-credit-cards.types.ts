export type CreditCardBrand = 'mastercard' | 'visa';

export type CreditCardColorOption = {
  id: string;
  label: string;
  color: string;
};

export type CreditCardVm = {
  id: string;
  lastFour: string;
  holder: string;
  limit: number;
  used: number;
  dueDay: number;
  invoice?: {
    id: string;
    monthKey: string;
    dueDate: string;
    closingDate: string;
    amount: number;
    totalAmount: number;
    paidAmount: number;
    cycleStatus: 'open' | 'closed';
    status: 'open' | 'paid';
    paidAt: string | null;
  } | null;
  openInvoices?: Array<{
    id: string;
    monthKey: string;
    dueDate: string;
    closingDate: string;
    amount: number;
    totalAmount: number;
    paidAmount: number;
    cycleStatus: 'open' | 'closed';
    status: 'open' | 'paid';
    paidAt: string | null;
  }>;
  brand: CreditCardBrand;
  color: string;
  highlighted?: boolean;
};

export type CreditCardCreateInput = {
  holder: string;
  lastFour: string;
  limit: number;
  used: number;
  dueDay: number;
  brand: CreditCardBrand;
  color: string;
};

export type CreditCardUpdateInput = CreditCardCreateInput;
