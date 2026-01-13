import { useEffect, useState } from 'react';

export const useTimer = (isRunning: boolean) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const reset = () => setTime(0);

  return { time, reset };
};
