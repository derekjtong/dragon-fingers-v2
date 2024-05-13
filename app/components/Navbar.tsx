import Link from "next/link";
import AuthButton from "./AuthButton";

function NavBar() {
  return (
    <div className="fixed z-50 flex w-screen justify-between border bg-white px-9 py-10 text-2xl lg:px-72">
      <Link href="/" className="p-3 font-mono text-4xl hover:bg-slate-300">
        Dragon Fingers
      </Link>
      <AuthButton />
    </div>
  );
}

export default NavBar;
