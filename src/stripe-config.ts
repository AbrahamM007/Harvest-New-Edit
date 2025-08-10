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
    id: 'prod_Sq2wNi7DkhI39p',
    priceId: 'price_1RuMqB6e93ERT0xHm21dMy4C',
    name: 'Fruit',
    description: 'Fresh, delicious fruit from local farmers',
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