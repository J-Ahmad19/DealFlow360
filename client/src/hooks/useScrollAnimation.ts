import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface UseScrollAnimationOptions {
  y?: number;
  opacity?: number;
  duration?: number;
  delay?: number;
  ease?: string;
  start?: string;
  stagger?: number;
}

export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollAnimationOptions = {}
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const children = el.querySelectorAll('[data-animate]');

    gsap.fromTo(
      children.length ? children : el,
      {
        y: options.y ?? 30,
        opacity: options.opacity ?? 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: options.duration ?? 0.8,
        delay: options.delay ?? 0,
        ease: options.ease ?? 'power2.out',
        stagger: options.stagger ?? 0.1,
        scrollTrigger: {
          trigger: el,
          start: options.start ?? 'top 85%',
          once: true,
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return ref;
}
