'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';
import SplitType from 'split-type';

export default function Scripts() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger, TextPlugin);

    const activeAnimations: gsap.core.Animation[] = [];
    const activeTriggers: ScrollTriggerType[] = [];
    let heroSplit: SplitType | null = null;

    const killAnimations = () => {
      while (activeAnimations.length) {
        const anim = activeAnimations.pop();
        anim?.kill();
      }
      while (activeTriggers.length) {
        const trigger = activeTriggers.pop();
        trigger?.kill();
      }
      counters.forEach((counter) => {
        counter.removeAttribute('aria-hidden');
        const label = counter.textContent?.trim();
        if (label) {
          counter.setAttribute('aria-label', label);
        } else {
          counter.removeAttribute('aria-label');
        }
      });
      heroSplit?.revert();
      heroSplit = null;
    };

    const counters = Array.from(document.querySelectorAll<HTMLElement>('.counter'));

    const setCounterAccessibleValue = (counter: HTMLElement, value: number) => {
      if (!Number.isFinite(value)) return;
      const finalLabel = `${Math.round(value)}`;
      counter.textContent = finalLabel;
      counter.setAttribute('aria-label', finalLabel);
      counter.removeAttribute('aria-hidden');
    };

    const revealCountersWithoutMotion = () => {
      counters.forEach((counter) => {
        const targetAttr = counter.getAttribute('data-target');
        const target = targetAttr ? Number.parseFloat(targetAttr) : NaN;
        if (!Number.isFinite(target)) return;
        setCounterAccessibleValue(counter, target);
      });
    };

    const createAnimateOnScroll = () => {
      const baseTweenVars: gsap.TweenVars = {
        opacity: 0,
        y: 50,
        duration: 0.8,
        ease: 'power3.out',
      };
      const baseScrollTrigger = {
        start: 'top 85%',
        toggleActions: 'play none none none' as const,
      };

      const animateElement = (element: Element, elementVars: gsap.TweenVars) => {
        const tween = gsap.from(element, {
          ...baseTweenVars,
          ...elementVars,
          scrollTrigger: {
            trigger: element,
            ...baseScrollTrigger,
            once: true,
          },
        });
        activeAnimations.push(tween);
        if (tween.scrollTrigger) {
          activeTriggers.push(tween.scrollTrigger);
        }
      };

      return (target: Element | string, vars?: gsap.TweenVars) => {
        const tweenVars = { ...(vars ?? {}) } as gsap.TweenVars;
        delete (tweenVars as { scrollTrigger?: unknown }).scrollTrigger;

        if (typeof target === 'string') {
          const elements = gsap.utils.toArray(target) as Element[];
          elements.forEach((element) => animateElement(element, tweenVars));
          return;
        }

        animateElement(target, tweenVars);
      };
    };

    const setupGsapAnimations = () => {
      const animateOnScroll = createAnimateOnScroll();

      document.querySelectorAll('h2, h3').forEach((el) => animateOnScroll(el));
      animateOnScroll('.md\\:w-1\\/2 img');
      animateOnScroll('.md\\:w-1\\/2 p');
      animateOnScroll('.grid.grid-cols-2');
      animateOnScroll('.testimonial-card');
      animateOnScroll('.max-w-xl.mx-auto.glass-card');

      const heroTitleEl = document.getElementById('hero-title');
      if (heroTitleEl) {
        heroSplit = new SplitType(heroTitleEl, { types: 'chars' });
        const tween = gsap.from(heroSplit.chars, {
          duration: 1,
          opacity: 0,
          y: 50,
          ease: 'back.out(1.7)',
          stagger: 0.05,
          delay: 0.5,
        });
        activeAnimations.push(tween);
      }

      const heroSubtitleEl = document.querySelector('#hero-subtitle');
      if (heroSubtitleEl) {
        const subtitleTween = gsap.from(heroSubtitleEl, {
          duration: 1,
          opacity: 0,
          y: 20,
          ease: 'power2.out',
          delay: 1.2,
        });
        activeAnimations.push(subtitleTween);
      }

      const heroCtaEl = document.querySelector('#hero-content .cta-btn');
      if (heroCtaEl) {
        const ctaTween = gsap.from(heroCtaEl, {
          duration: 1,
          opacity: 0,
          scale: 0.8,
          ease: 'back.out(1.7)',
          delay: 1.5,
        });
        activeAnimations.push(ctaTween);
      }

      counters.forEach((counter) => {
        const attr = counter.getAttribute('data-target');
        const target = attr ? Number.parseFloat(attr) : NaN;
        if (!Number.isFinite(target)) return;
        counter.textContent = '0';
        const trigger = ScrollTrigger.create({
          trigger: counter,
          start: 'top 85%',
          onEnter: () => {
            counter.setAttribute('aria-hidden', 'true');
            counter.removeAttribute('aria-label');
            const tween = gsap.to(counter, {
              duration: 2,
              textContent: target,
              ease: 'power2.out',
              overwrite: true,
              snap: { textContent: 1 },
              onComplete: () => {
                setCounterAccessibleValue(counter, target);
              },
            });
            activeAnimations.push(tween);
          },
          once: true,
        });
        activeTriggers.push(trigger);
      });

      ScrollTrigger.refresh();
    };

    const handleScroll = () => {
      const nav = document.getElementById('navbar');
      if (!nav) return;
      if (window.scrollY > 50) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const applyPreference = (shouldReduce: boolean) => {
      killAnimations();
      if (shouldReduce) {
        revealCountersWithoutMotion();
      } else {
        setupGsapAnimations();
      }
    };

    applyPreference(mediaQuery.matches);

    const onPreferenceChange = (event: MediaQueryListEvent) => {
      applyPreference(event.matches);
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', onPreferenceChange);
    } else {
      mediaQuery.addListener(onPreferenceChange);
    }

    return () => {
      killAnimations();
      window.removeEventListener('scroll', handleScroll);
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', onPreferenceChange);
      } else {
        mediaQuery.removeListener(onPreferenceChange);
      }
    };
  }, []);

  return null;
}
