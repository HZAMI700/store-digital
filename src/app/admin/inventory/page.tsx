'use client';

import React, { useState, useEffect } from 'react';
import { DigitalAccountInventory, Product } from '@/lib/types';
import { INITIAL_PRODUCTS } from '@/lib/store';
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

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/inventory');
      const data = await res.json();
      if (res.ok) {
        setInventory(data.inventory || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountData.trim()) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProductId,
          accountData: accountData.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAccountData('');
      setMessage({ text: 'Account credential successfully saved in vault!', type: 'success' });
      fetchInventory();
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to add item', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const unassignedCount = inventory.filter((i) => !i.isAssigned).length;
  const assignedCount = inventory.filter((i) => i.isAssigned).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Digital Account Inventory Vault
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Store and manage dedicated single-use account credentials for manual fulfillment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 text-xs">
            <span className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
              {unassignedCount} Available in Vault
            </span>
            <span className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-semibold">
              {assignedCount} Assigned & Locked
            </span>
          </div>

          <button
            type="button"
            onClick={fetchInventory}
            className="p-2 rounded-xl bg-dark-850 hover:bg-dark-800 border border-slate-700 text-slate-300"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ADD NEW ACCOUNT CREDENTIAL FORM */}
      <div className="p-6 rounded-3xl bg-dark-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Plus className="w-4 h-4 text-sky-400" />
          <span>Vault New Account Credentials</span>
        </div>

        {message && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleAddStock} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target Product
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full h-11 px-3 text-xs bg-dark-950 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Account Credentials / License Code / Invitation URL
              </label>
              <input
                type="text"
                required
                value={accountData}
                onChange={(e) => setAccountData(e.target.value)}
                placeholder="e.g. Email: user@stream.io | Pass: Str2026! | PIN: 1234 or License Key"
                className="w-full h-11 px-4 text-xs font-mono bg-dark-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Accounts remain unassigned until manually linked to a confirmed order.</span>
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-dark-950 font-bold text-xs rounded-xl shadow-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Vaulting...' : 'Save to Vault'}
            </button>
          </div>
        </form>
      </div>

      {/* INVENTORY LIST */}
      <div className="rounded-3xl bg-dark-900 border border-slate-800 overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            All Vaulted Credentials ({inventory.length})
          </h3>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading inventory...</div>
        ) : inventory.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">Vault is currently empty.</div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {inventory.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-dark-850/40 transition-colors"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-white">{item.productName}</span>
                    {item.isAssigned ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Assigned to Order</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Unassigned / Ready</span>
                      </span>
                    )}
                  </div>

                  <div className="p-2.5 rounded-xl bg-dark-950 border border-slate-800/80 font-mono text-xs text-slate-200 select-all break-all max-w-2xl">
                    {item.accountData}
                  </div>
                </div>

                <div className="text-xs text-slate-400 sm:text-right shrink-0">
                  <div>Added: {formatDateTime(item.createdAt)}</div>
                  {item.assignedAt && (
                    <div className="text-purple-400 text-[11px] mt-0.5">
                      Assigned on {formatDateTime(item.assignedAt)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
