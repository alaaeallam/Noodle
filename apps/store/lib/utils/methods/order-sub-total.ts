import { IOrder } from "../interfaces/order.interface";

// Mirrors the server's pricing in placeOrder (apps/api/graphql/resolvers/order.js):
// an addon's default options are included in the variation price, so only
// non-default options add to the line. Counting every option made the
// subtotal exceed what the customer was charged (and the order total).
export const orderSubTotal = (order: IOrder) => {
  let total = 0;
  order.items.forEach((item) => {
    let itemPrice = item.variation.price;
    item.addons.forEach((addon) => {
      const defaults = (addon as { defaultOptions?: string[] }).defaultOptions ?? [];
      addon.options.forEach((option) => {
        if (!defaults.includes(String(option._id))) itemPrice += option.price;
      });
    });
    total += itemPrice * item.quantity;
  });

  return total;
};
