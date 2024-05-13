"use client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Match, Participant } from "@prisma/client";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import usePusherSocket from "../hooks/usePusherProgress";
import useStopwatch from "../hooks/useTimer";

interface TypeBoxProps {
  match: Match;
  text: string;
}

const TypeBox = ({ match, text }: TypeBoxProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [typedText, setTypedText] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const { time, timerOn, setTimerOn, setTime } = useStopwatch();
  const { participantProgress, status, startTime } = usePusherSocket(match);
  const [countdown, setCountdown] = useState<number | null>();
  const [participantInfo, setParticipantInfo] = useState<Participant>();
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const fetchParticipantData = async () => {
      const response = await axios.get(`/api/match/${match.id}/me`);
      const participant = response.data;
      if (participant.completed) {
        setCompleted(true);
        setTypedText(text);
        setTime(participant.time);
        setTimerOn(false);
      }
    };

    fetchParticipantData();
  }, [match.id, setTime, text, setTimerOn]);

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
          if (status !== "closed" && match.endTime === null) {
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
  }, [startTime, setTimerOn, match.endTime, status]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [countdown, startTime, setTimerOn, match.endTime]);

  // Focus on the input when user clicks on page
  const handleHomeClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
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

    if (currentText.length === text.length) {
      setTimerOn(false);
      handleCompleteGame();
    }

    axios.post(`/api/match/${match.id}`, { charCount: typedText.length });
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

  const handleCompleteGame = async () => {
    axios.patch(`/api/match/${match.id}/participants`, { time: time });
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center" onClick={handleHomeClick}>
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
      <div className="relative">
        {timerOn || typedText.length === text.length ? (
          <div className="min-h-10">
            <div className="mb-2 cursor-pointer font-mono ">
              {("0" + Math.floor((time / 60000) % 60)).slice(-2)}:{("0" + Math.floor((time / 1000) % 60)).slice(-2)}:
              {("0" + ((time / 10) % 100)).slice(-2)}
            </div>
          </div>
        ) : (
          <div className="min-h-10"></div>
        )}
        {startTime === null ? (
          <div className="h-6">Waiting for owner to start...</div>
        ) : countdown !== null ? (
          <div className="mb-4 font-mono text-xl">Game starting in {countdown}</div>
        ) : (
          <div>
            {typedText.length === text.length || status === "closed" || match.allowJoin === false ? (
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
              disabled={typedText.length === text.length || status === "closed" || match.allowJoin === false}
            />
          </div>
        )}
        <div>
          <div>Countdown: {countdown === null ? "null" : countdown}</div>
          <div>StartTime: {JSON.stringify(startTime)}</div>
          <div>End time (db): {match.endTime ? JSON.stringify(match.endTime) : "null"}</div>
          <div>DB Status/allow join: {match.allowJoin ? "allowed" : "not allowed"}</div>
          <div>PS Status: {status}</div>
          <div>Time Taken {time}</div>
          <div>WPM {Math.round((typedText.length / 5) * (60000 / time))}</div>
          <Button onClick={handleCompleteGame}>complete game</Button>
        </div>
      </div>
    </div>
  );
};

export default TypeBox;
