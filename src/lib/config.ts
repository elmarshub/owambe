// Which real services are switched on. With no keys set, the store runs in demo mode:
// sign-in accepts any 6-digit code except 000000 and payment is simulated, like the prototype.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "";

export const AUTH_LIVE = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
export const PAY_LIVE = AUTH_LIVE && Boolean(PAYSTACK_PUBLIC_KEY);
