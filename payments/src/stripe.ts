//legacy NOT USED ANYMORE

// import Stripe from 'stripe';

// export const stripe = new Stripe(process.env.STRIPE_KEY!, {
//   apiVersion: '2025-07-30.basil',
// });
import Stripe from 'stripe';
export const stripe = new Stripe(process.env.STRIPE_KEY!, {
  apiVersion: '2025-07-30.basil',
});