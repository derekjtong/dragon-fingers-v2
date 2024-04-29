"use client";
import { useState, useEffect, FC } from "react";

type StopwatchProps = {
  time: number;
  setTime: React.Dispatch<React.SetStateAction<number>>;
  timerOn: boolean;
  setTimerOn: React.Dispatch<React.SetStateAction<boolean>>;
};

const Stopwatch: FC<StopwatchProps> = ({ time, setTime, timerOn, setTimerOn }) => {
  // const [time, setTime] = useState<number>(0);
  // const [timerOn, setTimerOn] = useState<boolean>(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (timerOn) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerOn, setTime]);

  const toggleTimer = () => setTimerOn(!timerOn);

  return (
    <div onClick={toggleTimer} className="mb-2 cursor-pointer font-mono ">
      {("0" + Math.floor((time / 60000) % 60)).slice(-2)}:{("0" + Math.floor((time / 1000) % 60)).slice(-2)}:
      {("0" + ((time / 10) % 100)).slice(-2)}
    </div>
  );
};

export default Stopwatch;
