"use client";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PuffLoader } from "react-spinners";

function JoinExistingPage() {
  const [error, setError] = useState<string>("");
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchGame = async () => {
      if (session.status === "loading") {
        console.log("Session is loading");
        return;
      }
      if (session.status === "unauthenticated") {
        setError("Must be logged in");
        return;
      }

      try {
        const response = await axios.get("/api/match/joinexisting");
        const match = response.data;
        router.push(`/match/${match.id}`);
      } catch (error) {
        console.error("Error joining a match:", error);
        setError("Failed joining a match");
      }
    };
    fetchGame();
  });

  if (error)
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <div className="p-3 text-3xl">{error}</div>
        <Link href="/">
          <Button variant={"destructive"}>Return to home</Button>
        </Link>
      </div>
    );

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <PuffLoader />
    </div>
  );
}

export default JoinExistingPage;
