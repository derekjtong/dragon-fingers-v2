"use client";
import { Button } from "@/components/ui/button";
import { Match } from "@prisma/client";
import axios from "axios";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaArrowRight } from "react-icons/fa";

function JoinPage() {
  const [code, setCode] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [matches, setMatches] = useState<Match[]>([]);
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchJoinableMatches = async () => {
      try {
        const response = await axios.get("/api/match/joinable");
        setMatches(response.data || []);
      } catch (err) {
        console.error("Failed to fetch joinable matches:", err);
        setError("Failed to load games");
      }
    };

    fetchJoinableMatches();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (session.status === "loading") {
      console.log("Session is loading");
      return;
    }
    if (session.status === "unauthenticated") {
      setError("Must be logged in");
      return;
    }
    if (code == "") {
      setError("Ask your friend for their room code!");
      return;
    }
    try {
      const response = await axios.get(`/api/match/${code}`);
      if (response.status === 200) {
        router.push(`/match/${code}`);
      } else {
        setError("Match not found");
      }
    } catch (error: any) {
      if (error.response) {
        setError(`${error.response.data}`);
      } else if (error.request) {
        setError("No response was received");
      } else {
        setError(`An error occurred: ${error.message}`);
      }
    }
  };

  return (
    <div className="flex w-screen">
      <div className="flex h-screen w-1/2 flex-col items-center justify-evenly border text-2xl">
        <div className="text-4xl">Join a game</div>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <input type="text" className="border" placeholder="Paste your code here" value={code} onChange={(e) => setCode(e.target.value)} />
          <button type="submit" className="border p-3 hover:bg-gray-300">
            Join
          </button>
        </form>
        <div className="text-red-500">{error}</div>
      </div>
      <div className="flex h-screen w-1/2 flex-col items-center justify-evenly border text-2xl">
        <div className="flex flex-col items-center">
          <div className="text-4xl">Active Match List</div>
          <div>
            {matches.map((match) => (
              <div className="flex items-center justify-center" key={match.id}>
                <div>{match.ownerId}</div>
                <Link href={`/match/${match.id}`} className="ml-2">
                  <Button>
                    Join <FaArrowRight />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default JoinPage;
