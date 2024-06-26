"use client";
import TypeBox from "@/app/components/TypeBox";
import { Button } from "@/components/ui/button";
import { Match, Text } from "@prisma/client";
import axios from "axios";
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
  const [owner, setOwner] = useState<UserData>();
  const [text, setText] = useState<Text>();
  const [user, setUser] = useState<UserData>();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [gameStatus, setGameStatus] = useState<GameStatus>("open");

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const matchResponse = await axios.get(`/api/match/${params.matchId}`);

        if (matchResponse.data) {
          setMatch(matchResponse.data);

          if (matchResponse.data.owner) {
            setOwner(matchResponse.data.owner);
          }

          // If match is open, send join request
          if (matchResponse.data.allowJoin) {
            await axios.post(`/api/match/${params.matchId}/participants`);
          }

          const textResponse = await axios.get(`/api/text/${matchResponse.data.textId}`);
          setText(textResponse.data);

          // not null, match started
          if (matchResponse.data.startTime !== null) {
            if (matchResponse.data.endTime === null) {
              // null, match in progress
              setGameStatus("inprogress");
            } else {
              // not null, end already done
              setGameStatus("ended");
            }
          }
        } else {
          throw new Error("Match not found");
        }

        const userResponse = await axios.get("/api/user/self");
        setUser(userResponse.data);
      } catch (err: any) {
        console.log(err.response.data);
        setError("Error: " + err.response.data);
        setIsLoading(false);
      } finally {
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
    try {
      await axios.patch(`/api/match/${params.matchId}`);
      setGameStatus("ended");
    } catch (error) {
      console.error("Failed to end game: ", error);
    }
  };

  const handleStartGame = async () => {
    const startTime = new Date(new Date().getTime() + 5000);

    axios.post(`/api/match/${params.matchId}/start`, { startTime: startTime.toISOString() });
  };

  const handleCancelGame = async () => {
    axios.delete(`/api/match/${params.matchId}/start`);
  };

  return (
    <div>
      <div className="fixed flex h-screen flex-col items-start justify-center border p-10">
        <div className="flex flex-col items-center">
          <div className="text-2xl">{owner?.name}&apos;s game</div>
          {gameStatus === "ended" ? (
            <>
              <div>Match is over</div>
              <div>{match ? match.id : ""}</div>
            </>
          ) : gameStatus === "starting" ? (
            <>
              <div>Match is in starting</div>
              <div>{match ? match.id : ""}</div>
              <Button className="m-2" onClick={handleCancelGame} variant={"outline"}>
                Cancel
              </Button>
            </>
          ) : gameStatus === "inprogress" ? (
            <>
              <div>Match is in progress</div>
              <div>{match ? match.id : ""}</div>
              {user?.isAdmin ? (
                <Button onClick={handleEndGame} variant="destructive">
                  ADMIN: end game
                </Button>
              ) : (
                ""
              )}
            </>
          ) : (
            <>
              <div> Share this code with your friends </div>
              <div>{match ? match.id : ""}</div>
              {user?.id === match?.ownerId || user?.isAdmin ? (
                <Button className="m-2" onClick={handleStartGame} disabled={match?.endTime !== null}>
                  Start Game
                </Button>
              ) : (
                ""
              )}
            </>
          )}
        </div>
      </div>
      <div className="flex h-screen flex-grow flex-col items-center justify-center ">
        {match && (
          <TypeBox
            match={match}
            text={text!.body}
            source={text!.source}
            gameStatus={gameStatus}
            setGameStatus={setGameStatus}
            user={user!}
          />
        )}
      </div>
    </div>
  );
}

export default MatchPage;
