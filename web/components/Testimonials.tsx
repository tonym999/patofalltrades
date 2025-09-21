"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassmorphismCard } from "@/components/GlassmorphismCard";
import { TestimonialCard } from "@/components/TestimonialCard";
import { testimonials as testimonialsData } from "@/config/testimonials";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export default function Testimonials() {
  const reduceMotion = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const autoplayIntervalRef = useRef<number | null>(null);
  const resumeTimeoutRef = useRef<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPointerOver, setIsPointerOver] = useState(false);
  const [isFocusWithin, setIsFocusWithin] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);
  const [isUserPaused, setIsUserPaused] = useState(false);

  const testimonials = useMemo(() => testimonialsData, []);
  const total = testimonials.length;

  useEffect(() => {
    const observeTarget = sectionRef.current;
    if (!observeTarget) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );
    observer.observe(observeTarget);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleVisibility = () => setIsDocumentVisible(!document.hidden);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => {
    if (autoplayIntervalRef.current) {
      window.clearInterval(autoplayIntervalRef.current);
      autoplayIntervalRef.current = null;
    }

    const shouldPlay = !reduceMotion && !isUserPaused && !isPointerOver && !isFocusWithin && isInView && isDocumentVisible;
    if (!shouldPlay) return;

    const intervalMs = 5000;
    autoplayIntervalRef.current = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, intervalMs);

    return () => {
      if (autoplayIntervalRef.current) {
        window.clearInterval(autoplayIntervalRef.current);
        autoplayIntervalRef.current = null;
      }
    };
  }, [reduceMotion, isUserPaused, isPointerOver, isFocusWithin, isInView, isDocumentVisible, total]);

  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) window.clearTimeout(resumeTimeoutRef.current);
      if (autoplayIntervalRef.current) window.clearInterval(autoplayIntervalRef.current);
    };
  }, []);

  const goTo = (index: number, pauseForMs = 10000) => {
    setCurrentIndex(index);
    setIsUserPaused(true);
    if (resumeTimeoutRef.current) window.clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = window.setTimeout(() => setIsUserPaused(false), pauseForMs);
  };

  const goRelative = (delta: number) => goTo((currentIndex + delta + total) % total);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goRelative(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goRelative(-1);
    }
  };

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      data-testid="testimonials-section"
      className="py-24 md:py-40 bg-dark-navy/50"
      tabIndex={-1}
      onMouseEnter={() => setIsPointerOver(true)}
      onMouseLeave={() => setIsPointerOver(false)}
      onFocus={() => setIsFocusWithin(true)}
      onBlur={() => setIsFocusWithin(false)}
      onKeyDown={handleKeyDown}
      aria-roledescription="carousel"
      aria-label="Client testimonials"
    >
      <div className="container mx-auto px-6">
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 30 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={reduceMotion ? undefined : { duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">What Clients Say</h2>
          <p className="text-gray-300 mt-4">Don&#39;t just take our word for it. Here&#39;s what our satisfied clients across London have to say.</p>
        </motion.div>

        <div className="max-w-[72ch] mx-auto mb-10 md:mb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -20 }}
              transition={reduceMotion ? undefined : { duration: 0.4 }}
            >
              <GlassmorphismCard
                outerClassName="rounded-2xl"
                contentClassName="p-0 rounded-2xl min-h-[280px] md:min-h-[240px]"
              >
                <TestimonialCard
                  quote={testimonials[currentIndex].text}
                  rating={testimonials[currentIndex].rating}
                  name={testimonials[currentIndex].name}
                  projectType={testimonials[currentIndex].service}
                  location={testimonials[currentIndex].area}
                  className="bg-transparent border-0 shadow-none"
                  readMore={false}
                />
              </GlassmorphismCard>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-center gap-3 mb-8" role="tablist" aria-label="Testimonials navigation">
          {testimonials.map((t, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goTo(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 cursor-pointer ${
                index === currentIndex ? "bg-amber-400 scale-110" : "bg-gray-600 hover:bg-gray-500"
              }`}
              aria-label={`Show testimonial ${index + 1}: ${t.name} from ${t.area}`}
              aria-current={index === currentIndex}
              aria-selected={index === currentIndex}
              tabIndex={index === currentIndex ? 0 : -1}
              data-testid={`testimonial-dot-${index}`}
              role="tab"
            />
          ))}
        </div>
        
      </div>
    </section>
  );
}
