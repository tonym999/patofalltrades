'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

export default function Scripts() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // --- Global Animations ---
    const animateOnScroll = (element: Element | string, vars?: gsap.TweenVars) => {
      gsap.from(element, {
        scrollTrigger: {
          trigger: element,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 50,
        duration: 0.8,
        ease: 'power3.out',
        ...vars
      });
    };

    // Animate section titles
    document.querySelectorAll('h2, h3').forEach(el => animateOnScroll(el));
    // Animate service cards
    (gsap.utils.toArray('.service-card') as Element[]).forEach((card, i) => {
      animateOnScroll(card, { delay: i * 0.1 });
    });
    // Animate about section content
    animateOnScroll('.md\\:w-1\\/2 img');
    animateOnScroll('.md\\:w-1\\/2 p');
    animateOnScroll('.grid.grid-cols-2');
    // Animate testimonial
    animateOnScroll('.testimonial-card');
    // Animate contact form
    animateOnScroll('.max-w-xl.mx-auto.glass-card');

    // --- Sticky Nav ---
    const nav = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
      if (!nav) return;
      if (window.scrollY > 50) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    });

    // --- Hero Section Animations ---
    const heroTitle = new SplitType('#hero-title', { types: 'chars' });
    gsap.from(heroTitle.chars, {
      duration: 1,
      opacity: 0,
      y: 50,
      ease: 'back.out(1.7)',
      stagger: 0.05,
      delay: 0.5
    });
    gsap.from('#hero-subtitle', { duration: 1, opacity: 0, y: 20, ease: 'power2.out', delay: 1.2 });
    gsap.from('#hero-content .cta-btn', { duration: 1, opacity: 0, scale: 0.8, ease: 'back.out(1.7)', delay: 1.5 });

    // --- Animated Counters ---
    const counters = document.querySelectorAll('.counter');
    counters.forEach((counter) => {
      ScrollTrigger.create({
        trigger: counter,
        start: 'top 85%',
        onEnter: () => {
          const attr = counter.getAttribute('data-target');
          const target = attr ? +attr : 0;
          gsap.to(counter, {
            duration: 2,
            innerText: target,
            roundProps: "innerText",
            ease: "power2.out"
          });
        },
        once: true
      });
    });

    // --- Before/After Slider ---
    const slider = document.querySelector<HTMLElement>('.comparison-slider');
    if (slider) {
      const afterImage = slider.querySelector<HTMLElement>('.after-image');
      const handle = slider.querySelector<HTMLElement>('.slider-handle');
      let isDragging = false;

      const startDrag = () => isDragging = true;
      const stopDrag = () => isDragging = false;

      const onDrag = (event: MouseEvent | TouchEvent) => {
        if (!isDragging) return;
        let clientX: number;
        if (event instanceof TouchEvent) {
          if (event.touches.length === 0) return;
          clientX = event.touches[0].clientX;
        } else {
          clientX = event.clientX;
        }
        const rect = slider.getBoundingClientRect();
        let x = clientX - rect.left;
        if (x < 0) x = 0;
        if (x > rect.width) x = rect.width;

        const widthPercentage = (x / rect.width) * 100;
        if (afterImage && handle) {
          afterImage.style.width = `${widthPercentage}%`;
          handle.style.left = `${widthPercentage}%`;
        }
      };

      const onMouseMove = (e: MouseEvent) => onDrag(e);
      const onTouchMove = (e: TouchEvent) => onDrag(e);

      slider.addEventListener('mousedown', startDrag);
      slider.addEventListener('touchstart', startDrag);
      window.addEventListener('mouseup', stopDrag);
      window.addEventListener('touchend', stopDrag);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('touchmove', onTouchMove);
    }

    // Scroll progress handled by framer-motion component now

    // Location badge removed; keeping future hook point
  }, []);

  return null;
}
