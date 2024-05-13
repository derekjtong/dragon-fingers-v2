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
    <div className="flex w-screen flex-col items-center pt-20 md:flex-row md:items-start md:pt-0">
      <div className="flex w-1/2 flex-col items-center justify-center text-2xl md:h-screen">
        <div className="mb-7 text-4xl">Join a game</div>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <input
            type="text"
            className="mb-3 min-w-96 border p-4"
            placeholder="Paste your code here"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Button type="submit">Join</Button>
        </form>
        <div className="text-red-500">{error}</div>
      </div>
      <div className="flex h-screen w-1/2 flex-col items-center justify-evenly  text-2xl">
        <div className="flex flex-col items-center">
          <div className="mb-7 text-4xl">Active Match List</div>
          <div>
            {matches.length !== 0 ? (
              matches.map((match) => (
                <div className="flex items-center justify-center" key={match.id}>
                  <div>{match.id}</div>
                  <Link href={`/match/${match.id}`} className="ml-2">
                    <Button>
                      Join <FaArrowRight />
                    </Button>
                  </Link>
                </div>
              ))
            ) : (
              <div>No Active Matches</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default JoinPage;
