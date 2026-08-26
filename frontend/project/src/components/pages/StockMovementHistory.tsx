import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Search, Calendar, Loader2, AlertTriangle, PackageSearch, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { API_BASE } from '@/lib/api';

type Movement = {
  id: string;
  productName: string;
  date: Date;
  type: 'IN' | 'OUT';
  qty: number;
  invoiceRef: string;
  remarks: string;
};

export function StockMovementHistory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadMovements = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${API_BASE}/api/stock-movements/`);
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.detail || `Server error (${response.status})`);
        }

        const mapped: Movement[] = (data.movements || []).map((movement: any) => {
          const isPurchase = movement.movement_type === 'PURCHASE';
          return {
            id: movement.id,
            productName: movement.product_name || 'Unknown product',
            date: new Date(movement.created_at),
            type: isPurchase ? 'IN' : 'OUT',
            qty: Math.abs(Number(movement.quantity_added) || 0),
            invoiceRef: movement.invoice_ref || movement.invoice_id || '—',
            remarks: isPurchase ? 'Purchase' : 'Sale',
          };
        });

        if (active) setMovements(mapped);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error && err.message !== 'Failed to fetch'
              ? err.message
              : `Could not connect to backend at ${API_BASE}.`
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadMovements();
    return () => {
      active = false;
    };
  }, []);

  const filteredMovements = movements.filter(m => {
    const matchesSearch = m.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || m.type === typeFilter;
    const matchesFromDate = !fromDate || m.date >= new Date(`${fromDate}T00:00:00`);
    const matchesToDate = !toDate || m.date <= new Date(`${toDate}T23:59:59.999`);
    return matchesSearch && matchesType && matchesFromDate && matchesToDate;
  });

  const totalIn = filteredMovements.filter(m => m.type === 'IN').reduce((sum, m) => sum + m.qty, 0);
  const totalOut = filteredMovements.filter(m => m.type === 'OUT').reduce((sum, m) => sum + m.qty, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Stock Movement History</h2>
            <p className="text-sm text-slate-500 mt-0.5">Track all inventory movements in real time</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-shadow"
              />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200">
              <Calendar className="w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-transparent text-sm focus:outline-none w-28"
              />
              <span className="text-slate-400">-</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-transparent text-sm focus:outline-none w-28"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 bg-slate-50 border-b border-slate-100">
        <div className="bg-white p-5 rounded-xl flex items-center gap-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-50 rounded-xl flex items-center justify-center">
            <TrendingDown className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Total In</p>
            <p className="text-2xl font-bold text-green-600">{totalIn.toLocaleString('en-IN')} <span className="text-sm font-medium text-slate-400">units</span></p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl flex items-center gap-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-50 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Total Out</p>
            <p className="text-2xl font-bold text-red-600">{totalOut.toLocaleString('en-IN')} <span className="text-sm font-medium text-slate-400">units</span></p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex gap-2">
        {(['ALL', 'IN', 'OUT'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-all',
              typeFilter === type
                ? type === 'IN'
                  ? 'bg-green-100 text-green-700 shadow-sm'
                  : type === 'OUT'
                  ? 'bg-red-100 text-red-700 shadow-sm'
                  : 'bg-blue-100 text-blue-700 shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            )}
          >
            {type === 'ALL' ? 'All Movements' : type}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-500" />
          <p className="text-sm">Loading stock movements…</p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-3">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <p className="font-medium text-slate-800 mb-1">Couldn't load stock movements</p>
          <p className="text-sm text-slate-500 max-w-md">{error}</p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Product</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Qty</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Invoice Ref</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <PackageSearch className="w-10 h-10" />
                      <p className="text-sm font-medium text-slate-500">No stock movements found</p>
                      <p className="text-xs text-slate-400">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMovements.map((movement, index) => (
                  <motion.tr
                    key={movement.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                      {movement.date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{movement.productName}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        'px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1',
                        movement.type === 'IN'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      )}>
                        {movement.type === 'IN' ? (
                          <ArrowDownRight className="w-3 h-3" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3" />
                        )}
                        {movement.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-slate-800">{movement.qty.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-sm text-blue-600 font-medium">{movement.invoiceRef}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{movement.remarks}</td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}