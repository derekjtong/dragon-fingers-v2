"use client";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { signIn, signOut, useSession } from "next-auth/react";
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
        <DropdownMenu open={openDropdown} onOpenChange={() => setOpenDropdown(false)}>
          <DropdownMenuTrigger onMouseEnter={() => setOpenDropdown(true)}>
            <Avatar className="h-14 w-14 cursor-pointer focus:outline-none">
              <AvatarImage src={session.data.user?.image || undefined} />
              <AvatarFallback>{session.data.user?.name}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent onMouseLeave={() => setOpenDropdown(false)}>
            <DropdownMenuLabel>Hello {session.data.user?.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer justify-center">
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer justify-center">Settings</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer justify-center">
              <a target="_blank" href="https://github.com/derekjtong/dragon-fingers-v2">
                GitHub
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer justify-center" onSelect={() => signOut()}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
