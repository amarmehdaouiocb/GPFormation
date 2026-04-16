"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cancel01Icon, Loading03Icon } from "hugeicons-react";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  
  // URL to embed (could be via env variable)
  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL || "https://calendar.google.com/calendar/appointments/schedules/YOUR_ID_HERE";

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="relative w-full max-w-4xl h-[90dvh] sm:h-[85vh] md:h-[80vh] bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-[2rem] shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 flex flex-col"
          >
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 text-base sm:text-lg">
                Prendre un rendez-vous gratuit
              </h3>
              <button
                onClick={onClose}
                aria-label="Fermer"
                className="p-2 -mr-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Cancel01Icon size={22} />
              </button>
            </div>

            <div className="relative flex-1 bg-zinc-50 dark:bg-zinc-950/50">
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-zinc-400">
                  <Loading03Icon size={32} className="animate-spin text-[#65BA11]" />
                  <p className="text-sm font-medium">Chargement du calendrier...</p>
                </div>
              )}
              <iframe
                src={bookingUrl}
                width="100%"
                height="100%"
                frameBorder="0"
                onLoad={() => setIsLoading(false)}
                className="absolute inset-0 w-full h-full opacity-0 transition-opacity duration-500"
                style={{ opacity: isLoading ? 0 : 1 }}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
