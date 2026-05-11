"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FloatingBookingButton from "./FloatingBookingButton";
import BookingModal from "./BookingModal";

const FALLBACK_PLACEHOLDER = "YOUR_ID_HERE";

export default function BookingWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL ?? "";
  const isBookingConfigured =
    bookingUrl.length > 0 && !bookingUrl.includes(FALLBACK_PLACEHOLDER);

  const handleClick = () => {
    if (isBookingConfigured) {
      setIsOpen(true);
    } else {
      router.push("/contact");
    }
  };

  return (
    <>
      <FloatingBookingButton onClick={handleClick} />
      <BookingModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
