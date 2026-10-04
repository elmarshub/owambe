// Next 16 "proxy" (formerly middleware): keeps the Supabase session cookie fresh on every page request.
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { AUTH_LIVE, SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/config";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!AUTH_LIVE) return response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  await supabase.auth.getUser();
  return response;
}

export const config = {
  // Skip static files, images and the Paystack webhook (it has no session).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|noise.png|api/paystack/webhook).*)"],
};
