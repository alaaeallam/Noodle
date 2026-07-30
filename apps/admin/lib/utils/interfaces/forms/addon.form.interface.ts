import { IDropdownSelectItem } from '../global.interface';

export interface IAddonForm {
  _id?: string;
  title: string;
  description: string;
  quantityMinimum: number;
  quantityMaximum: number;
  options: IDropdownSelectItem[] | null;
  defaultOptions: IDropdownSelectItem[] | null;
}

export interface IAddonsErrors {
  _id?: string[];
  title: string[];
  description: string[];
  quantityMinimum: string[];
  quantityMaximum: string[];
  options: string[];
}
