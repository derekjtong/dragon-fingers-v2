"use client";
import TypeBox from "@/app/components/TypeBox";
import { Button } from "@/components/ui/button";
import { Match, Text } from "@prisma/client";
import axios from "axios";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PuffLoader } from "react-spinners";

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
  const [participants, setParticipants] = useState<ExtendedParticipant[]>();
  const session = useSession();

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const matchResponse = await axios.get(`/api/match/${params.matchId}`);
        const textResponse = await axios.get(`/api/text/${matchResponse.data.textId}`);
        const participantsResponse = await axios.get(`/api/match/${params.matchId}/participants`);
        setMatch(matchResponse.data);
        setText(textResponse.data);
        setParticipants(participantsResponse.data);
        setIsLoading(false);
      } catch (err: any) {
        console.log(err.response.data);
        setError("Error: " + err.response.data);
        setIsLoading(false);
      }
    };
    fetchMatch();
  }, [params.matchId]);

  if (isLoading)
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <PuffLoader />
      </div>
    );

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
    <div>
      <div className="h-screeen fixed ml-48 mt-56 flex w-full flex-col items-start ">
        <div className="flex flex-col items-center">
          <div className="text-2xl">{session.data?.user?.name}&apos;s game</div>
          <div> Share this code with your friends </div>
          <div>{match ? match.id : ""}</div>
          <Button>Start Game</Button>
          <div className="text-2xl">Participants</div>
          <div>{participants?.map((participant, index) => <div key={index}>{participant.user?.name}</div>)}</div>
        </div>
      </div>
      <div className="flex h-screen flex-grow flex-col items-center justify-center ">
        <TypeBox matchId={params.matchId} />
      </div>
    </div>
  );
}

export default MatchPage;
