"use client";
import { AUTH_LIVE } from "@/lib/config";
import { supabaseBrowser } from "@/lib/client/supabase";

export interface ShopUser { email: string; google?: boolean }
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function currentUser(): Promise<ShopUser | null> {
  if (!AUTH_LIVE) return null;
  const { data } = await supabaseBrowser().auth.getUser();
  const u = data.user;
  return u?.email ? { email: u.email, google: u.app_metadata?.provider === "google" } : null;
}

export function onUserChange(cb: (u: ShopUser | null) => void) {
  if (!AUTH_LIVE) return () => {};
  const { data } = supabaseBrowser().auth.onAuthStateChange((_e, session) => {
    const u = session?.user;
    cb(u?.email ? { email: u.email, google: u.app_metadata?.provider === "google" } : null);
  });
  return () => data.subscription.unsubscribe();
}

export async function sendCode(email: string): Promise<void> {
  if (!AUTH_LIVE) return wait(900);
  const { error } = await supabaseBrowser().auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
  if (error) throw new Error(error.status === 429 ? "Too many codes requested. Wait a minute and try again." : error.message);
}

export async function verifyCode(email: string, token: string): Promise<ShopUser> {
  if (!AUTH_LIVE) {
    await wait(800);
    if (token === "000000") throw new Error("That code doesn't match. Check the latest email or resend it.");
    return { email };
  }
  const { data, error } = await supabaseBrowser().auth.verifyOtp({ email, token, type: "email" });
  if (error || !data.user?.email) throw new Error("That code doesn't match or has expired. Check the latest email or resend it.");
  return { email: data.user.email };
}

export async function signInWithGoogle(): Promise<ShopUser | null> {
  if (!AUTH_LIVE) {
    await wait(1000);
    return { email: "you@gmail.com", google: true };
  }
  const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/?checkout=1")}`;
  const { error } = await supabaseBrowser().auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
  if (error) throw new Error(error.message);
  return null; 
}

export async function signOut() {
  if (AUTH_LIVE) await supabaseBrowser().auth.signOut();
}
