import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Package, Loader2, AlertTriangle } from 'lucide-react';
import { stockMovements } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { API_BASE } from '@/lib/api';
import type { Product, StockMovement, StockStatus } from '@/types';
import { useCompany } from '@/context/CompanyContext';
import { supabase } from '@/lib/supabaseClient';

const statusColors = {
  'In Stock': { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  'Low Stock': { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  'Out of Stock': { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  'Expiring Soon': { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
};

export function StockItems() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { activeCompanyId } = useCompany();

  useEffect(() => {
    let active = true;

    const loadInventory = async () => {
      setLoading(true);
      setError('');
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_BASE}/api/inventory/?company_id=${activeCompanyId}`, { headers });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.detail || `Server error (${res.status})`);
        }

        const mapped: Product[] = (data.items || []).map((it: any) => {
          const qty = Number(it.quantity) || 0;
          const rate = Number(it.unit_price) || 0;
          const status: StockStatus =
            qty === 0 ? 'Out of Stock' : qty < 10 ? 'Low Stock' : 'In Stock';
          return {
            id: it.id,
            name: it.product_name || 'Unknown',
            hsn: it.hsn || '—',
            category: it.category || 'Uncategorized',
            qty,
            unit: it.unit || '—',
            rate,
            stockValue: qty * rate,
            status,
          };
        });

        if (active) setProducts(mapped);
      } catch (e) {
        if (active) {
          setError(
            e instanceof Error && e.message !== 'Failed to fetch'
              ? e.message
              : `Could not connect to backend at ${API_BASE}.`
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadInventory();
    return () => {
      active = false;
    };
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || p.category === categoryFilter;
    const matchesStatus = !statusFilter || p.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [...new Set(products.map(p => p.category))];
  const statuses = [...new Set(products.map(p => p.status))];

  const getProductMovements = (productId: string): StockMovement[] => {
    return stockMovements.filter(m => m.productId === productId);
  };

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
              <h2 className="text-xl font-bold text-slate-800">Stock Items</h2>
              <p className="text-sm text-slate-500">
                {loading
                  ? 'Loading inventory…'
                  : error
                  ? 'Failed to load inventory'
                  : `${filteredProducts.length} products found`}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-500" />
            <p className="text-sm">Loading inventory…</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-3">
              <AlertTriangle className="w-7 h-7 text-red-500" />
            </div>
            <p className="font-medium text-slate-800 mb-1">Couldn't load inventory</p>
            <p className="text-sm text-slate-500 max-w-md">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <Package className="w-7 h-7 text-slate-400" />
            </div>
            <p className="font-medium text-slate-800 mb-1">No products found</p>
            <p className="text-sm text-slate-500">Upload an invoice to start building your inventory.</p>
          </div>
        )}

        {/* Table */}
        {!loading && !error && filteredProducts.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Product</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">HSN</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Category</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Qty</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Unit</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Rate</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Stock Value</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product, index) => {
                const statusStyle = statusColors[product.status];
                return (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={() => setSelectedProduct(product)}
                    className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="font-medium text-slate-800">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{product.hsn}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{product.category}</td>
                    <td className="px-6 py-4 text-sm text-right font-medium text-slate-800">{product.qty}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{product.unit}</td>
                    <td className="px-6 py-4 text-sm text-right text-slate-800">₹{product.rate}</td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-slate-800">
                      ₹{product.stockValue.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1',
                        statusStyle.bg,
                        statusStyle.text
                      )}>
                        <span className={cn('w-1.5 h-1.5 rounded-full', statusStyle.dot)} />
                        {product.status}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        )}
      </motion.div>

      {/* Stock History Slide-over */}
      <AnimatePresence>
        {selectedProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setSelectedProduct(null)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto"
            >
              <div className="sticky top-0 bg-white p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Stock History</h3>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="p-6">
                {/* Product Info */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Package className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">{selectedProduct.name}</h4>
                    <p className="text-sm text-slate-500">{selectedProduct.category}</p>
                    <p className="text-xs text-slate-400">HSN: {selectedProduct.hsn}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-500">Current Qty</p>
                    <p className="font-bold text-slate-800">{selectedProduct.qty}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-500">Rate</p>
                    <p className="font-bold text-slate-800">₹{selectedProduct.rate}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-500">Value</p>
                    <p className="font-bold text-slate-800">₹{selectedProduct.stockValue.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                {/* History */}
                <h5 className="font-medium text-slate-800 mb-3">Movement History</h5>
                <div className="space-y-3">
                  {getProductMovements(selectedProduct.id).map((movement, index) => (
                    <motion.div
                      key={movement.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={cn(
                          'px-2 py-1 rounded text-xs font-medium',
                          movement.type === 'IN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        )}>
                          {movement.type}
                        </span>
                        <span className="text-xs text-slate-500">
                          {movement.date.toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">{movement.remarks}</span>
                        <span className="font-medium text-slate-800">×{movement.qty}</span>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">Ref: {movement.invoiceRef}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
