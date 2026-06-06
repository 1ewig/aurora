import { useState, useEffect, useCallback } from "react";

interface UseCarouselOptions {
  length: number;
  interval?: number;
  autoResumeDelay?: number;
  initial?: number;
}

export function useCarousel({
  length,
  interval = 6000,
  autoResumeDelay = 10000,
  initial = 0,
}: UseCarouselOptions) {
  const [current, setCurrent] = useState(initial);
  const [direction, setDirection] = useState(0);
  const [auto, setAuto] = useState(true);

  const next = useCallback(() => {
    setAuto(false);
    setCurrent((c) => (c + 1) % length);
    setDirection(1);
  }, [length]);

  const prev = useCallback(() => {
    setAuto(false);
    setCurrent((c) => (c - 1 + length) % length);
    setDirection(-1);
  }, [length]);

  const goTo = useCallback(
    (i: number) => {
      setAuto(false);
      setCurrent((prev) => {
        setDirection(i > prev ? 1 : -1);
        return i;
      });
    },
    []
  );

  useEffect(() => {
    if (!auto) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % length);
      setDirection(1);
    }, interval);
    return () => clearInterval(timer);
  }, [auto, length, interval]);

  useEffect(() => {
    if (!auto) {
      const timer = setTimeout(() => setAuto(true), autoResumeDelay);
      return () => clearTimeout(timer);
    }
  }, [auto, autoResumeDelay]);

  return { current, direction, next, prev, goTo };
}
