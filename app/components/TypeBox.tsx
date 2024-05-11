"use client";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { pusherClient } from "../libs/pusher";
import Stopwatch from "./Stopwatch";

interface TypeBoxProps {
  matchId: string;
}

const TypeBox = ({ matchId }: TypeBoxProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [placeholderText, setPlaceholderText] = useState<string>("the quick brown fox jumps over the lazy dog");
  const [typedText, setTypedText] = useState<string>("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [progress, setProgress] = useState(0);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [time, setTime] = useState<number>(0);
  const [timerOn, setTimerOn] = useState<boolean>(false);
  const session = useSession();

  useEffect(() => {
    pusherClient.subscribe(matchId);

    const progressHandler = (message: ProgressUpdateType) => {
      setProgress(message.wordCount);
    };
    pusherClient.bind("progress-update", progressHandler);
    ``;
    return () => {
      pusherClient.unsubscribe(matchId);
      pusherClient.unbind("progress-update", progressHandler);
    };
  }, [matchId]);

  // Focus on the input when the component mounts
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
    if (event.getModifierState && event.getModifierState("CapsLock")) {
      alert("Caps Lock is on");
    }
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

  // Start the timer
  useEffect(() => {
    if (timerOn && startTime === null) {
      setStartTime(Date.now());
    }

    if (!timerOn && startTime !== null) {
      const endTime = Date.now();
      const timeTaken = (endTime - startTime) / 1000;
      // setTime(timeTaken);
      setStartTime(null);
    }
  }, [timerOn, startTime]);

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

    if (currentText.length === placeholderText.length) {
      setTimerOn(false);
    }

    if (typedText.length % 5 == 0) {
      axios
        .post(`/api/match/${matchId}`, { wordCount: typedText.length })
        .then((response) => {
          console.log("Progress updated successfully:", response.data);
        })
        .catch((error) => {
          console.error("Failed to update progress:", error);
        });
    }
  };
  const getHighlightedText = () => {
    return placeholderText.split("").map((char, index) => {
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
    <div className="flex w-full items-center justify-center" onClick={handleHomeClick}>
      <div className="relative">
        {timerOn || typedText.length === placeholderText.length ? (
          <div className="min-h-10">
            <Stopwatch time={time} setTime={setTime} timerOn={timerOn} setTimerOn={setTimerOn} />
          </div>
        ) : (
          <div className="min-h-10"></div>
        )}
        {typedText.length !== placeholderText.length ? (
          <div ref={cursorRef} className={`absolute left-0 top-10 h-6 w-px bg-black ${!isTyping ? "animate-blink" : ""}`} />
        ) : (
          ""
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
          disabled={typedText.length === placeholderText.length}
        />
        <div>Progress (from channel): {progress}</div>
      </div>
    </div>
  );
};

export default TypeBox;
