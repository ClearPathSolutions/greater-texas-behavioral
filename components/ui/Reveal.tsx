'use client';

import { useEffect, useRef, useState } from 'react';

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** stagger delay in ms */
  delay?: number;
  as?: keyof JSX.IntrinsicElements;
};

/**
 * Fades + lifts its children into view once when scrolled near the viewport.
 * Respects prefers-reduced-motion via the .reveal utility in globals.css.
 */
export default function Reveal({
  children,
  className = '',
  delay = 0,
  as: Tag = 'div',
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    obs.observe(el);
    // Safety net: never let content stay hidden if the observer doesn't fire.
    const fallback = window.setTimeout(() => setVisible(true), 1600);
    return () => {
      obs.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  const Component = Tag as any;
  return (
    <Component
      ref={ref as any}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Component>
  );
}
