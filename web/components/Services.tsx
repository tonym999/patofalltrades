"use client";

import { motion } from "framer-motion";
import { Settings, Paintbrush, Zap, Droplets } from "lucide-react";
import { GlassmorphismCard } from "./GlassmorphismCard";
import type { LucideIcon } from "lucide-react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type Service = {
  icon: LucideIcon;
  title: string;
  description: string;
  features: readonly string[];
  gradient: string;
};

const services = [
  {
    icon: Settings,
    title: "General Repairs",
    description:
      "From fixing squeaky doors to mounting TVs, we handle all your household repair needs with precision and care.",
    features: ["Same-day service", "All materials included", "12-month guarantee"],
    gradient: "from-blue-400 to-cyan-500",
  },
  {
    icon: Paintbrush,
    title: "Painting & Decorating",
    description:
      "Transform your space with our professional painting services. Interior and exterior work with premium materials.",
    features: ["Premium paints", "Surface preparation", "Clean finish guarantee"],
    gradient: "from-green-400 to-emerald-500",
  },
  {
    icon: Zap,
    title: "Electrical Work",
    description:
      "Safe and certified electrical installations, repairs, and maintenance. From light fixtures to full rewiring.",
    features: ["Certified & insured", "Safety first", "Modern fittings"],
    gradient: "from-amber-400 to-orange-500",
  },
  {
    icon: Droplets,
    title: "Plumbing Services",
    description:
      "Reliable plumbing solutions for leaks, installations, and emergency repairs. Available 24/7 for urgent issues.",
    features: ["Leak detection", "Fast call-outs", "Neat installation"],
    gradient: "from-indigo-400 to-sky-500",
  },
 ] as const satisfies readonly Service[];

const toSlug = (s: string): string =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function Services() {
  const shouldReduceMotion = usePrefersReducedMotion();

  const headingMotionProps = shouldReduceMotion
    ? { initial: false as const }
    : {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        transition: { duration: 0.8 },
        viewport: { once: true as const },
      };
  return (
    <section id="services" className="py-24 md:py-40 relative" aria-labelledby="services-heading">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.08),transparent_50%)]" />
      </div>

      <div className="container mx-auto px-6 relative">
        <motion.div
          {...headingMotionProps}
          className="text-center mb-16"
        >
          <h2 id="services-heading" className="text-4xl md:text-5xl font-bold text-white">Our Services</h2>
          <p className="text-lg md:text-xl text-gray-300/90 mt-4 max-w-3xl mx-auto">
            Comprehensive handyman services delivered with precision, professionalism, and pride. No job too big or small.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <GlassmorphismCard
              key={service.title}
              delay={index * 0.1}
              contentClassName="p-6 sm:p-8 h-full"
              data-testid="service-card"
              data-service={toSlug(service.title)}
            >
              <div
                data-testid="service-icon"
                className={`w-16 h-16 bg-gradient-to-r ${service.gradient} rounded-xl flex items-center justify-center mb-6 shadow-lg ${shouldReduceMotion ? "motion-reduce:animate-none" : "group-focus-within:animate-[spin_1800ms_linear] group-hover:animate-[spin_1800ms_linear] motion-reduce:animate-none"}`}
              >
                <service.icon aria-hidden="true" className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-amber-400 group-focus-within:text-amber-400 transition-colors duration-200">
                {service.title}
              </h3>

              <p className="text-gray-300 mb-4 leading-relaxed group-hover:text-gray-200 group-focus-within:text-gray-200 transition-colors duration-200">{service.description}</p>

              {/* Focus/hover progress bar directly under description */}
              <div className={`h-1 bg-slate-700/40 rounded-full overflow-hidden mb-6 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300`} aria-hidden="true">
                <div
                  data-testid="service-progress"
                  className={`h-full w-0 bg-gradient-to-r ${service.gradient} group-hover:w-full group-focus-within:w-full ${
                    shouldReduceMotion
                      ? "transition-none duration-0"
                      : "transition-[width] duration-[1800ms] ease-in-out"
                  } motion-reduce:transition-none motion-reduce:duration-0`}
                />
              </div>

              <ul className="space-y-2 mb-6">
                {service.features.map((feature, featureIndex) => (
                  <motion.li
                    key={feature}
                    initial={shouldReduceMotion ? undefined : { opacity: 0, x: -20 }}
                    whileInView={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
                    transition={shouldReduceMotion ? undefined : { delay: 0.2 + featureIndex * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center text-sm text-gray-400"
                  >
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mr-3" />
                    {feature}
                  </motion.li>
                ))}
              </ul>

              {/* Hover underline accent (CSS-driven for group hover/focus) */}
              <div
                aria-hidden="true"
                className={`mt-2 h-0.5 bg-gradient-to-r ${service.gradient} rounded-full w-0 group-hover:w-full group-focus-within:w-full transition-[width] duration-300 ease-out motion-reduce:transition-none motion-reduce:duration-0`}
              />
            </GlassmorphismCard>
          ))}
        </div>
      </div>
    </section>
  );
}
