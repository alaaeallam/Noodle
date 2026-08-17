import React, { useContext, useState } from "react";

export interface ICartAddonSelection {
  _id: string;
  options: string[];
}

export interface ICartItem {
  key: string;
  food: string;
  variation: string;
  addons: ICartAddonSelection[];
  quantity: number;
  specialInstructions?: string;
}

interface ICartContextValue {
  items: ICartItem[];
  addItem: (item: Omit<ICartItem, "key">) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
}

const Context = React.createContext<ICartContextValue>({
  items: [],
  addItem: () => {},
  updateQuantity: () => {},
  removeItem: () => {},
  clearCart: () => {},
});

const buildKey = (item: Omit<ICartItem, "key">) => {
  const sortedAddons = [...item.addons]
    .map((addon) => ({ _id: addon._id, options: [...addon.options].sort() }))
    .sort((a, b) => a._id.localeCompare(b._id));
  return [
    item.food,
    item.variation,
    JSON.stringify(sortedAddons),
    item.specialInstructions ?? "",
  ].join("::");
};

const Provider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<ICartItem[]>([]);

  const addItem = (item: Omit<ICartItem, "key">) => {
    const key = buildKey(item);
    setItems((prev) => {
      const existing = prev.find((line) => line.key === key);
      if (existing) {
        return prev.map((line) =>
          line.key === key
            ? { ...line, quantity: line.quantity + item.quantity }
            : line,
        );
      }
      return [...prev, { ...item, key }];
    });
  };

  const updateQuantity = (key: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((line) => line.key !== key);
      }
      return prev.map((line) =>
        line.key === key ? { ...line, quantity } : line,
      );
    });
  };

  const removeItem = (key: string) => {
    setItems((prev) => prev.filter((line) => line.key !== key));
  };

  const clearCart = () => setItems([]);

  return (
    <Context.Provider
      value={{ items, addItem, updateQuantity, removeItem, clearCart }}
    >
      {children}
    </Context.Provider>
  );
};

export const useCart = () => useContext(Context);
export default { Context, Provider };
