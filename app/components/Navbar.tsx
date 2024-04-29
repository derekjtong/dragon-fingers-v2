import Link from "next/link";
import AuthButton from "./AuthButton";

function NavBar() {
  return (
    <div className="fixed flex w-screen justify-between px-72 pt-10 text-2xl">
      <Link href="/" className="p-3 hover:bg-slate-300">
        Dragon Fingers
      </Link>
      <AuthButton />
    </div>
  );
}

export default NavBar;
