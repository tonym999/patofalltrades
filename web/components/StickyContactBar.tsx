"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, MessageCircle, Phone, X } from "lucide-react";
import { CONTACT_INFO } from "@/config/contact";

export default function StickyContactBar() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const moreButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    let rafId: number | null = null
    const handleScroll = () => {
      if (rafId !== null) return
      rafId = requestAnimationFrame(() => {
        const y =
          window.scrollY ??
          window.pageYOffset ??
          document.documentElement?.scrollTop ??
          document.body?.scrollTop ??
          0
        setIsVisible(y > 800)
        rafId = null
      })
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    // Run once on mount in case the user lands mid-page
    handleScroll()
    // And again on the next tick to catch any programmatic scroll during load
    const timeoutId: number = window.setTimeout(handleScroll, 0)
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (rafId !== null) cancelAnimationFrame(rafId)
      window.clearTimeout(timeoutId)
    }
  }, [])

  // Move focus to the close button when the panel opens for better a11y
  useEffect(() => {
    if (isExpanded) {
      closeButtonRef.current?.focus();
    }
  }, [isExpanded])

  const contactOptions = [
    {
      icon: Phone,
      label: "Call Now",
      href: `tel:${CONTACT_INFO.phoneE164}`,
      color: "bg-blue-500 hover:bg-blue-600",
      description: "Speak directly with Pat",
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      href: `https://wa.me/${CONTACT_INFO.whatsappDigits}`,
      color: "bg-green-500 hover:bg-green-600",
      description: "Quick message response",
    },
    {
      icon: Mail,
      label: "Email",
      href: `mailto:${CONTACT_INFO.email}`,
      color: "bg-amber-500 hover:bg-amber-600",
      description: "Detailed project info",
    },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => { setIsExpanded(false); moreButtonRef.current?.focus(); }}
            />
          )}

          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
            data-testid="sticky-contact-bar"
          >
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  id="contact-options-panel"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="contact-options-title"
                  className="bg-slate-900/95 backdrop-blur-md border-t border-amber-400/20 p-4"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 id="contact-options-title" className="text-white font-semibold">Get In Touch</h3>
                    <button
                      ref={closeButtonRef}
                      onClick={() => { setIsExpanded(false); moreButtonRef.current?.focus(); }}
                      className="text-gray-400 hover:text-white"
                      aria-label="Close contact options"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {contactOptions.map((option, index) => (
                      <motion.a
                        key={`contact-${option.label}`}
                        href={option.href}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center space-x-4 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors"
                        onClick={() => setIsExpanded(false)}
                      >
                        <div
                          className={`w-10 h-10 ${option.color} rounded-full flex items-center justify-center transition-colors`}
                        >
                          <option.icon size={18} className="text-white" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{option.label}</div>
                          <div className="text-gray-400 text-sm">{option.description}</div>
                        </div>
                      </motion.a>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-slate-900/95 backdrop-blur-md border-t border-amber-400/20 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                    <Phone size={18} className="text-slate-900" />
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">Need Help?</div>
                    <div className="text-gray-400 text-xs">Tap to contact Pat</div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <motion.a
                    href={`tel:${CONTACT_INFO.phoneE164}`}
                    whileTap={{ scale: 0.95 }}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-900 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                  >
                    Call Now
                  </motion.a>
                  <motion.button
                    ref={moreButtonRef}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsExpanded((prev) => !prev)}
                    className="border border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-slate-900 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                    aria-controls="contact-options-panel"
                    aria-expanded={isExpanded}
                  >
                    More
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


