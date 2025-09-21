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
      heroSplit?.revert();
      heroSplit = null;
    };

    const counters = Array.from(document.querySelectorAll<HTMLElement>('.counter'));

    const revealCountersWithoutMotion = () => {
      counters.forEach((counter) => {
        const targetAttr = counter.getAttribute('data-target');
        const target = targetAttr ? Number.parseFloat(targetAttr) : NaN;
        if (!Number.isFinite(target)) return;
        counter.textContent = `${target}`;
      });
    };

    const createAnimateOnScroll = () => (element: Element | string, vars?: gsap.TweenVars) => {
      const tween = gsap.from(element, {
        scrollTrigger: {
          trigger: element,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 50,
        duration: 0.8,
        ease: 'power3.out',
        ...vars,
      });
      activeAnimations.push(tween);
      if (tween.scrollTrigger) {
        activeTriggers.push(tween.scrollTrigger);
      }
    };

    const setupGsapAnimations = () => {
      const animateOnScroll = createAnimateOnScroll();

      document.querySelectorAll('h2, h3').forEach((el) => animateOnScroll(el));
      (gsap.utils.toArray('.service-card') as Element[]).forEach((card, i) => {
        animateOnScroll(card, { delay: i * 0.1 });
      });
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
            const tween = gsap.to(counter, {
              duration: 2,
              textContent: target,
              ease: 'power2.out',
              overwrite: true,
              modifiers: {
                textContent: (value) => {
                  const numericValue = Number.parseFloat(value);
                  if (!Number.isFinite(numericValue)) return '0';
                  return Math.round(numericValue).toString();
                },
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

    const setupSlider = () => {
      const slider = document.querySelector<HTMLElement>('.comparison-slider');
      if (!slider) return () => undefined;
      const afterImage = slider.querySelector<HTMLElement>('.after-image');
      const handle = slider.querySelector<HTMLElement>('.slider-handle');
      let isDragging = false;
      let activePointerId: number | null = null;

      const updateFromClientX = (clientX: number | null) => {
        if (clientX === null) return;
        const rect = slider.getBoundingClientRect();
        let x = clientX - rect.left;
        x = Math.max(0, Math.min(x, rect.width));

        const widthPercentage = (x / rect.width) * 100;
        if (afterImage) afterImage.style.width = `${widthPercentage}%`;
        if (handle) handle.style.left = `${widthPercentage}%`;
      };

      const supportsPointerEvents = typeof window !== 'undefined' && 'PointerEvent' in window;
      const supportsTouch =
        typeof window !== 'undefined' &&
        ('ontouchstart' in window || (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0));

      const stopPointerDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        if (activePointerId !== null) {
          slider.releasePointerCapture?.(activePointerId);
          activePointerId = null;
        }
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', stopPointerDrag);
        window.removeEventListener('pointercancel', stopPointerDrag);
      };

      const onPointerMove = (event: PointerEvent) => {
        if (!isDragging) return;
        if (activePointerId !== null && event.pointerId !== activePointerId) return;
        updateFromClientX(event.clientX);
      };

      const startPointerDrag = (event: PointerEvent) => {
        event.preventDefault();
        if (isDragging) stopPointerDrag();
        isDragging = true;
        activePointerId = event.pointerId;
        slider.setPointerCapture?.(event.pointerId);
        updateFromClientX(event.clientX);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', stopPointerDrag);
        window.addEventListener('pointercancel', stopPointerDrag);
      };

      const stopMouseDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', stopMouseDrag);
      };

      const onMouseMove = (event: MouseEvent) => {
        if (!isDragging) return;
        updateFromClientX(event.clientX);
      };

      const startMouseDrag = (event: MouseEvent) => {
        event.preventDefault();
        if (isDragging) stopMouseDrag();
        isDragging = true;
        updateFromClientX(event.clientX);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', stopMouseDrag);
      };

      const stopTouchDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', stopTouchDrag);
        window.removeEventListener('touchcancel', stopTouchDrag);
      };

      const onTouchMove = (event: TouchEvent) => {
        if (!isDragging || event.touches.length === 0) return;
        event.preventDefault();
        updateFromClientX(event.touches[0].clientX);
      };

      const startTouchDrag = (event: TouchEvent) => {
        if (event.touches.length === 0) return;
        if (isDragging) stopTouchDrag();
        isDragging = true;
        event.preventDefault();
        updateFromClientX(event.touches[0].clientX);
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('touchend', stopTouchDrag);
        window.addEventListener('touchcancel', stopTouchDrag);
      };

        if (supportsPointerEvents) {
          slider.addEventListener('pointerdown', startPointerDrag);
        } else {
          slider.addEventListener('mousedown', startMouseDrag);
          if (supportsTouch) {
            slider.addEventListener('touchstart', startTouchDrag, { passive: false });
          }
        }

      return () => {
        isDragging = false;
        if (supportsPointerEvents) {
          stopPointerDrag();
          slider.removeEventListener('pointerdown', startPointerDrag);
        } else {
          stopMouseDrag();
          slider.removeEventListener('mousedown', startMouseDrag);
          if (supportsTouch) {
            stopTouchDrag();
            slider.removeEventListener('touchstart', startTouchDrag);
          }
        }
      };
    };

    const sliderCleanup = setupSlider();

    const handleScroll = () => {
      const nav = document.getElementById('navbar');
      if (!nav) return;
      if (window.scrollY > 50) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

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
      sliderCleanup();
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
