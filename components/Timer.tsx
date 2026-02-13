
import React, { useEffect, useState } from 'react';

interface TimerProps {
  initialSeconds: number;
  onTimeUp: () => void;
  isActive: boolean;
}

export const Timer: React.FC<TimerProps> = ({ initialSeconds, onTimeUp, isActive }) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    let interval: number;
    if (isActive && seconds > 0) {
      interval = window.setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0) {
      onTimeUp();
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, onTimeUp]);

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const isLow = seconds < 60;

  return (
    <div className={`flex items-center space-x-1 sm:space-x-2 px-2 py-1 sm:px-4 sm:py-2 rounded-full font-mono text-base sm:text-xl font-bold shadow-sm transition-colors ${
      isLow ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-100 text-blue-700'
    }`}>
      <i className="fa-regular fa-clock"></i>
      <span>
        {String(minutes).padStart(2, '0')}:{String(remainingSeconds).padStart(2, '0')}
      </span>
    </div>
  );
};
