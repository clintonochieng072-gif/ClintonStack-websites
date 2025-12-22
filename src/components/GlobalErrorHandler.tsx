"use client";

import { useEffect } from "react";

export default function GlobalErrorHandler() {
  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled Promise Rejection:", event.reason);
      if (event.reason instanceof Error) {
        console.error("Stack trace:", event.reason.stack);
      }
      // Don't prevent default to allow Next.js to handle it
    };

    // Handle uncaught errors
    const handleError = (event: ErrorEvent) => {
      console.error("Uncaught Error:", event.error);
      console.error("Stack trace:", event.error?.stack);
      console.error(
        "File:",
        event.filename,
        "Line:",
        event.lineno,
        "Column:",
        event.colno
      );
      // Don't prevent default
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleError);

    return () => {
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
      window.removeEventListener("error", handleError);
    };
  }, []);

  return null; // This component doesn't render anything
}
