export const FLAGS = {
    ENABLE_PRODUCT_STORE: process.env.NEXT_PUBLIC_ENABLE_PRODUCT_STORE === 'true',
    ENABLE_STRIPE_CHECKOUT: process.env.NEXT_PUBLIC_ENABLE_STRIPE_CHECKOUT === 'true',
    // Kill switch for checkout creation instantly
    DISABLE_CHECKOUT: process.env.DISABLE_CHECKOUT === 'true'
};

export const isFeatureEnabled = (flag: keyof typeof FLAGS) => {
    return FLAGS[flag];
};
