"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster(props) {
  return (
    <Sonner
      closeButton
      position="top-right"
      richColors
      toastOptions={{
        duration: 3000,
      }}
      {...props}
    />
  );
}
