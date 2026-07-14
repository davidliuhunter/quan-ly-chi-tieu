"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createTransaction, updateTransaction, deleteTransaction } from "@/lib/actions";
import type { Transaction, Category } from "@/lib/types";
import BottomSheet from "./BottomSheet";
import { useToast } from "./Toast";
import { useDevice } from "./DeviceProvider";
import EmptyState from "./EmptyState";

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

const QUICK_AMOUNTS = [10000, 20000, 50000, 100000, 200000, 500000];

interface Props { transactions: Transaction[]; categories: Category[]; }

function FormFields({ editing, filteredCategories, onFilterChange, filter }: { editing: Transaction | null; filteredCategories: Category[]; onFilterChange: (v: "income" | "expense") => void; filter: string; }) {
  const today = new Date().toISOString().slice(0, 10);
  const [amountDisplay, setAmountDisplay] = useState("");

  useEffect(() => {
    if (editing?.amount) setAmountDisplay(editing.amount.toLocaleString("vi-VN"));
    else setAmountDisplay("");
  }, [editing?.id, editing?.amount]);

  const handleAmountChange = (val: string) => {
    // Remove all non-digit chars for storage, format display
    const raw = val.replace(/,/g, "").replace(/\D/g, "");
    const num = Number(raw);
    setAmountDisplay(raw ? num.toLocaleString("vi-VN") : "");
  };

  return (<>
    <div className="space-y-4">
      <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loại</label><select name="type" defaultValue={editing?.type ?? "expense"} className="input-field" onChange={(e) => onFilterChange(e.target.value as "income" | "expense")}><option value="expense">Chi tiêu</option><option value="income">Thu nhập</option></select></div>
      <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số tiền (VNĐ)</label>
        <input name="amount" type="text" inputMode="numeric" value={amountDisplay} onChange={(e) => handleAmountChange(e.target.value)} className="input-field" placeholder="VD: 50,000" required />
        <input name="amount_raw" type="hidden" value={amountDisplay.replace(/,/g, "")} />
        <div className="flex flex-wrap gap-2 mt-2">{QUICK_AMOUNTS.map((amt) => (<button key={amt} type="button" onClick={() => setAmountDisplay(amt.toLocaleString("vi-VN"))} className="px-3 py-1.5 text-xs rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 active:scale-95 transition-all">{amt.toLocaleString("vi-VN")}</button>))}</div></div>
      <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Danh mục</label><select name="category_id" defaultValue={editing?.category_id ?? ""} className="input-field"><option value="">-- Chọn danh mục --</option>{filteredCategories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>))}</select></div>
      <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ngày</label><input name="transaction_date" type="date" defaultValue={editing?.transaction_date ?? today} className="input-field" required /></div>
      <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ghi chú</label><input name="description" defaultValue={editing?.description ?? ""} className="input-field" placeholder="VD: Cơm trưa văn phòng" /></div>
    </div>
  </>);
}

export default function TransactionsClient({ transactions, categories }: Props) {
  const sp = useSearchParams();
  const { show: showToast } = useToast();
  const { isDesktop } = useDevice();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => { if (sp.get("add") === "1") setShowForm(true); }, [sp]);

  const fCat = categories.filter((c) => filter === "all" || c.type === filter);
  const fTx = transactions.filter((tx) => filter === "all" || tx.type === filter).filter((tx) => !q || tx.description?.toLowerCase().includes(q.toLowerCase()) || tx.category?.name?.toLowerCase().includes(q.toLowerCase()));

  const submit = async (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); setSubmitting(true); setErr(""); const fd = new FormData(e.currentTarget); const raw = fd.get("amount_raw") as string; if (raw) fd.set("amount", raw); else { const display = fd.get("amount") as string; fd.set("amount", display.replace(/,/g, "")); } const r = editing ? await updateTransaction(editing.id, fd) : await createTransaction(fd); if (!r.success) setErr(r.error ?? "Lỗi"); else { setShowForm(false); setEditing(null); (e.target as HTMLFormElement).reset(); } setSubmitting(false); };
  const del = async (id: string) => { await deleteTransaction(id); showToast("Đã xóa giao dịch", "success"); };
  const edit = (tx: Transaction) => { setEditing(tx); setShowForm(true); };
  const add = () => { setEditing(null); setShowForm(true); };

  const form = (<form onSubmit={submit} className="space-y-4"><FormFields editing={editing} filteredCategories={fCat} onFilterChange={setFilter} filter={filter} />{err && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 px-3 py-2 rounded-lg">{err}</p>}<div className="flex gap-2"><button type="submit" disabled={submitting} className="btn-primary text-sm flex-1">{submitting ? "Đang lưu..." : editing ? "Cập nhật" : "Thêm"}</button><button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn-ghost text-sm">Hủy</button></div></form>);

  return (<div className="space-y-4">
    <div className="card-glass space-y-3"><div className="flex items-center justify-between flex-wrap gap-2"><div className="flex gap-1 bg-white/60 dark:bg-gray-800/60 rounded-xl p-1 border border-gray-200/50 dark:border-gray-700/50">{(["all","expense","income"] as const).map((f) => (<button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all active:scale-95 ${filter===f?"bg-blue-600 text-white shadow-md":"text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>{f==="all"?"Tất cả":f==="expense"?"Chi tiêu":"Thu nhập"}</button>))}</div><button onClick={add} className="btn-primary text-sm">+ Thêm giao dịch</button></div><input className="input-field" placeholder="🔍 Tìm theo mô tả hoặc danh mục..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
    {isDesktop && showForm && (<div className="card-glass"><h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">{editing ? "✏️ Sửa giao dịch" : "➕ Thêm giao dịch mới"}</h2>{form}</div>)}
    {!isDesktop && (<BottomSheet open={showForm} onClose={() => { setShowForm(false); setEditing(null); }} title={editing ? "Sửa giao dịch" : "Thêm giao dịch"}>{form}</BottomSheet>)}
    {fTx.length === 0 && !q ? (<EmptyState icon="💳" title="Chưa có giao dịch nào" description="Thêm giao dịch đầu tiên để bắt đầu theo dõi chi tiêu" action={<button onClick={add} className="btn-primary">+ Thêm giao dịch</button>} />) : fTx.length === 0 ? (<EmptyState icon="🔍" title="Không tìm thấy giao dịch" description="Thử tìm với từ khóa khác" />) : (<div className="card-glass divide-y divide-gray-100 dark:divide-gray-800"><AnimatePresence>{fTx.map((tx) => (<motion.div key={tx.id} layout initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,height:0}} className="flex items-center justify-between py-3 px-1 group"><div className="flex items-center gap-3 flex-1 min-w-0"><span className="text-xl flex-shrink-0">{tx.category?.icon ?? "📌"}</span><div className="min-w-0"><p className="font-medium text-gray-800 dark:text-gray-100 text-sm truncate">{tx.category?.name ?? "Không danh mục"}</p>{tx.description && <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{tx.description}</p>}<p className="text-xs text-gray-400 dark:text-gray-500">{new Date(tx.transaction_date).toLocaleDateString("vi-VN")}</p></div></div><div className="flex items-center gap-2 flex-shrink-0"><span className={`font-semibold text-sm ${tx.type==="income"?"text-green-500":"text-red-500"}`}>{tx.type==="income"?"+":"-"}{formatMoney(tx.amount)}</span><div className="hidden group-hover:flex gap-1"><button onClick={() => edit(tx)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Sửa</button><button onClick={() => del(tx.id)} className="text-xs text-red-500 hover:underline">Xóa</button></div></div></motion.div>))}</AnimatePresence></div>)}
  </div>);
}