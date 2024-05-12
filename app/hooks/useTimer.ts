import { useEffect, useState } from "react";

function useStopwatch() {
  const [time, setTime] = useState(0);
  const [timerOn, setTimerOn] = useState(false);

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

  return { time, timerOn, setTimerOn, setTime };
}

export default useStopwatch;
