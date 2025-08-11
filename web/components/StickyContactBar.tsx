"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, MessageCircle, Phone, X } from "lucide-react";

export default function StickyContactBar() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 800);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Run once on mount in case the user lands mid-page
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const contactOptions = [
    {
      icon: Phone,
      label: "Call Now",
      href: "tel:+447123456789",
      color: "bg-blue-500 hover:bg-blue-600",
      description: "Speak directly with Pat",
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      href: "https://wa.me/447123456789",
      color: "bg-green-500 hover:bg-green-600",
      description: "Quick message response",
    },
    {
      icon: Mail,
      label: "Email",
      href: "mailto:pat@patofalltrades.co.uk",
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
              onClick={() => setIsExpanded(false)}
            />
          )}

          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
          >
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  className="bg-slate-900/95 backdrop-blur-md border-t border-amber-400/20 p-4"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-semibold">Get In Touch</h3>
                    <button
                      onClick={() => setIsExpanded(false)}
                      className="text-gray-400 hover:text-white"
                      aria-label="Close contact options"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {contactOptions.map((option, index) => (
                      <motion.a
                        key={index}
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
                    href="tel:+447123456789"
                    whileTap={{ scale: 0.95 }}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-900 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                  >
                    Call Now
                  </motion.a>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsExpanded((prev) => !prev)}
                    className="border border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-slate-900 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
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


