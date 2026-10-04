export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "";

export const AUTH_LIVE = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
export const PAY_LIVE = AUTH_LIVE && Boolean(PAYSTACK_PUBLIC_KEY);
