"use client";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

function AuthButton() {
  const [openDropdown, setOpenDropdown] = useState(false);
  const session = useSession();
  if (session.status === "loading") {
    return <div></div>;
  }
  if (session.status === "authenticated") {
    return (
      <div className="flex">
        <Link href="/profile">
          <Avatar className="h-14 w-14 cursor-pointer focus:outline-none">
            <AvatarImage src={session.data.user?.image || undefined} />
            <AvatarFallback>{session.data.user?.name}</AvatarFallback>
          </Avatar>
        </Link>
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
