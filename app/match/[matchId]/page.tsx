"use client";
import { Button } from "@/components/ui/button";
import { Match, Text } from "@prisma/client";
import axios from "axios";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

type MatchPageProps = {
  params: {
    matchId: string;
  };
};

function MatchPage({ params }: MatchPageProps) {
  const [match, setMatch] = useState<Match>();
  const [text, setText] = useState<Text>();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const session = useSession();

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const matchResponse = await axios.get(`/api/match/${params.matchId}`);
        const textResponse = await axios.get(`/api/text/${matchResponse.data.textId}`);
        // console.log(matchResponse.data.textId);
        // console.log(textResponse.data.text);
        setMatch(matchResponse.data);
        setText(textResponse.data);
        setIsLoading(false);
      } catch (err: any) {
        console.log(err.response.data);
        setError("Error: " + err.response.data);
        setIsLoading(false);
      }
    };
    fetchMatch();
  }, [params.matchId]);
  if (isLoading) return "";
  return (
    <div className="flex h-screen justify-evenly">
      {error ? (
        <div className="flex flex-col items-center justify-center">
          <div className="p-3 text-3xl">{error}</div>
          <Link href="/">
            <Button variant={"destructive"}>Return to home</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center justify-center border">
            <div className="mb-10 text-2xl">{session.data?.user?.name}&apos;s game</div>
            <div> Share this code with your friends </div>
            <div>{match ? match.id : ""}</div>
          </div>
          <div className="flex flex-col items-center justify-center border">
            <div>{text ? text.text : ""}</div>
            <input placeholder="enter text here" className="border" />
          </div>
        </>
      )}
    </div>
  );
}

export default MatchPage;
