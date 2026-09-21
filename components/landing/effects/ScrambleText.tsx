'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface ScrambleTextProps {
  text: string;
  className?: string;
  scrambleSpeed?: number;
  triggerOnHover?: boolean;
  triggerOnMount?: boolean;
  chars?: string;
}

const DEFAULT_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_#@%&*';

export function ScrambleText({
  text,
  className = '',
  scrambleSpeed = 35,
  triggerOnHover = true,
  triggerOnMount = true,
  chars = DEFAULT_CHARS,
}: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const frameRef = useRef<number | null>(null);
  const iterationRef = useRef<number>(0);
  const isScramblingRef = useRef<boolean>(false);

  const startScramble = useCallback(() => {
    // If user prefers reduced motion, do not animate scramble
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayText(text);
      return;
    }

    if (isScramblingRef.current) return;
    isScramblingRef.current = true;
    iterationRef.current = 0;

    let lastTime = performance.now();

    const update = (time: number) => {
      const elapsed = time - lastTime;

      if (elapsed >= scrambleSpeed) {
        lastTime = time;

        setDisplayText(
          text
            .split('')
            .map((char, index) => {
              if (char === ' ') return ' ';
              if (index < iterationRef.current) {
                return text[index];
              }
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('')
        );

        iterationRef.current += 1 / 2;
      }

      if (iterationRef.current < text.length) {
        frameRef.current = requestAnimationFrame(update);
      } else {
        setDisplayText(text);
        isScramblingRef.current = false;
        if (frameRef.current) {
          cancelAnimationFrame(frameRef.current);
          frameRef.current = null;
        }
      }
    };

    frameRef.current = requestAnimationFrame(update);
  }, [text, scrambleSpeed, chars]);

  useEffect(() => {
    if (triggerOnMount) {
      startScramble();
    } else {
      setDisplayText(text);
    }

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      isScramblingRef.current = false;
    };
  }, [text, triggerOnMount, startScramble]);

  return (
    <span
      className={`inline-block font-mono ${className}`}
      onMouseEnter={triggerOnHover ? startScramble : undefined}
      aria-label={text}
    >
      {displayText}
    </span>
  );
}
