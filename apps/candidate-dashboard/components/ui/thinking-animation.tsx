import { useState, useEffect } from 'react';

interface ThinkingAnimationProps {
  text?: string;
  speed?: number;
}

export function ThinkingAnimation({ text = "Thinking", speed = 400 }: ThinkingAnimationProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) {
          return '';
        }
        return prev + '.';
      });
    }, speed);

    return () => clearInterval(interval);
  }, [speed]);

  return (
    <span className="inline-flex items-center">
      {text}
      <span className="w-8 text-left opacity-75 transition-opacity duration-200">
        {dots}
      </span>
    </span>
  );
} 