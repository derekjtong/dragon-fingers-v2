"use client";
import Link from "next/link";
import { useScroll } from "../hooks/useScrollTop";
import AuthButton from "./AuthButton";

function NavBar() {
  const { scrollDirection } = useScroll(10);

  return (
    <div
      className={`fixed z-50 flex w-screen justify-between border bg-white py-2 text-2xl transition-transform duration-300 lg:px-32 lg:py-10 xl:px-72 ${
        scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <Link href="/" className="p-3 font-mono text-4xl hover:bg-slate-300">
        Dragon Fingers
      </Link>
      <AuthButton />
    </div>
  );
}

export default NavBar;
