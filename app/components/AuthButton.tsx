"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

function AuthButton() {
  const { data: session } = useSession();
  if (session) {
    return (
      <div className="flex">
        <Link className="cursor-pointer p-3 hover:bg-gray-300" href="/profile">
          {session?.user?.name}{" "}
        </Link>
        <div className="cursor-pointer p-3 hover:bg-gray-300" onClick={() => signOut()}>
          Sign out
        </div>
      </div>
    );
  }
  return (
    <div className="cursor-pointer p-3 hover:bg-gray-300" onClick={() => signIn()}>
      Login
    </div>
  );
}

export default AuthButton;
