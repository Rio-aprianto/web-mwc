"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type FadeInOnScrollProps = {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  threshold?: number;
};

export default function FadeInOnScroll({
  children,
  className,
  delayMs = 0,
  threshold = 0.2,
}: FadeInOnScrollProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const currentElement = containerRef.current;
    if (!currentElement) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -12% 0px",
      },
    );

    observer.observe(currentElement);

    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  return (
    <div
      ref={containerRef}
      className={`fade-on-scroll ${isVisible ? "is-visible" : ""} ${className ?? ""}`.trim()}
      style={{ transitionDelay: `${delayMs}ms` }}>
      {children}
    </div>
  );
}
