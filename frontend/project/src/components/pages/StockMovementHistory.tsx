import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Search, Calendar } from 'lucide-react';
import { stockMovements } from '@/data/mockData';
import { cn } from '@/lib/utils';

export function StockMovementHistory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const filteredMovements = stockMovements.filter(m => {
    const matchesSearch = m.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || m.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalIn = filteredMovements.filter(m => m.type === 'IN').reduce((sum, m) => sum + m.qty, 0);
  const totalOut = filteredMovements.filter(m => m.type === 'OUT').reduce((sum, m) => sum + m.qty, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Stock Movement History</h2>
            <p className="text-sm text-slate-500">Track all inventory movements</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
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
      <div className="grid grid-cols-2 gap-4 p-6 bg-slate-50 border-b border-slate-100">
        <div className="bg-white p-4 rounded-lg flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <ArrowDownRight className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Total In</p>
            <p className="text-xl font-bold text-green-600">{totalIn} units</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <ArrowUpRight className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Total Out</p>
            <p className="text-xl font-bold text-red-600">{totalOut} units</p>
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
              'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
              typeFilter === type
                ? type === 'IN'
                  ? 'bg-green-100 text-green-700'
                  : type === 'OUT'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-blue-100 text-blue-700'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            )}
          >
            {type === 'ALL' ? 'All Movements' : type}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Product</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Type</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Qty</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Invoice Ref</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {filteredMovements.map((movement, index) => (
              <motion.tr
                key={movement.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.03 }}
                className="border-b border-slate-100 hover:bg-slate-50"
              >
                <td className="px-6 py-4 text-sm text-slate-600">
                  {movement.date.toLocaleDateString('en-IN')}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-800">{movement.productName}</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    'px-2 py-1 rounded text-xs font-medium inline-flex items-center gap-1',
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
                <td className="px-6 py-4 text-sm text-right font-semibold text-slate-800">{movement.qty}</td>
                <td className="px-6 py-4 text-sm text-blue-600 font-medium">{movement.invoiceRef}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{movement.remarks}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
