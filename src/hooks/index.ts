import { useState, useEffect, useRef } from 'react';

export function useCountUp(end: number, duration: number = 800): number {
  const [value, setValue] = useState(end);
  const prevRef = useRef(end);

  useEffect(() => {
    const start = prevRef.current;
    const diff = end - start;
    if (Math.abs(diff) < 0.01) {
      setValue(end);
      prevRef.current = end;
      return;
    }
    const startTime = performance.now();
    let rafId: number;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + diff * eased;
      setValue(current);
      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        prevRef.current = end;
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [end, duration]);

  return value;
}

export function useDebounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const debounced = ((...args: unknown[]) => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => fn(...args), delay);
  }) as T;

  return debounced;
}

export function useGreeting(): string {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const update = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) setGreeting('Good Morning');
      else if (hour >= 12 && hour < 17) setGreeting('Good Afternoon');
      else if (hour >= 17 && hour < 21) setGreeting('Good Evening');
      else setGreeting('Good Night');
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  return greeting;
}
