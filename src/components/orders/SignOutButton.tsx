"use client";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/client/auth";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button className="bag text-center" onClick={async () => { await signOut(); router.push("/"); router.refresh(); }}>
      Sign out
    </button>
  );
}
