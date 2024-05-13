"use client";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { FaSignOutAlt } from "react-icons/fa";

function AuthButton() {
  const session = useSession();

  if (session.status === "authenticated") {
    return (
      <div className="flex items-center justify-center">
        <Link href="/profile">
          <Avatar className="h-14 w-14 cursor-pointer focus:outline-none">
            <AvatarImage src={session.data.user?.image || undefined} />
            <AvatarFallback>{session.data.user?.name}</AvatarFallback>
          </Avatar>
        </Link>
        <Button className="ml-2" variant="ghost" onClick={() => signOut()}>
          <FaSignOutAlt size={25} />
        </Button>
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
