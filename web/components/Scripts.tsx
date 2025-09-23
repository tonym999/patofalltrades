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

    const setupSlider = () => {
      const slider = document.querySelector<HTMLElement>('.comparison-slider');
      if (!slider) return () => undefined;
      const afterImage = slider.querySelector<HTMLElement>('.after-image');
      const handle = slider.querySelector<HTMLElement>('.slider-handle');
      if (!handle) return () => undefined;

      const KEYBOARD_STEP = 5;
      let currentPercentage = 50;

      handle.setAttribute('role', 'slider');
      handle.tabIndex = 0;
      handle.setAttribute('aria-valuemin', '0');
      handle.setAttribute('aria-valuemax', '100');
      handle.setAttribute('aria-orientation', 'horizontal');
      if (!handle.getAttribute('aria-label')) {
        handle.setAttribute('aria-label', 'Reveal after photo width');
      }

      const setSliderPercentage = (value: number) => {
        const clamped = Math.max(0, Math.min(100, value));
        currentPercentage = clamped;
        if (afterImage) afterImage.style.width = `${clamped}%`;
        handle.style.left = `${clamped}%`;
        handle.setAttribute('aria-valuenow', String(Math.round(clamped)));
      };

      const updateFromClientX = (clientX: number | null) => {
        if (clientX === null) return;
        const rect = slider.getBoundingClientRect();
        if (!rect || rect.width === 0) return;
        let x = clientX - rect.left;
        x = Math.max(0, Math.min(x, rect.width));

        const widthPercentage = (x / rect.width) * 100;
        setSliderPercentage(widthPercentage);
      };

      const initializeFromLayout = () => {
        const rect = slider.getBoundingClientRect();
        if (!rect || rect.width === 0) {
          setSliderPercentage(currentPercentage);
          return;
        }
        const handleRect = handle.getBoundingClientRect();
        if (handleRect.width > 0) {
          const center = handleRect.left + handleRect.width / 2 - rect.left;
          const percentage = (center / rect.width) * 100;
          if (Number.isFinite(percentage)) {
            setSliderPercentage(percentage);
            return;
          }
        }
        if (afterImage) {
          const afterRect = afterImage.getBoundingClientRect();
          const percentage = (afterRect.width / rect.width) * 100;
          if (Number.isFinite(percentage)) {
            setSliderPercentage(percentage);
            return;
          }
        }
        setSliderPercentage(currentPercentage);
      };

      const adjustFromKeyboard = (delta: number) => {
        setSliderPercentage(currentPercentage + delta);
      };

      const onHandleKeyDown = (event: KeyboardEvent) => {
        switch (event.key) {
          case 'ArrowRight':
          case 'ArrowUp':
            event.preventDefault();
            adjustFromKeyboard(KEYBOARD_STEP);
            break;
          case 'ArrowLeft':
          case 'ArrowDown':
            event.preventDefault();
            adjustFromKeyboard(-KEYBOARD_STEP);
            break;
          case 'Home':
            event.preventDefault();
            setSliderPercentage(0);
            break;
          case 'End':
            event.preventDefault();
            setSliderPercentage(100);
            break;
          default:
            break;
        }
      };

      initializeFromLayout();
      handle.addEventListener('keydown', onHandleKeyDown);

      const hasWindow = typeof window !== 'undefined';
      const supportsPointerEvents = hasWindow && 'PointerEvent' in window;
      const touchEventConstructor =
        hasWindow && 'TouchEvent' in window
          ? (window as unknown as { TouchEvent: typeof TouchEvent }).TouchEvent
          : undefined;
      const supportsTouch =
        hasWindow &&
        ('ontouchstart' in window ||
          Boolean(touchEventConstructor) ||
          (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0));

      type DragMode = 'pointer' | 'mouse' | 'touch';

      let isDragging = false;
      let dragMode: DragMode | null = null;
      let activePointerId: number | null = null;
      let activeTouchId: number | null = null;
      let activeMoveListenerMode: DragMode | null = null;

      const isTouchEvent = (event: Event): event is TouchEvent => {
        if (touchEventConstructor && event instanceof touchEventConstructor) return true;
        return 'touches' in event;
      };

      const touchListenerOptions: AddEventListenerOptions = { passive: false };

      const onPointerMove = (event: PointerEvent) => {
        if (!isDragging || dragMode !== 'pointer') return;
        if (activePointerId !== null && event.pointerId !== activePointerId) return;
        updateFromClientX(event.clientX);
      };

      const onPointerUpOrCancel = (event: PointerEvent) => {
        if (!isDragging || dragMode !== 'pointer') return;
        if (activePointerId !== null && event.pointerId !== activePointerId) return;
        stopDrag();
      };

      const onMouseMove = (event: MouseEvent) => {
        if (!isDragging || dragMode !== 'mouse') return;
        updateFromClientX(event.clientX);
      };

      const onMouseUp = () => {
        if (!isDragging || dragMode !== 'mouse') return;
        stopDrag();
      };

      const readActiveTouch = (touches: TouchList): Touch | null => {
        if (touches.length === 0) return null;
        if (activeTouchId === null) return touches.item(0);
        for (let i = 0; i < touches.length; i += 1) {
          const touch = touches.item(i);
          if (touch && touch.identifier === activeTouchId) return touch;
        }
        return touches.item(0);
      };

      const onTouchMove = (event: TouchEvent) => {
        if (!isDragging || dragMode !== 'touch') return;
        const touch = readActiveTouch(event.touches);
        if (!touch) {
          stopDrag();
          return;
        }
        if (event.cancelable) event.preventDefault();
        updateFromClientX(touch.clientX);
      };

      const onTouchEndOrCancel = (event: TouchEvent) => {
        if (!isDragging || dragMode !== 'touch') return;
        const touchStillActive = (() => {
          for (let i = 0; i < event.touches.length; i += 1) {
            const touch = event.touches.item(i);
            if (touch && touch.identifier === activeTouchId) return true;
          }
          return false;
        })();
        if (!touchStillActive) {
          stopDrag();
        }
      };

      const removeGlobalListeners = () => {
        if (!activeMoveListenerMode) return;
        if (activeMoveListenerMode === 'pointer') {
          window.removeEventListener('pointermove', onPointerMove);
          window.removeEventListener('pointerup', onPointerUpOrCancel);
          window.removeEventListener('pointercancel', onPointerUpOrCancel);
        } else if (activeMoveListenerMode === 'mouse') {
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
        } else if (activeMoveListenerMode === 'touch') {
          window.removeEventListener('touchmove', onTouchMove);
          window.removeEventListener('touchend', onTouchEndOrCancel);
          window.removeEventListener('touchcancel', onTouchEndOrCancel);
        }
        activeMoveListenerMode = null;
      };

      const addGlobalListeners = (mode: DragMode) => {
        if (activeMoveListenerMode === mode) return;
        removeGlobalListeners();
        activeMoveListenerMode = mode;
        if (mode === 'pointer') {
          window.addEventListener('pointermove', onPointerMove);
          window.addEventListener('pointerup', onPointerUpOrCancel);
          window.addEventListener('pointercancel', onPointerUpOrCancel);
        } else if (mode === 'mouse') {
          window.addEventListener('mousemove', onMouseMove);
          window.addEventListener('mouseup', onMouseUp);
        } else if (mode === 'touch') {
          window.addEventListener('touchmove', onTouchMove, touchListenerOptions);
          window.addEventListener('touchend', onTouchEndOrCancel);
          window.addEventListener('touchcancel', onTouchEndOrCancel);
        }
      };

      const stopDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        if (dragMode === 'pointer' && activePointerId !== null) {
          const pointerId = activePointerId;
          if (typeof slider.hasPointerCapture === 'function') {
            if (slider.hasPointerCapture(pointerId)) {
              slider.releasePointerCapture(pointerId);
            }
          } else {
            slider.releasePointerCapture?.(pointerId);
          }
        }
        dragMode = null;
        activePointerId = null;
        activeTouchId = null;
        removeGlobalListeners();
      };

      const startDrag = (mode: DragMode, event: PointerEvent | MouseEvent | TouchEvent) => {
        if (event.cancelable) event.preventDefault();
        if (isDragging) stopDrag();
        isDragging = true;
        dragMode = mode;

        if (mode === 'pointer' && 'pointerId' in event) {
          const pointerEvent = event as PointerEvent;
          activePointerId = pointerEvent.pointerId;
          slider.setPointerCapture?.(pointerEvent.pointerId);
          updateFromClientX(pointerEvent.clientX);
        } else if (mode === 'mouse' && 'clientX' in event) {
          updateFromClientX((event as MouseEvent).clientX);
        } else if (mode === 'touch' && isTouchEvent(event)) {
          const primaryTouch = event.touches.item(0) ?? event.changedTouches.item(0);
          if (!primaryTouch) {
            stopDrag();
            return;
          }
          activeTouchId = primaryTouch.identifier;
          updateFromClientX(primaryTouch.clientX);
        } else {
          stopDrag();
          return;
        }

        addGlobalListeners(mode);
      };

      const onPointerDown = (event: PointerEvent) => startDrag('pointer', event);
      const onMouseDown = (event: MouseEvent) => startDrag('mouse', event);
      const onTouchStart = (event: TouchEvent) => startDrag('touch', event);

      if (supportsPointerEvents) {
        slider.addEventListener('pointerdown', onPointerDown);
      } else {
        slider.addEventListener('mousedown', onMouseDown);
        if (supportsTouch) {
          slider.addEventListener('touchstart', onTouchStart, touchListenerOptions);
        }
      }

      return () => {
        stopDrag();
        if (supportsPointerEvents) {
          slider.removeEventListener('pointerdown', onPointerDown);
        } else {
          slider.removeEventListener('mousedown', onMouseDown);
          if (supportsTouch) {
            slider.removeEventListener('touchstart', onTouchStart);
          }
        }
        handle.removeEventListener('keydown', onHandleKeyDown);
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
