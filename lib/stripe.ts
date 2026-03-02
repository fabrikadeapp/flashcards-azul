import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';

export const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2023-10-16' as any, // Use stable version
    appInfo: {
        name: 'Flashcards Azul',
        version: '1.0.0',
    },
});
