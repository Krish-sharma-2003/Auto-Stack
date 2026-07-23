import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileDown, Search, Calendar } from 'lucide-react';
import { accounts, ledgerEntries } from '@/data/mockData';
import { cn } from '@/lib/utils';

export function Ledger() {
  const [selectedAccount, setSelectedAccount] = useState(accounts[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const filteredAccounts = accounts.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedAccountData = accounts.find(a => a.id === selectedAccount);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Left Panel - Account List */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"
      >
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search account..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="max-h-[600px] overflow-y-auto">
          {filteredAccounts.map((account) => (
            <button
              key={account.id}
              onClick={() => setSelectedAccount(account.id)}
              className={cn(
                'w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors',
                selectedAccount === account.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              )}
            >
              <p className="font-medium text-slate-800">{account.name}</p>
              <p className="text-xs text-slate-500">{account.group}</p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Right Panel - Ledger */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">{selectedAccountData?.name}</h2>
              <p className="text-sm text-slate-500">{selectedAccountData?.group}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                <Calendar className="w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="bg-transparent text-sm focus:outline-none"
                />
                <span className="text-slate-400">to</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="bg-transparent text-sm focus:outline-none"
                />
              </div>
              <button className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                <FileDown className="w-4 h-4" />
                PDF
              </button>
              <button className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                <FileDown className="w-4 h-4" />
                Excel
              </button>
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Particulars</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Voucher No</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Debit</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Credit</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Balance</th>
              </tr>
            </thead>
            <tbody>
              {ledgerEntries.map((entry, index) => (
                <motion.tr
                  key={entry.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {entry.date.toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-800">{entry.particulars}</td>
                  <td className="px-6 py-4 text-sm text-blue-600 font-medium">{entry.voucherNo}</td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-slate-800">
                    {entry.debit ? `₹${entry.debit.toLocaleString('en-IN')}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-slate-800">
                    {entry.credit ? `₹${entry.credit.toLocaleString('en-IN')}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-semibold">
                    <span className={entry.balanceType === 'Cr' ? 'text-green-600' : 'text-red-600'}>
                      {entry.balanceType} ₹{entry.balance.toLocaleString('en-IN')}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 font-semibold">
              <tr className="border-t-2 border-slate-200">
                <td colSpan={3} className="px-6 py-4 text-sm text-right text-slate-600">
                  Net Balance
                </td>
                <td className="px-6 py-4 text-sm text-right text-red-600">
                  Dr ₹{ledgerEntries.reduce((sum, e) => sum + (e.debit || 0), 0).toLocaleString('en-IN')}
                </td>
                <td className="px-6 py-4 text-sm text-right text-green-600">
                  Cr ₹{ledgerEntries.reduce((sum, e) => sum + (e.credit || 0), 0).toLocaleString('en-IN')}
                </td>
                <td className="px-6 py-4 text-sm text-right font-bold text-green-600">
                  Cr ₹{ledgerEntries[ledgerEntries.length - 1]?.balance.toLocaleString('en-IN')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
