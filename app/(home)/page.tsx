import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <Link href="/match/temp-match" className="mb-28 p-3 text-4xl hover:bg-slate-200">
        Enter Race
      </Link>
      <Link href="/match/join" className="p-2 text-2xl hover:bg-slate-200">
        Join Custom
      </Link>
      <Link href="/match/create" className="p-2 text-2xl hover:bg-slate-200">
        Create Custom
      </Link>
    </div>
  );
}
