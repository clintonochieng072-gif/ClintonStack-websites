'use client';

import { useState, useEffect, useRef } from 'react';

interface TrialTimerProps {
  onTrialEnd: () => void;
  isActive: boolean;
}

const TrialTimer = ({ onTrialEnd, isActive }: TrialTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            onTrialEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeLeft, isActive, onTrialEnd]);

  useEffect(() => {
    if (isActive) {
      setTimeLeft(30);
    }
  }, [isActive]);

  if (!isActive || timeLeft === 0) return null;

  return (
    <div className={`p-4 rounded-lg mb-4 text-center ${
      timeLeft <= 10 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
    }`}>
      ⏰ Editing Trial: {timeLeft} seconds remaining
    </div>
  );
};

export default TrialTimer;