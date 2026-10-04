"use client";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/shop-client";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button className="bag" onClick={async () => { await signOut(); router.push("/"); router.refresh(); }}>
      Sign out
    </button>
  );
}
