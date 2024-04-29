import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <Link href="/match/temp-match" className="p-20">
        <Button size={"lg"} className="h-40 w-96 text-4xl">
          Enter Race
        </Button>
      </Link>
      <Link href="/match/solo" className="p-2">
        <Button variant={"outline"} className="h-12 w-48">
          Solo
        </Button>
      </Link>
      <Link href="/match/join" className="p-2">
        <Button variant={"outline"} className="h-12 w-48">
          Join Custom
        </Button>
      </Link>
      <Link href="/match/create" className="p-2 ">
        <Button variant={"outline"} className="h-12 w-48">
          Create Custom
        </Button>
      </Link>
    </div>
  );
}
