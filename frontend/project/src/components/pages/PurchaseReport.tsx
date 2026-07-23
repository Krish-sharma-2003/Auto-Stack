import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileDown, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { vendors } from '@/data/mockData';

const monthlyData = [
  { month: 'Jan', purchases: 185000, orders: 32 },
  { month: 'Feb', purchases: 228000, orders: 38 },
  { month: 'Mar', purchases: 195000, orders: 35 },
  { month: 'Apr', purchases: 267000, orders: 42 },
  { month: 'May', purchases: 312000, orders: 48 },
  { month: 'Jun', purchases: 345000, orders: 52 },
];

const byVendor = vendors.slice(0, 5).map(v => ({
  name: v.name.split(' ')[0] + ' ' + (v.name.split(' ')[1] || ''),
  value: Math.floor(Math.random() * 400000) + 100000,
}));

export function PurchaseReport() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const totalPurchases = monthlyData.reduce((sum, m) => sum + m.purchases, 0);
  const totalOrders = monthlyData.reduce((sum, m) => sum + m.orders, 0);
  const avgOrderValue = totalPurchases / totalOrders;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl p-6 text-white"
      >
        <h2 className="text-2xl font-bold mb-2">Purchase Report</h2>
        <p className="text-amber-100">Track procurement and vendor performance</p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
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
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">
            <FileDown className="w-4 h-4" />
            Export PDF
          </button>
          <button className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">
            <FileDown className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl border border-slate-100"
        >
          <p className="text-sm text-slate-500">Total Purchases</p>
          <p className="text-2xl font-bold text-slate-800">₹{totalPurchases.toLocaleString('en-IN')}</p>
          <p className="text-xs text-green-600 mt-1">+15% vs last period</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-xl border border-slate-100"
        >
          <p className="text-sm text-slate-500">Total Purchase Orders</p>
          <p className="text-2xl font-bold text-slate-800">{totalOrders}</p>
          <p className="text-xs text-green-600 mt-1">+5% vs last period</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl border border-slate-100"
        >
          <p className="text-sm text-slate-500">Avg Order Value</p>
          <p className="text-2xl font-bold text-slate-800">₹{avgOrderValue.toFixed(0)}</p>
          <p className="text-xs text-green-600 mt-1">+8% vs last period</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl border border-slate-100"
        >
          <p className="text-sm text-slate-500">Active Vendors</p>
          <p className="text-2xl font-bold text-slate-800">{vendors.length}</p>
          <p className="text-xs text-green-600 mt-1">+1 new this month</p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl border border-slate-100"
        >
          <h3 className="font-semibold text-slate-800 mb-4">Monthly Purchase Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94A3B8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94A3B8" tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px' }}
                formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
              />
              <Line type="monotone" dataKey="purchases" stroke="#F59E0B" strokeWidth={2} dot={false} activeDot={{ r: 6, fill: '#F59E0B' }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl border border-slate-100"
        >
          <h3 className="font-semibold text-slate-800 mb-4">Purchases by Vendor</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={byVendor} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94A3B8" tickFormatter={(v) => `₹${v / 1000}k`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} stroke="#94A3B8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px' }}
                formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
              />
              <Bar dataKey="value" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Top Vendors Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl border border-slate-100 overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Top Vendors</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Vendor</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">GSTIN</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Total Purchases</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Outstanding</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr key={vendor.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">{vendor.name}</td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-600">{vendor.gstin}</td>
                  <td className="px-6 py-4 text-sm text-right text-slate-800">
                    ₹{Math.floor(Math.random() * 400000 + 100000).toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-semibold text-red-600">
                    ₹{vendor.outstanding.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
