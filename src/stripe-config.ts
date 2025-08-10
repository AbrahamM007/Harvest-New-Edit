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
    id: 'premium-delivery',
    priceId: 'price_1QVqGhP123456789abcdef01', // Replace with your actual Stripe price ID
    name: 'Premium Delivery',
    description: 'Get priority delivery and exclusive access to premium products',
    price: 9.99,
    mode: 'subscription',
  },
  {
    id: 'organic-box',
    priceId: 'price_1QVqGhP123456789abcdef02', // Replace with your actual Stripe price ID
    name: 'Organic Produce Box',
    description: 'Curated selection of organic fruits and vegetables',
    price: 29.99,
    mode: 'payment',
  },
];

export function getProductById(id: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.id === id);
}

export function getProductByPriceId(priceId: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.priceId === priceId);
}