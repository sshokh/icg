"use client";

import { HeroUIProvider } from "@heroui/react";
import { ToastProvider } from "@heroui/toast";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export function Providers({ children }) {
  const router = useRouter();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      !!localStorage.getItem("user")
        ? setVerified(true)
        : router.replace("/auth");
    }

    checkAuth();
  }, [router]);

  return (
    <HeroUIProvider navigate={router.push}>
      <ToastProvider />
      {children}
    </HeroUIProvider>
  );
}
