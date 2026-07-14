"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import { useDevice } from "@/components/DeviceProvider";
import MobileBottomNav from "@/components/MobileBottomNav";

const navItems = [
  { href: "/quan-tri", label: "📊 Tổng quan", icon: "📊", exact: true },
  { href: "/quan-tri/giao-dich", label: "💳 Giao dịch", icon: "💳" },
  { href: "/quan-tri/ngan-sach", label: "🎯 Ngân sách", icon: "🎯" },
  { href: "/quan-tri/muc-tieu", label: "🏆 Mục tiêu", icon: "🏆" },
  { href: "/quan-tri/danh-muc", label: "⚙️ Danh mục", icon: "⚙️" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const { theme, toggle } = useTheme();
  const { isDesktop } = useDevice();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authorized) return null;

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen gradient-bg pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 md:ml-56">
            <span className="text-xl">💰</span>
            <span className="font-bold text-gray-800 dark:text-gray-100 text-sm sm:text-base">
              Quản Lý Chi Tiêu
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggle}
              className="p-2 rounded-xl text-lg hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-90 transition-all"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <button onClick={handleLogout} className="btn-ghost text-sm">
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto flex">
        {/* Desktop Sidebar */}
        {isDesktop && (
          <aside
            className={`fixed left-0 top-14 bottom-0 z-10 bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl border-r border-gray-200/50 dark:border-gray-800/50 flex flex-col py-4 transition-all duration-200 ${
              sidebarCollapsed ? "w-16" : "w-56"
            }`}
          >
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="self-end px-3 py-1 mb-2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {sidebarCollapsed ? "→" : "←"}
            </button>
            <nav className="flex-1 space-y-1 px-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 ${
                    isActive(item.href, item.exact)
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <span className="text-lg flex-shrink-0">{item.icon}</span>
                  {!sidebarCollapsed && <span>{item.label.split(" ")[1]}</span>}
                </Link>
              ))}
            </nav>
            <div className="px-3 pb-2">
              {!sidebarCollapsed && (
                <p className="text-[10px] text-gray-400 dark:text-gray-600 text-center">
                  v2.0 · Mobile UX
                </p>
              )}
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main
          className={`flex-1 min-h-[calc(100vh-3.5rem)] px-4 py-4 md:py-6 transition-all ${
            isDesktop ? (sidebarCollapsed ? "ml-16" : "ml-56") : ""
          }`}
        >
          {/* Desktop nav tabs (tablet only - not full desktop) */}
          <nav className="hidden sm:flex md:hidden gap-1 mb-6 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-1 border border-gray-200/50 dark:border-gray-800/50 overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-shrink-0 text-center py-2 px-3 rounded-xl text-sm font-medium transition-all active:scale-95 ${
                  isActive(item.href, item.exact)
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Page content with CSS fade transition */}
          <div
            key={pathname}
            className="animate-fadeIn"
          >
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav (only on mobile) */}
      {!isDesktop && <MobileBottomNav />}
    </div>
  );
}
