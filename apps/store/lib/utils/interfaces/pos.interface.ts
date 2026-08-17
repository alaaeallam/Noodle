export interface IMenuVariation {
  _id: string;
  title: string;
  price: number;
  discounted?: number;
  addons?: string[];
  isOutOfStock?: boolean;
}

export interface IMenuFood {
  _id: string;
  title: string;
  description?: string;
  image?: string;
  isOutOfStock?: boolean;
  variations: IMenuVariation[];
}

export interface IMenuCategory {
  _id: string;
  title: string;
  foods: IMenuFood[];
}

export interface IMenuOption {
  _id: string;
  title: string;
  description?: string;
  price: number;
}

export interface IMenuAddon {
  _id: string;
  title: string;
  description?: string;
  quantityMinimum: number;
  quantityMaximum: number;
  options: string[];
  defaultOptions?: string[];
}

export interface IStoreMenuResponse {
  restaurant: {
    _id: string;
    name: string;
    tax?: number;
    categories: IMenuCategory[];
    addons: IMenuAddon[];
    options: IMenuOption[];
  };
}
