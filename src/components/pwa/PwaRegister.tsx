"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("NutriClinic PWA Service Worker registrado con éxito:", registration.scope);
          })
          .catch((error) => {
            console.warn("Fallo al registrar Service Worker PWA:", error);
          });
      });
    }
  }, []);

  return null;
}
