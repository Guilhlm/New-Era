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
  brand: CreditCardBrand;
  color: string;
  highlighted?: boolean;
};

export type CreditCardCreateInput = {
  holder: string;
  lastFour: string;
  limit: number;
  used: number;
  brand: CreditCardBrand;
  color: string;
};

export type CreditCardUpdateInput = CreditCardCreateInput;
