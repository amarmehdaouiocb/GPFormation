"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar01Icon } from "hugeicons-react";
import { cn } from "@/lib/utils";

interface FloatingBookingButtonProps {
  onClick: () => void;
}

export default function FloatingBookingButton({ onClick }: FloatingBookingButtonProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show after 2 seconds or after scrolling 300px
    const handleScroll = () => {
      if (window.scrollY > 300 && !isVisible) {
        setIsVisible(true);
      }
    };

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    window.addEventListener("scroll", handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          onClick={onClick}
          style={{
            bottom: "max(1rem, env(safe-area-inset-bottom))",
          }}
          className={cn(
            "fixed right-4 sm:right-6 md:right-8 z-40",
            "flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-full",
            "bg-gradient-to-r from-[#7ED321] to-[#4CAF50] text-white",
            "shadow-[0_10px_40px_-10px_rgba(126,211,33,0.6)]",
            "border border-white/20",
            "group overflow-hidden"
          )}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]" />

          <Calendar01Icon size={22} className="relative z-10 sm:size-6" />
          <span className="font-semibold tracking-wide text-sm sm:text-base relative z-10 hidden md:block">
            Prendre RDV
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
