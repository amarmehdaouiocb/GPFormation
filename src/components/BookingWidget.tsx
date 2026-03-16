"use client";

import { useState } from "react";
import FloatingBookingButton from "./FloatingBookingButton";
import BookingModal from "./BookingModal";

export default function BookingWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <FloatingBookingButton onClick={() => setIsOpen(true)} />
      <BookingModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
