import Link from "next/link";
import AuthButton from "./AuthButton";

function NavBar() {
  return (
    <div className="fixed flex w-screen justify-between px-72 pt-10 text-2xl">
      <Link href="/" className="p-3 hover:bg-slate-300">
        Home
      </Link>
      <AuthButton />
      {/* <Link href="/login" className="p-3 hover:bg-slate-300">
        Login(todo)
      </Link> */}
    </div>
  );
}

export default NavBar;
