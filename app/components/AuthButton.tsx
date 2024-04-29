"use client";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

function AuthButton() {
  const session = useSession();
  if (session.status === "loading") {
    return <div></div>;
  }
  if (session.status === "authenticated") {
    return (
      <div className="flex">
        <Link className="cursor-pointer p-3 hover:bg-gray-300" href="/profile">
          <Avatar>
            <AvatarImage src={session.data.user?.image || undefined} />
            <AvatarFallback>{session.data.user?.name}</AvatarFallback>
          </Avatar>
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
