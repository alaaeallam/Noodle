export interface IOptionForm {
  _id?: string;
  title: string;
  description: string;
  price: number;
  isDefault?: boolean;
}

export interface IOptionErrors {
  _id?: string[];
  title: string[];
  description: string[];
  price: string[];
}
