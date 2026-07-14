"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type DeviceType = "mobile" | "tablet" | "desktop";

interface DeviceContextType {
  device: DeviceType;
  isMobile: boolean;
  isDesktop: boolean;
}

const DeviceContext = createContext<DeviceContextType>({
  device: "desktop",
  isMobile: false,
  isDesktop: true,
});

function getDevice(width: number): DeviceType {
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

export function DeviceProvider({
  children,
  initialDevice = "desktop",
}: {
  children: ReactNode;
  initialDevice?: DeviceType;
}) {
  const [device, setDevice] = useState<DeviceType>(initialDevice);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const check = () => setDevice(getDevice(window.innerWidth));
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!mounted) {
    return (
      <DeviceContext.Provider value={{ device: initialDevice, isMobile: initialDevice === "mobile", isDesktop: initialDevice === "desktop" }}>
        {children}
      </DeviceContext.Provider>
    );
  }

  return (
    <DeviceContext.Provider value={{ device, isMobile: device === "mobile", isDesktop: device === "desktop" }}>
      {children}
    </DeviceContext.Provider>
  );
}

export const useDevice = () => useContext(DeviceContext);
