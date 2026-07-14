"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // Register service worker from sw.js
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("[PWA] SW registered"))
        .catch(() => console.log("[PWA] SW registration failed"));
    }
  }, []);

  return null;
}
