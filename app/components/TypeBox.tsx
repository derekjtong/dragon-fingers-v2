"use client";
import { Progress } from "@/components/ui/progress";
import { Match } from "@prisma/client";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import usePusherProgress from "../hooks/usePusherProgress";
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
  const { participantProgress, status } = usePusherProgress(match);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef]);

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

  // Update cursor position
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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const currentText = event.target.value;
    setTypedText(currentText);
    setIsTyping(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 500);

    if (!timerOn) {
      setTimerOn(true);
    }

    if (currentText.length === text.length) {
      setTimerOn(false);
    }

    axios.post(`/api/match/${match.id}`, { charCount: typedText.length });
  };

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
    <div className="flex h-screen w-full flex-col items-center justify-center border border-black" onClick={handleHomeClick}>
      <div className={`caps-lock-indicator ${capsLock ? "text-red-500" : "text-transparent"}`}>
        {capsLock ? "CAPS LOCK IS ON" : "CAPS LOCK IS OFF"}
      </div>
      <div className="w-96 border">
        Progress (from channel):
        {participantProgress.map((user) => (
          <div key={user.userId} className="flex items-center">
            <div>{user.name}</div>
            <Progress value={Math.ceil((user.charCount / (text.length - 1)) * 100)} />
          </div>
        ))}
      </div>
      <div className="relative border">
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
        <div className="border">
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
            onChange={handleChange}
            onKeyUp={handleKeyUp as any}
            value={typedText}
            aria-label="Type the text here"
            disabled={typedText.length === text.length || status === "closed" || match.allowJoin === false}
          />
        </div>
        <div>
          <div>DB Status: {match.allowJoin ? "Open" : "Closed"}</div>
          <div>PS Status: {status}</div>
          <div>Time Taken {time}</div>
        </div>
      </div>
    </div>
  );
};

export default TypeBox;
