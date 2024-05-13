"use client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Match } from "@prisma/client";
import axios from "axios";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Confetti from "react-confetti";
import usePusherProgress from "../hooks/usePusherProgress";
import useStopwatch from "../hooks/useTimer";

interface TypeBoxProps {
  match: Match;
  text: string;
  source: string;
  gameStatus: GameStatus;
  setGameStatus: (status: GameStatus) => void;
  user: UserData;
}

const TypeBox = ({ match, text, source, gameStatus, setGameStatus, user }: TypeBoxProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [typedText, setTypedText] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const { time, timerOn, setTimerOn, setTime } = useStopwatch();
  const { participantProgress, startTime, winner } = usePusherProgress({ match, setGameStatus, setTimerOn });
  const [countdown, setCountdown] = useState<number | null>();
  const [showDebug, setShowDebug] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [wpm, setWpm] = useState(0);

  useEffect(() => {
    const fetchParticipantData = async () => {
      const response = await axios.get(`/api/match/${match.id}/me`);
      const participant = response.data;
      if (participant.completed) {
        setTypedText(text);
        setCompleted(true);
        setWpm(participant.wpm);
        setTime(participant.time);
        setTimerOn(false);
      }
    };

    fetchParticipantData();
  }, [match, setTime, text, setTimerOn]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    const updateCountdown = () => {
      if (startTime) {
        const startTimestamp = new Date(startTime).getTime();
        const now = Date.now();
        const secondsLeft = (startTimestamp - now) / 1000;

        if (secondsLeft > 0) {
          setTimerOn(false);
          setCountdown(Math.ceil(secondsLeft));
          if (!interval) {
            interval = setInterval(updateCountdown, 1000);
          }
        } else {
          if (gameStatus !== "ended" && match.endTime === null) {
            setTimerOn(true);
          }
          setCountdown(null);
          if (interval) {
            clearInterval(interval);
            interval = null;
          }
        }
      } else {
        setCountdown(null);
      }
    };

    updateCountdown();

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [startTime, setTimerOn, match.endTime, gameStatus]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [countdown, startTime, setTimerOn, match.endTime]);

  // Focus on the input when user clicks on page
  const handleHomeClick = () => {
    if (!completed) {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  // Handle Caps Lock detection
  const handleKeyUp = (event: KeyboardEvent) => {
    setCapsLock(event.getModifierState && event.getModifierState("CapsLock"));
  };

  // Update fake cursor position
  useEffect(() => {
    const updateCursor = () => {
      if (cursorRef.current && inputRef.current) {
        const { selectionStart } = inputRef.current;
        if (selectionStart !== null) {
          const text = inputRef.current.value.substring(0, selectionStart);
          const textWidth = textWidthCalculator(text, inputRef.current);
          cursorRef.current.style.transform = `translateX(${textWidth}px)`;
        }
      }
    };

    updateCursor();
  }, [typedText, inputRef, isTyping]);

  const textWidthCalculator = (text: string, inputElement: HTMLInputElement): number => {
    const context = document.createElement("canvas").getContext("2d");
    if (context) {
      context.font = "20px 'Font Mono', monospace";
      return context!.measureText(text).width;
    } else {
      return 0;
    }
  };

  // Handle user typing text
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const currentText = event.target.value;
    setTypedText(currentText);
    setIsTyping(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 500);

    if (currentText === text) {
      setTimerOn(false);
      setCompleted(true);
      setWpm(Math.round((typedText.length / 5) * (60000 / time)));
      handleCompleteGame();
    }

    axios.post(`/api/match/${match.id}`, { charCount: typedText.length });
  };

  const handleCompleteGame = async () => {
    if (inputRef.current) {
      inputRef.current.blur();
    }
    axios.patch(`/api/match/${match.id}/participants`, { time: time });
    if (participantProgress.length === 1) setGameStatus("ended");
  };

  // Display progress and highlight incorrect as red
  const getHighlightedText = () => {
    return text.split("").map((char, index) => {
      let colorClass;
      if (index < typedText.length) {
        colorClass = char === typedText[index] ? "text-black" : "text-red-500";
      } else {
        colorClass = "text-gray-400";
      }
      return (
        <span key={index} className={colorClass}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center" onClick={handleHomeClick}>
      {(winner?.id === user.id || match.winnerUserId == user.id) && gameStatus === "ended" ? <Confetti /> : ""}
      <div className="w-96">
        {participantProgress.map((user) => (
          <div key={user.userId} className="my-4">
            <div>{user.name}</div>
            <Progress value={Math.ceil((user.charCount / (text.length - 1)) * 100)} />
          </div>
        ))}
      </div>
      <div className={`caps-lock-indicator ${capsLock ? "text-red-500" : "text-transparent"}`}>
        {capsLock ? "CAPS LOCK IS ON" : "CAPS LOCK IS OFF"}
      </div>
      <div className="relative mx-80 min-w-96">
        {gameStatus !== "open" && gameStatus != "starting" ? (
          <div className="h-10">
            <div className="mb-2 cursor-pointer font-mono ">
              {("0" + Math.floor((time / 60000) % 60)).slice(-2)}:{("0" + Math.floor((time / 1000) % 60)).slice(-2)}:
              {("0" + ((time / 10) % 100)).slice(-2)}
            </div>
          </div>
        ) : (
          <div className="h-10"></div>
        )}
        {startTime === null ? (
          <div className="mb-4 font-mono text-xl">Waiting for owner to start...</div>
        ) : countdown !== null ? (
          <div className="mb-4 font-mono text-xl">Game starting in {countdown}</div>
        ) : (
          <div>
            {typedText === text || gameStatus === "ended" || match.allowJoin === false ? (
              ""
            ) : (
              <div ref={cursorRef} className={`absolute left-0 top-10 h-6 w-px bg-black ${!isTyping ? "animate-blink" : ""}`} />
            )}
            <div className="mb-4 font-mono text-xl">{getHighlightedText()}</div>
            <input
              ref={inputRef}
              type="text"
              className="absolute h-0 w-0 opacity-0"
              onChange={handleInputChange}
              onKeyUp={handleKeyUp as any}
              value={typedText}
              aria-label="Type the text here"
              disabled={typedText === text || gameStatus === "ended" || match.allowJoin === false}
            />
          </div>
        )}
      </div>
      {completed && gameStatus !== "ended" ? <div className="absolute bottom-36">Completed! Waiting for others...</div> : ""}
      {gameStatus === "ended" ? (
        <div className="absolute bottom-10 flex">
          <div className="mx-auto flex max-w-2xl flex-col items-center justify-center rounded-lg border border-white bg-gradient-to-r from-green-400 to-blue-500 p-8 shadow-lg">
            <div className="text-4xl font-bold text-white ">
              {winner?.id === user.id || match.winnerUserId === user.id ? (
                <div>You won! 🎉 Congratulations!</div>
              ) : (
                <div>{winner?.name || match.winnerUserId ? `${winner?.name || match.winnerUserId} won` : "No winner"}</div>
              )}
            </div>
            <div className="mt-4 text-white">{source}</div>
            <div className="text-lg font-light text-white">
              Time Taken: {("0" + Math.floor((time / 60000) % 60)).slice(-2)}:{("0" + Math.floor((time / 1000) % 60)).slice(-2)}:
              {("0" + ((time / 10) % 100)).slice(-2)}
            </div>
            <div className="text-white">WPM: {Math.round((typedText.length / 5) * (60000 / time))}</div>
            <div className="mt-4 flex space-x-4">
              <Link href="/match/joinexisting">
                <Button variant={"default"}>Play Again</Button>
              </Link>
              <Link href="/profile">
                <Button variant={"outline"}>Profile</Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
      {user.isAdmin ? (
        <div className="fixed bottom-0 right-0 m-2 flex flex-col items-end md:bottom-5 md:right-5 lg:bottom-10 lg:right-10">
          <div>
            {showDebug && (
              <div className="rounded border p-2 shadow-sm">
                <div>Countdown: {countdown}</div>
                <div>PS.status: {gameStatus}</div>
                <div>Time Taken: {time}</div>
                <div>WPM: {wpm}</div>
                <div>DB.startTime: {JSON.stringify(startTime)}</div>
                <div>DB.endTime: {match.endTime ? JSON.stringify(match.endTime) : "null"}</div>
                <div>DB.allowJoin: {match.allowJoin ? "true" : "false"}</div>
                <Button
                  onClick={() => {
                    setTypedText(text.slice(0, -1));
                  }}
                  variant="outline"
                  disabled={gameStatus !== "inprogress"}
                >
                  Complete up to last char
                </Button>
              </div>
            )}
          </div>
          <div>
            <Button onClick={() => setShowDebug(!showDebug)} size="sm" variant="outline">
              Debug (Admin)
            </Button>
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default TypeBox;
