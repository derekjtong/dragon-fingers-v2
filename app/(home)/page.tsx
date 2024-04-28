import Link from "next/link";

export const metadata = {
  title: "Home Page",
};

export default function HomePage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <Link href="/game/temp-game" className="mb-28 p-3 text-4xl hover:bg-slate-200">
        Enter Race
      </Link>
      <Link href="/game/join" className="p-2 text-2xl hover:bg-slate-200">
        Join Custom
      </Link>
      <Link href="/game/create" className="p-2 text-2xl hover:bg-slate-200">
        Create Custom
      </Link>
    </div>
  );
}
