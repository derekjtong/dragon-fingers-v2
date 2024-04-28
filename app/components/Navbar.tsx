import Link from "next/link";

function NavBar() {
  return (
    <div className="fixed flex w-screen justify-between px-72 pt-10 text-2xl">
      <Link href="/" className="p-3 hover:bg-slate-300">
        Home
      </Link>
      <div className="cursor-pointer p-3 hover:bg-slate-300">Login(todo)</div>
    </div>
  );
}

export default NavBar;
