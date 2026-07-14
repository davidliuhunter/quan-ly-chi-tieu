"use client";

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  undoAction?: () => void;
}

interface ToastContextType {
  show: (message: string, type?: Toast["type"], undoAction?: () => void) => void;
}

const ToastContext = createContext<ToastContextType>({ show: () => {} });
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: Toast["type"] = "info", undoAction?: () => void) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type, undoAction }]);
    if (!undoAction) {
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
    }
  }, []);

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-20 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:w-96 z-[60] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`pointer-events-auto rounded-2xl px-4 py-3 shadow-lg backdrop-blur-xl flex items-center justify-between gap-3 ${
                toast.type === "success"
                  ? "bg-green-500/90 text-white"
                  : toast.type === "error"
                  ? "bg-red-500/90 text-white"
                  : "bg-gray-900/90 dark:bg-white/90 text-white dark:text-gray-900"
              }`}
            >
              <span className="text-sm font-medium">{toast.message}</span>
              <div className="flex items-center gap-2 flex-shrink-0">
                {toast.undoAction && (
                  <button
                    onClick={() => { toast.undoAction!(); dismiss(toast.id); }}
                    className="text-sm font-bold underline underline-offset-2"
                  >
                    Undo
                  </button>
                )}
                <button onClick={() => dismiss(toast.id)} className="text-lg leading-none opacity-70 hover:opacity-100">×</button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
