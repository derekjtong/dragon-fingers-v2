"use client";
import TypeBox from "@/app/components/TypeBox";
import { Button } from "@/components/ui/button";
import { Match } from "@prisma/client";
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
  const [text, setText] = useState("");
  const [user, setUser] = useState<UserData>();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const session = useSession();

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const matchResponse = await axios.get(`/api/match/${params.matchId}`);
        const textResponse = await axios.get(`/api/text/${matchResponse.data.textId}`);
        const userResponse = await axios.get("/api/user");

        // If match is open, send join request
        if (matchResponse.data.open) {
          await axios.post(`/api/match/${params.matchId}/participants`);
        }

        setUser(userResponse.data);
        setMatch(matchResponse.data);
        setText(textResponse.data.text);
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

  const handleEndGame = async () => {
    axios.patch(`/api/match/${params.matchId}`);
  };

  return (
    <div>
      <div className="h-screeen fixed ml-48 mt-64 flex w-full flex-col items-start ">
        <div className="flex flex-col items-center">
          <div className="text-2xl">{session.data?.user?.name}&apos;s game</div>
          <div> Share this code with your friends </div>
          <div>{match ? match.id : ""}</div>
          {user?.id === match?.ownerId ? "Owner commands" : ""}
          {user?.id === match?.ownerId ? <Button className="m-2">Start Game</Button> : ""}
          {user?.id === match?.ownerId ? <Button onClick={handleEndGame}>End Game</Button> : ""}
        </div>
      </div>
      <div className="flex h-screen flex-grow flex-col items-center justify-center ">{match && <TypeBox match={match} text={text} />}</div>
    </div>
  );
}

export default MatchPage;
