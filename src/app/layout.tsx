import type { Metadata } from "next";
import { headers } from "next/headers";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/Toast";
import { DeviceProvider, type DeviceType } from "@/components/DeviceProvider";
import PwaRegister from "@/components/PwaRegister";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Quản Lý Chi Tiêu Cá Nhân",
  description: "Theo dõi thu nhập và chi tiêu hàng ngày một cách dễ dàng",
  manifest: "/manifest.json",
  other: {
    "theme-color": "#2563eb",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  },
  icons: {
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

function detectDevice(userAgent: string | null): DeviceType {
  if (!userAgent) return "desktop";
  const ua = userAgent.toLowerCase();
  if (/mobile|android|iphone|ipod|blackberry|windows phone/.test(ua)) return "mobile";
  if (/ipad|tablet|playbook|silk/.test(ua)) return "tablet";
  return "desktop";
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = headers();
  const userAgent = headersList.get("user-agent");
  const initialDevice = detectDevice(userAgent);

  return (
    <html lang="vi" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
        <ThemeProvider>
          <ToastProvider>
            <DeviceProvider initialDevice={initialDevice}>
              <PwaRegister />
              {children}
            </DeviceProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
