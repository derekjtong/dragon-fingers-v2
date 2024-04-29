"use client";
import { useSession } from "next-auth/react";
import MatchDetails from "./MatchDetails";

type MatchPageProps = {
  params: {
    matchId: string;
  };
};

function Matchpage({ params }: MatchPageProps) {
  const session = useSession();

  if (session.status === "loading") {
    return <div className="flex h-screen flex-col items-center justify-center">Loading...</div>;
  }

  if (session.status === "unauthenticated") {
    return <div className="flex h-screen flex-col items-center justify-center">Must be logged in</div>;
  }
  return (
    <div>
      <MatchDetails matchId={params.matchId} />
    </div>
  );
}

export default Matchpage;
