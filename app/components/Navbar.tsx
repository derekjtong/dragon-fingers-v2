import Link from "next/link";
import AuthButton from "./AuthButton";

function NavBar() {
  return (
    <div className="fixed flex w-screen justify-between px-9 pt-10 text-2xl lg:px-72">
      <Link href="/" className="p-3 font-mono text-4xl hover:bg-slate-300">
        Dragon Fingers
      </Link>
      <AuthButton />
    </div>
  );
}

export default NavBar;
