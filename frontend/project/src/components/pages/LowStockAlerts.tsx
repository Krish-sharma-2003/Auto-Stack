import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Package, Plus } from 'lucide-react';
import { products } from '@/data/mockData';
import { cn } from '@/lib/utils';


export function LowStockAlerts() {
  const [threshold, setThreshold] = useState(30);

  const filteredProducts = products.filter(p => p.qty < threshold);

  return (
    <div>
      {/* Alert Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-6 mb-6 text-white"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Low Stock Alert</h2>
            <p className="text-red-100">{filteredProducts.length} products below threshold quantity</p>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Low Stock Products</h2>
              <p className="text-sm text-slate-500">Products requiring immediate attention</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-slate-600">Threshold:</label>
              <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value) || 0)}
                className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 p-6 bg-slate-50 border-b border-slate-100">
          <div className="bg-white p-4 rounded-lg text-center">
            <p className="text-xs text-slate-500 mb-1">Critical (Qty &lt; 10)</p>
            <p className="text-2xl font-bold text-red-600">{products.filter(p => p.qty < 10).length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <p className="text-xs text-slate-500 mb-1">Warning (10-30)</p>
            <p className="text-2xl font-bold text-amber-600">{products.filter(p => p.qty >= 10 && p.qty < 30).length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <p className="text-xs text-slate-500 mb-1">Out of Stock</p>
            <p className="text-2xl font-bold text-slate-400">{products.filter(p => p.qty === 0).length}</p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Product</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Category</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Current Qty</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Stock Value</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product, index) => {
                const percentage = (product.qty / 50) * 100;
                const barColor = percentage < 20 ? 'bg-red-500' : percentage < 60 ? 'bg-amber-500' : 'bg-green-500';
                const statusColor = percentage < 20 ? 'text-red-600' : percentage < 60 ? 'text-amber-600' : 'text-green-600';

                return (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      'border-b border-slate-100 hover:bg-slate-50',
                      product.qty === 0 && 'bg-red-50'
                    )}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="font-medium text-slate-800">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{product.category}</td>
                    <td className="px-6 py-4">
                      <div className="text-right">
                        <p className={cn('font-semibold', statusColor)}>{product.qty} {product.unit}</p>
                        <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden ml-auto mt-1">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(percentage, 100)}%` }}
                            transition={{ duration: 0.5 }}
                            className={cn('h-full rounded-full', barColor)}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        product.qty === 0 ? 'bg-red-100 text-red-700' : product.qty < 10 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      )}>
                        {product.qty === 0 ? 'Out of Stock' : product.qty < 10 ? 'Critical' : 'Low Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-slate-800">
                      ₹{product.stockValue.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Reorder
                      </motion.button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
