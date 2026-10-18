'use client';

import React, { useState, useEffect } from 'react';
import { DigitalAccountInventory, Product } from '@/lib/types';
import { INITIAL_PRODUCTS } from '@/lib/store';
import { clientStore } from '@/lib/client-store';
import { formatDateTime } from '@/lib/utils';
import {
  Key,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Lock,
  RefreshCw,
  AlertCircle,
  Eye,
  EyeOff,
  Copy,
  Check,
} from 'lucide-react';

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<DigitalAccountInventory[]>([]);
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);
  const [loading, setLoading] = useState(true);

  // New stock form state
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [accountData, setAccountData] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const local = clientStore.getInventory();
      setInventory(local);

      const res = await fetch(`/api/admin/inventory?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.inventory) {
          setInventory(data.inventory);
          clientStore.saveInventory(data.inventory);
        }
      }
    } catch {
      setInventory(clientStore.getInventory());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();

    const handleUpdate = () => {
      setInventory(clientStore.getInventory());
    };

    window.addEventListener('y7x_inventory_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('y7x_inventory_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountData.trim()) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      // 1. Save in clientStore immediately
      const newItem = clientStore.addInventoryItem(selectedProductId, accountData.trim());

      // 2. Post to API if server available
      try {
        await fetch('/api/admin/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: selectedProductId,
            accountData: accountData.trim(),
          }),
        });
      } catch {}

      setAccountData('');
      setMessage({ text: 'تمت إضافة بيانات الحساب بنجاح إلى البنك المشفر!', type: 'success' });
      fetchInventory();
    } catch (err: any) {
      setMessage({ text: err.message || 'فشلت إضافة الحساب للمخزون', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const unassignedCount = inventory.filter((i) => !i.isAssigned).length;
  const assignedCount = inventory.filter((i) => i.isAssigned).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            بنك الحسابات الرقمية المشفر
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            إيداع وإدارة بيانات الحسابات والاشتراكات الجاهزة للتسليم اليدوي المباشر للعملاء
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold">
              {unassignedCount} متوفر بالمخزن
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 font-bold">
              {assignedCount} تم تسليمها
            </span>
          </div>

          <button
            type="button"
            onClick={fetchInventory}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 transition"
            title="تحديث البيانات"
          >
            <RefreshCw className="w-4 h-4 text-[#0284c7]" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Add New Stock Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="p-2 rounded-xl bg-sky-50 text-[#0284c7]">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">إيداع حساب جديد</h2>
              <p className="text-[11px] text-slate-400">تخزين بيانات اعتماد جاهزة للتسليم</p>
            </div>
          </div>

          {message && (
            <div
              className={`p-3 rounded-2xl text-xs font-bold flex items-start gap-2 ${
                message.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleAddStock} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                نوع الاشتراك الرقمي
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0284c7] text-slate-900 text-xs font-bold outline-none cursor-pointer"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                بيانات الدخول / الكود / الرابط
              </label>
              <textarea
                required
                rows={4}
                value={accountData}
                onChange={(e) => setAccountData(e.target.value)}
                placeholder="مثال: الإيميل: user@example.com | كلمة المرور: Pass1234 | الشاشة رقم 3 PIN: 1234"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0284c7] text-slate-900 text-xs font-mono outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                تظل هذه البيانات مشفرة وسرية ولا يتم كشفها للعميل إلا بعد موافقة الإدارة اليدوية.
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl velto-gradient-btn text-white font-bold text-xs shadow-md shadow-cyan-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>جاري الحفظ...</span>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>حفظ في البنك المشفر</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Existing Inventory List */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">سجل الحسابات والاشتراكات المودعة</h2>
              <p className="text-[11px] text-slate-400">إجمالي {inventory.length} حساب في النظام</p>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">جاري تحميل بيانات المخزون...</div>
          ) : inventory.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
              لا توجد حسابات مودعة حتى الآن. يمكنك إضافة أول حساب عبر النموذج الجانبي.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {inventory.map((item) => {
                const isRevealed = revealedIds[item.id] || false;
                return (
                  <div key={item.id} className="py-3.5 space-y-2 hover:bg-slate-50/60 p-2.5 rounded-2xl transition">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{item.productName}</span>
                        {item.isAssigned ? (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold">
                            تم التسليم لطلب: {item.assignedOrderId}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                            جاهز للتسليم
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-400">
                        {formatDateTime(item.createdAt)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                      <div className="font-mono text-xs text-slate-700 truncate select-all flex-1" dir="ltr">
                        {isRevealed ? item.accountData : '••••••••••••••••••••••••••••••••'}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleReveal(item.id)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200/60 transition"
                          title={isRevealed ? 'إخفاء البيانات' : 'كشف البيانات'}
                        >
                          {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopy(item.id, item.accountData)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200/60 transition"
                          title="نسخ البيانات"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
