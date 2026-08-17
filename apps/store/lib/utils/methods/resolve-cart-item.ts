import { ICartItem } from "@/lib/context/global/cart.context";
import { IMenuAddon, IMenuCategory, IMenuOption } from "@/lib/utils/interfaces/pos.interface";

export interface IResolvedCartItem {
  key: string;
  title: string;
  variationTitle?: string;
  addonSummary?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export function resolveCartItem(
  cartItem: ICartItem,
  categories: IMenuCategory[],
  addonsCatalog: IMenuAddon[],
  optionsCatalog: IMenuOption[],
): IResolvedCartItem | null {
  const food = categories
    .flatMap((c) => c.foods)
    .find((f) => f._id === cartItem.food);
  if (!food) return null;

  const variation = food.variations.find((v) => v._id === cartItem.variation);
  if (!variation) return null;

  let unitPrice = variation.price;
  const addonLines: string[] = [];

  cartItem.addons.forEach((selection) => {
    const addon = addonsCatalog.find((a) => a._id === selection._id);
    if (!addon) return;
    const optionTitles: string[] = [];
    selection.options.forEach((optionId) => {
      const option = optionsCatalog.find((o) => o._id === optionId);
      if (!option) return;
      const isDefault = addon.defaultOptions?.includes(optionId);
      if (!isDefault) unitPrice += option.price;
      optionTitles.push(option.title);
    });
    if (optionTitles.length) addonLines.push(optionTitles.join(", "));
  });

  return {
    key: cartItem.key,
    title: food.title,
    variationTitle: variation.title,
    addonSummary: addonLines.length ? addonLines.join(" | ") : undefined,
    quantity: cartItem.quantity,
    unitPrice,
    lineTotal: unitPrice * cartItem.quantity,
  };
}
