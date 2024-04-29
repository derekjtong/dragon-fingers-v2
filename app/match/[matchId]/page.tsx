"use client";
import getMatchById from "@/app/actions/getMatchById";
import getTextById from "@/app/actions/getTextById";
import { Match, Text } from "@prisma/client";
import { useEffect, useState } from "react";
import prisma from "@/app/libs/prismadb";

type MatchPageProps = {
  params: {
    matchId: string;
  };
};

function MatchPage({ params }: MatchPageProps) {
  const [match, setMatch] = useState<Match>();
  const [text, setText] = useState<Text>();
  const [error, setError] = useState<String>("");

  useEffect(() => {
    async function fetchData() {
      try {
        console.log(params.matchId);
      } catch (err) {
        setError("An error occurred while fetching data");
        console.error(err);
      }
    }
    fetchData();
  }, [params.matchId]);

  return (
    <div className="flex h-screen flex-col items-center justify-center text-2xl">
      Match {match ? match?.id : ""} {text ? text.text : ""}
      {error ? error : ""}
    </div>
  );
}

export default MatchPage;
