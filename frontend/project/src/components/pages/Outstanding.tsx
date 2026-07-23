import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, AlertTriangle } from 'lucide-react';
import { outstandingReceivables, outstandingPayables } from '@/data/mockData';
import { cn } from '@/lib/utils';
import type { Outstanding, OutstandingType } from '@/types';

function getDaysOverdue(dueDate: Date): number {
  const today = new Date();
  const diff = today.getTime() - dueDate.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getRowHighlight(pending: number, dueDate: Date): string {
  const days = getDaysOverdue(dueDate);
  if (days > 30 && pending > 0) return 'bg-red-50 border-l-4 border-l-red-500';
  if (days > 15 && pending > 0) return 'bg-amber-50 border-l-4 border-l-amber-500';
  return '';
}

function OutstandingRow({ outstanding, index }: { outstanding: Outstanding; index: number }) {
  const rowHighlight = getRowHighlight(outstanding.pending, outstanding.dueDate);
  const daysOverdue = getDaysOverdue(outstanding.dueDate);

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'border-b border-slate-100 transition-colors hover:bg-slate-50',
        rowHighlight
      )}
    >
      <td className="px-6 py-4">
        <div>
          <p className="font-medium text-slate-800">{outstanding.partyName}</p>
          {daysOverdue > 0 && outstanding.pending > 0 && (
            <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3 h-3" />
              {daysOverdue} days overdue
            </p>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-slate-800">₹{outstanding.totalAmount.toLocaleString('en-IN')}</td>
      <td className="px-6 py-4 text-sm text-green-600 font-medium">₹{outstanding.paid.toLocaleString('en-IN')}</td>
      <td className="px-6 py-4 text-sm text-red-600 font-semibold">₹{outstanding.pending.toLocaleString('en-IN')}</td>
      <td className="px-6 py-4 text-sm text-slate-600">
        {outstanding.dueDate.toLocaleDateString('en-IN')}
      </td>
      <td className="px-6 py-4">
        <span className={cn(
          'px-2 py-1 rounded text-xs font-medium',
          daysOverdue > 30 && outstanding.pending > 0
            ? 'bg-red-100 text-red-700'
            : daysOverdue > 15 && outstanding.pending > 0
            ? 'bg-amber-100 text-amber-700'
            : 'bg-green-100 text-green-700'
        )}>
          {daysOverdue > 0 && outstanding.pending > 0 ? `${daysOverdue} days` : 'On time'}
        </span>
      </td>
      <td className="px-6 py-4">
        {outstanding.pending > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
          </motion.button>
        )}
      </td>
    </motion.tr>
  );
}

export function Outstanding() {
  const [activeTab, setActiveTab] = useState<OutstandingType>('Receivable');
  const data = activeTab === 'Receivable' ? outstandingReceivables : outstandingPayables;

  const totalPending = data.reduce((sum, o) => sum + o.pending, 0);
  const totalPaid = data.reduce((sum, o) => sum + o.paid, 0);
  const totalAmount = data.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Outstanding</h2>
              <p className="text-sm text-slate-500">Track receivables and payables</p>
            </div>
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('Receivable')}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  activeTab === 'Receivable'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                )}
              >
                Receivable
              </button>
              <button
                onClick={() => setActiveTab('Payable')}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  activeTab === 'Payable'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                )}
              >
                Payable
              </button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 p-6 bg-slate-50 border-b border-slate-100">
          <div className="text-center p-4 bg-white rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Total {activeTab === 'Receivable' ? 'Amount' : 'Owed'}</p>
            <p className="text-xl font-bold text-slate-800">₹{totalAmount.toLocaleString('en-IN')}</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Paid</p>
            <p className="text-xl font-bold text-green-600">₹{totalPaid.toLocaleString('en-IN')}</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Pending</p>
            <p className="text-xl font-bold text-red-600">₹{totalPending.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Party Name</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Total Amount</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Paid</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Pending</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Due Date</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Days Overdue</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((outstanding, index) => (
                <OutstandingRow key={outstanding.id} outstanding={outstanding} index={index} />
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
