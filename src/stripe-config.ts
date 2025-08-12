export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  price: number;
  mode: 'payment' | 'subscription';
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'fruit',
    priceId: 'price_fruit_025', // Replace with your actual Stripe price ID
    name: 'Fruit',
    description: 'Fresh seasonal fruit from local farmers',
    price: 0.25,
    mode: 'payment',
  },
];

export function getProductById(id: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.id === id);
}

export function getProductByPriceId(priceId: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.priceId === priceId);
}