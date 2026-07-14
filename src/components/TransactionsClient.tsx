"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createTransaction, updateTransaction, deleteTransaction } from "@/lib/actions";
import type { Transaction, Category } from "@/lib/types";
import BottomSheet from "./BottomSheet";
import FormattedNumberInput from "./FormattedNumberInput";
import { useToast } from "./Toast";
import { useDevice } from "./DeviceProvider";
import EmptyState from "./EmptyState";

const formatMoney = (amount: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
const QUICK_AMOUNTS = [10000, 20000, 50000, 100000, 200000, 500000];
interface Props { transactions: Transaction[]; categories: Category[]; }

export default function TransactionsClient({ transactions, categories }: Props) {
  const sp = useSearchParams();
  const { show: showToast } = useToast();
  const { isDesktop } = useDevice();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [filt, setFilt] = useState<"all" | "income" | "expense">("all");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { if (sp.get("add") === "1") setShowForm(true); }, [sp]);

  const fCat = categories.filter((c) => filt === "all" || c.type === filt);
  const fTx = transactions
    .filter((tx) => filt === "all" || tx.type === filt)
    .filter((tx) => !q || tx.description?.toLowerCase().includes(q.toLowerCase()) || tx.category?.name?.toLowerCase().includes(q.toLowerCase()))
    .filter((tx) => !dateFrom || tx.transaction_date >= dateFrom)
    .filter((tx) => !dateTo || tx.transaction_date <= dateTo)
    .filter((tx) => !amountMin || tx.amount >= Number(amountMin))
    .filter((tx) => !amountMax || tx.amount <= Number(amountMax));

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setLoading(true); setErr("");
    const fd = new FormData(e.currentTarget);
    const raw = (fd.get("amount_raw") as string) || (fd.get("amount") as string) || "0";
    fd.set("amount", raw.replace(/[,.]/g, "").trim()); // bỏ cả dấu phẩy và chấm
    const r = editing ? await updateTransaction(editing.id, fd) : await createTransaction(fd);
    if (!r.success) setErr(r.error ?? "Lỗi"); else { setShowForm(false); setEditing(null); }
    setLoading(false);
  };
  const del = async (id: string) => { await deleteTransaction(id); showToast("Đã xóa giao dịch", "success"); };
  const edit = (tx: Transaction) => { setEditing(tx); setShowForm(true); };
  const add = () => { setEditing(null); setShowForm(true); };
  const today = new Date().toISOString().slice(0, 10);

  const qaClick = (amt: number) => {
    const displays = document.querySelectorAll<HTMLInputElement>('input[name="amount"]');
    displays.forEach((inp) => {
      inp.value = amt.toLocaleString("vi-VN");
      inp.dispatchEvent(new Event("input", { bubbles: true }));
    });
  };

  const formContent = () => (
    <form name="txForm" onSubmit={submit} className="space-y-4">
      <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loại</label>
        <select name="type" defaultValue={editing?.type ?? "expense"} className="input-field" onChange={(e) => setFilt(e.target.value as "income" | "expense")}>
          <option value="expense">Chi tiêu</option><option value="income">Thu nhập</option></select></div>
      <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số tiền (VNĐ)</label>
        <FormattedNumberInput name="amount" value={editing?.amount} placeholder="VD: 50,000" required />
        <div className="flex flex-wrap gap-2 mt-2">{QUICK_AMOUNTS.map((a) => (<button key={a} type="button" onClick={() => qaClick(a)} className="px-3 py-1.5 text-xs rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 active:scale-95 transition-all">{a.toLocaleString("vi-VN")}</button>))}</div></div>
      <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Danh mục</label>
        <select name="category_id" defaultValue={editing?.category_id ?? ""} className="input-field"><option value="">-- Chọn danh mục --</option>{fCat.map((c) => (<option key={c.id} value={c.id}>{c.icon} {c.name}</option>))}</select></div>
      <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ngày</label>
        <input name="transaction_date" type="date" defaultValue={editing?.transaction_date ?? today} className="input-field" required /></div>
      <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ghi chú</label>
        <input name="description" defaultValue={editing?.description ?? ""} className="input-field" placeholder="VD: Cơm trưa văn phòng" /></div>
      {err && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 px-3 py-2 rounded-lg">{err}</p>}
      <div className="flex gap-2"><button type="submit" disabled={loading} className="btn-primary text-sm flex-1">{loading ? "Đang lưu..." : editing ? "Cập nhật" : "Thêm"}</button>
        <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn-ghost text-sm">Hủy</button></div>
    </form>
  );

  return (<div className="space-y-4">
    <div className="card-glass space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1 bg-white/60 dark:bg-gray-800/60 rounded-xl p-1 border border-gray-200/50 dark:border-gray-700/50">
          {(["all","expense","income"] as const).map((f) => (<button key={f} onClick={() => setFilt(f)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all active:scale-95 ${filt===f?"bg-blue-600 text-white shadow-md":"text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>{f==="all"?"Tất cả":f==="expense"?"Chi tiêu":"Thu nhập"}</button>))}</div>
        <button onClick={add} className="btn-primary text-sm">+ Thêm giao dịch</button></div>
      <input className="input-field" placeholder="🔍 Tìm theo mô tả hoặc danh mục..." value={q} onChange={(e) => setQ(e.target.value)} />
      <button onClick={() => setShowFilters(!showFilters)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
        {showFilters ? "Ẩn lọc nâng cao" : "Lọc nâng cao ▼"}
      </button>
      {showFilters && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
          <div><label className="text-xs text-gray-500">Từ ngày</label><input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className="input-field !py-1.5 text-xs" /></div>
          <div><label className="text-xs text-gray-500">Đến ngày</label><input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} className="input-field !py-1.5 text-xs" /></div>
          <div><label className="text-xs text-gray-500">Từ (VNĐ)</label><input type="number" placeholder="0" value={amountMin} onChange={e=>setAmountMin(e.target.value)} className="input-field !py-1.5 text-xs" /></div>
          <div><label className="text-xs text-gray-500">Đến (VNĐ)</label><input type="number" placeholder="999tr" value={amountMax} onChange={e=>setAmountMax(e.target.value)} className="input-field !py-1.5 text-xs" /></div>
        </div>
      )}</div>

    {isDesktop && showForm && (<div className="card-glass"><h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">{editing?"✏️ Sửa giao dịch":"➕ Thêm giao dịch mới"}</h2>{formContent()}</div>)}
    {!isDesktop && (<BottomSheet open={showForm} onClose={()=>{setShowForm(false);setEditing(null);}} title={editing?"Sửa giao dịch":"Thêm giao dịch"}>{formContent()}</BottomSheet>)}

    {fTx.length===0 && !q ? (<EmptyState icon="💳" title="Chưa có giao dịch nào" description="Thêm giao dịch đầu tiên để bắt đầu theo dõi chi tiêu" action={<button onClick={add} className="btn-primary">+ Thêm giao dịch</button>} />)
      : fTx.length===0 ? (<EmptyState icon="🔍" title="Không tìm thấy giao dịch" description="Thử tìm với từ khóa khác" />)
      : (<div className="card-glass divide-y divide-gray-100 dark:divide-gray-800"><AnimatePresence>{fTx.map((tx)=>(<motion.div key={tx.id} layout initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="flex items-center justify-between py-3 px-1 group">
        <div className="flex items-center gap-3 flex-1 min-w-0"><span className="text-xl flex-shrink-0">{tx.category?.icon??"📌"}</span>
          <div className="min-w-0"><p className="font-medium text-gray-800 dark:text-gray-100 text-sm truncate">{tx.category?.name??"Không danh mục"}</p>{tx.description&&<p className="text-xs text-gray-400 dark:text-gray-500 truncate">{tx.description}</p>}<p className="text-xs text-gray-400 dark:text-gray-500">{new Date(tx.transaction_date).toLocaleDateString("vi-VN")}</p></div></div>
        <div className="flex items-center gap-2 flex-shrink-0"><span className={`font-semibold text-sm ${tx.type==="income"?"text-green-500":"text-red-500"}`}>{tx.type==="income"?"+":"-"}{formatMoney(tx.amount)}</span>
          <div className="hidden group-hover:flex gap-1"><button onClick={()=>edit(tx)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Sửa</button><button onClick={()=>del(tx.id)} className="text-xs text-red-500 hover:underline">Xóa</button></div></div>
      </motion.div>))}</AnimatePresence></div>)}
  </div>);
}