import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileDown } from 'lucide-react';
import { PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { products, categories } from '@/data/mockData';
import { cn } from '@/lib/utils';

const stockByCategory = categories.map(cat => ({
  name: cat,
  value: products.filter(p => p.category === cat).reduce((sum, p) => sum + p.stockValue, 0),
  count: products.filter(p => p.category === cat).length,
}));

const statusDistribution = [
  { name: 'In Stock', value: products.filter(p => p.status === 'In Stock').length, color: '#10B981' },
  { name: 'Low Stock', value: products.filter(p => p.status === 'Low Stock').length, color: '#F59E0B' },
  { name: 'Out of Stock', value: products.filter(p => p.status === 'Out of Stock').length, color: '#EF4444' },
];

const totalValue = products.reduce((sum, p) => sum + p.stockValue, 0);
const avgPrice = totalValue / products.filter(p => p.stockValue > 0).length;

export function StockReport() {
  const [selectedCategory, setSelectedCategory] = useState('');

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category === selectedCategory)
    : products;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white"
      >
        <h2 className="text-2xl font-bold mb-2">Stock Report</h2>
        <p className="text-purple-100">Inventory valuation and stock analysis</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl border border-slate-100"
        >
          <p className="text-sm text-slate-500">Total Stock Value</p>
          <p className="text-2xl font-bold text-slate-800">₹{totalValue.toLocaleString('en-IN')}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-xl border border-slate-100"
        >
          <p className="text-sm text-slate-500">Total SKUs</p>
          <p className="text-2xl font-bold text-slate-800">{products.length}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl border border-slate-100"
        >
          <p className="text-sm text-slate-500">Avg Item Value</p>
          <p className="text-2xl font-bold text-slate-800">₹{avgPrice.toFixed(0)}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl border border-slate-100"
        >
          <p className="text-sm text-slate-500">Low Stock Items</p>
          <p className="text-2xl font-bold text-red-600">{products.filter(p => p.status === 'Low Stock' || p.status === 'Out of Stock').length}</p>
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
          <h3 className="font-semibold text-slate-800 mb-4">Stock Value by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stockByCategory} layout="vertical">
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl border border-slate-100"
        >
          <h3 className="font-semibold text-slate-800 mb-4">Stock Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2">
            {statusDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-slate-600">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Detailed Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl border border-slate-100 overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Stock Details</h3>
          <div className="flex gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">
              <FileDown className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto max-h-96">
          <table className="w-full">
            <thead className="sticky top-0 bg-slate-50">
              <tr className="border-b border-slate-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Product</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Category</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Qty</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Rate</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Value</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const statusStyle = {
                  'In Stock': { bg: 'bg-green-100', text: 'text-green-700' },
                  'Low Stock': { bg: 'bg-amber-100', text: 'text-amber-700' },
                  'Out of Stock': { bg: 'bg-red-100', text: 'text-red-700' },
                  'Expiring Soon': { bg: 'bg-orange-100', text: 'text-orange-700' },
                }[product.status] || { bg: 'bg-slate-100', text: 'text-slate-700' };

                return (
                  <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-3 text-sm text-slate-800">{product.name}</td>
                    <td className="px-6 py-3 text-sm text-slate-600">{product.category}</td>
                    <td className="px-6 py-3 text-sm text-right text-slate-800">{product.qty} {product.unit}</td>
                    <td className="px-6 py-3 text-sm text-right text-slate-800">₹{product.rate}</td>
                    <td className="px-6 py-3 text-sm text-right font-semibold text-slate-800">
                      ₹{product.stockValue.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-3">
                      <span className={cn('px-2 py-1 rounded text-xs font-medium', statusStyle.bg, statusStyle.text)}>
                        {product.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-50 border-t-2 border-slate-200">
              <tr>
                <td colSpan={4} className="px-6 py-3 text-sm text-right font-medium text-slate-600">Total</td>
                <td className="px-6 py-3 text-sm text-right font-bold text-slate-800">
                  ₹{filteredProducts.reduce((sum, p) => sum + p.stockValue, 0).toLocaleString('en-IN')}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
