"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTheme } from "./ThemeProvider";

const tabs = [
  { href: "/quan-tri", label: "📊", title: "Tổng quan" },
  { href: "/quan-tri/giao-dich", label: "💳", title: "Giao dịch" },
  { href: "/quan-tri/ngan-sach", label: "🎯", title: "Ngân sách" },
  { href: "/quan-tri/muc-tieu", label: "🏆", title: "Mục tiêu" },
  { href: "/quan-tri/dinh-ky", label: "🔄", title: "Định kỳ" },
  { href: "/quan-tri/danh-muc", label: "⚙️", title: "Danh mục" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === "/quan-tri") return pathname === "/quan-tri";
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.href}
            onClick={() => router.push(tab.href)}
            className="relative flex flex-col items-center justify-center flex-1 h-full min-h-[48px] active:scale-90 transition-transform"
          >
            {isActive(tab.href) && (
              <motion.div
                layoutId="bottomNav"
                className="absolute inset-1 bg-blue-50 dark:bg-blue-900/30 rounded-xl"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative text-xl">{tab.label}</span>
            <span
              className={`relative text-[10px] mt-0.5 ${
                isActive(tab.href)
                  ? "text-blue-600 dark:text-blue-400 font-medium"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            >
              {tab.title}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
