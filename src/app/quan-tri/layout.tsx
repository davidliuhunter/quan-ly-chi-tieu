"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import MobileBottomNav from "@/components/MobileBottomNav";

const navItems = [
  { href: "/quan-tri", label: "📊 Tổng quan", exact: true },
  { href: "/quan-tri/giao-dich", label: "💳 Giao dịch" },
  { href: "/quan-tri/ngan-sach", label: "🎯 Ngân sách" },
  { href: "/quan-tri/muc-tieu", label: "🏆 Mục tiêu" },
  { href: "/quan-tri/danh-muc", label: "📂 Danh mục" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const isAdmin = sessionStorage.getItem("isAdmin") === "true";
    if (!isAdmin) { router.replace("/dang-nhap"); }
    else { setAuthorized(true); }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem("isAdmin");
    router.replace("/dang-nhap");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!authorized) return null;

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const currentIdx = navItems.findIndex((item) => isActive(item.href, item.exact));

  const handleSwipe = (_: any, info: { offset: { x: number } }) => {
    const swipe = info.offset.x;
    if (swipe < -80 && currentIdx < navItems.length - 1) {
      router.push(navItems[currentIdx + 1].href);
    } else if (swipe > 80 && currentIdx > 0) {
      router.push(navItems[currentIdx - 1].href);
    }
  };

  return (
    <motion.div
      className="min-h-screen gradient-bg pb-20 md:pb-0 overflow-hidden"
      onPanEnd={handleSwipe}
    >
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">💰</span>
            <span className="font-bold text-gray-800 dark:text-gray-100">Quản Lý Chi Tiêu</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggle}
              className="p-2 rounded-lg text-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={theme === "dark" ? "Chế độ sáng" : "Chế độ tối"}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <button onClick={handleLogout} className="btn-ghost text-sm">
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-4 md:py-6">
        {/* Desktop nav tabs */}
        <nav className="hidden md:flex gap-1 mb-6 bg-white dark:bg-gray-900 rounded-xl p-1 border border-gray-200 dark:border-gray-800 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-shrink-0 text-center py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.href, item.exact)
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Animated page content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav />
    </motion.div>
  );
}
