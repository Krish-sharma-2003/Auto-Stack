import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, AlertTriangle, FileText, TrendingUp, ExternalLink, type LucideIcon } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { cn } from '@/lib/utils';
import { API_BASE } from '@/lib/api';
import type { RiskLevel } from '@/types';
import { useCompany } from '@/context/CompanyContext';
import { supabase } from '@/lib/supabaseClient';

interface Stat {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string;
  change: string;
  badge?: boolean;
  isCurrency?: boolean;
}

const statsTemplate: Stat[] = [
  { title: 'Total Products', value: 0, icon: Package, color: 'bg-blue-500', change: 'In inventory' },
  { title: 'Low Stock Alerts', value: 0, icon: AlertTriangle, color: 'bg-red-500', change: 'Action needed', badge: true },
  { title: 'Invoices This Month', value: 0, icon: FileText, color: 'bg-green-500', change: 'This month' },
  { title: 'Total Inventory Value', value: 0, icon: TrendingUp, color: 'bg-purple-500', change: '₹', isCurrency: true },
];

const riskColors: Record<RiskLevel, { bg: string; text: string; pulse?: boolean }> = {
  NONE: { bg: 'bg-green-100', text: 'text-green-700' },
  LOW: { bg: 'bg-blue-100', text: 'text-blue-700' },
  MEDIUM: { bg: 'bg-amber-100', text: 'text-amber-700' },
  HIGH: { bg: 'bg-red-100', text: 'text-red-700' },
  CRITICAL: { bg: 'bg-red-900', text: 'text-red-100', pulse: true },
};

const statusColors = {
  PROCESSED: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  MANUAL_REVIEW: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  BLOCKED: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
};

function AnimatedCounter({ value, isCurrency = false }: { value: number; isCurrency?: boolean }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const stepValue = value / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(interval);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [value]);

  const formatted = isCurrency
    ? `₹${displayValue.toLocaleString('en-IN')}`
    : displayValue.toLocaleString('en-IN');

  return <span>{formatted}</span>;
}

function StatCard({ stat, index }: { stat: Stat; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{stat.title}</p>
          <p className="text-2xl font-semibold text-slate-800 mt-2">
            {stat.isCurrency && '₹'}
            <AnimatedCounter value={stat.value} isCurrency={stat.isCurrency} />
          </p>
          <p className="text-xs text-slate-400 mt-2">{stat.change}</p>
        </div>
        <div className={cn('p-3 rounded-xl', stat.color)}>
          <stat.icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {stat.badge && (
        <span className="mt-3 inline-block px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
          {stat.change}
        </span>
      )}
    </motion.div>
  );
}

function InvoiceRow({ invoice, index }: { invoice: any; index: number }) {
  const riskStyle = riskColors[(invoice.risk_level as RiskLevel) || 'NONE'] || riskColors.NONE;
  const statusStyle = statusColors[(invoice.status as keyof typeof statusColors) || 'PROCESSED'] || statusColors.PROCESSED;

  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="hover:bg-slate-50 transition-colors"
    >
      <td className="px-4 py-3 text-sm font-medium text-blue-600">{invoice.invoice_number || invoice.id}</td>
      <td className="px-4 py-3 text-sm text-slate-700">{invoice.vendor_name || '—'}</td>
      <td className="px-4 py-3 text-sm text-slate-500">
        {invoice.created_at ? new Date(invoice.created_at).toLocaleDateString('en-IN') : '—'}
      </td>
      <td className="px-4 py-3 text-sm font-medium text-slate-800">
        ₹{Number(invoice.total_amount || 0).toLocaleString('en-IN')}
      </td>
      <td className="px-4 py-3">
        <span
          className={cn(
            'px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1',
            riskStyle.bg,
            riskStyle.text,
            riskStyle.pulse && 'animate-pulse-alert'
          )}
        >
          {invoice.risk_level || 'NONE'}
        </span>
      </td>
      <td className="px-4 py-3">
        <span
          className={cn(
            'px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1',
            statusStyle.bg,
            statusStyle.text
          )}
        >
          <span className={cn('w-1.5 h-1.5 rounded-full', statusStyle.dot)} />
          {(invoice.status || 'PROCESSED').replace('_', ' ')}
        </span>
      </td>
    </motion.tr>
  );
}

function LowStockPanel({ alerts }: { alerts: any[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 h-full"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800">Low Stock Alerts</h3>
        <span className="text-xs text-red-600 font-medium">{alerts.length} items</span>
      </div>
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No low stock alerts</p>
        ) : (
          alerts.map((product, index) => {
            const percentage = product.quantity ? Math.min((product.quantity / 100) * 100, 100) : 0;
            const barColor = percentage < 10 ? 'bg-red-500' : percentage < 30 ? 'bg-amber-500' : 'bg-green-500';

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-800">{product.product_name}</span>
                  <span className={cn(
                    'text-xs font-medium',
                    (product.quantity || 0) === 0 ? 'text-red-600' : 'text-amber-600'
                  )}>
                    {product.quantity || 0} {product.unit || ''}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={cn('h-full rounded-full', barColor)}
                  />
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}

export function Dashboard() {
  const [stats, setStats] = useState<Stat[]>(statsTemplate);
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);
  const [invoiceVolume, setInvoiceVolume] = useState<any[]>([]);
  const [stockValueData, setStockValueData] = useState<any[]>([]);
  const [riskData, setRiskData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeCompanyId } = useCompany();

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      if (!activeCompanyId) return;
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_BASE}/api/dashboard/summary?company_id=${activeCompanyId}`, { headers });
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.detail || 'Failed to load dashboard');
        }

        const summary = result.summary || {};

        if (!active) return;

        setStats((prev) =>
          prev.map((s) => {
            switch (s.title) {
              case 'Total Products':
                return { ...s, value: summary.total_products || 0 };
              case 'Low Stock Alerts':
                return { ...s, value: summary.low_stock_count || 0 };
              case 'Invoices This Month':
                return { ...s, value: summary.invoices_this_month || 0 };
              case 'Total Inventory Value':
                return { ...s, value: summary.total_inventory_value || 0 };
              default:
                return s;
            }
          })
        );

        setRecentInvoices(summary.recent_invoices || []);
        setLowStockAlerts(summary.low_stock_alerts || []);
        setInvoiceVolume(summary.invoice_volume_30d || []);
        setStockValueData(summary.top_products_by_value || []);
        setRiskData(summary.risk_distribution || []);
      } catch (e) {
        console.error('Dashboard load error:', e);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDashboard();
    return () => {
      active = false;
    };
  }, [activeCompanyId]);

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={stat.title} stat={stat} index={index} />
        ))}
      </div>

      {/* Recent Invoices + Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoices Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"
        >
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Recent Invoices</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View All <ExternalLink className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Invoice No</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Vendor</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Risk</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500 text-sm">
                      Loading invoices…
                    </td>
                  </tr>
                ) : recentInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500 text-sm">
                      No invoices yet
                    </td>
                  </tr>
                ) : (
                  recentInvoices.map((invoice, index) => (
                    <InvoiceRow key={invoice.id} invoice={invoice} index={index} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Low Stock Panel */}
        <LowStockPanel alerts={lowStockAlerts} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Volume Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-slate-100"
        >
          <h3 className="font-semibold text-slate-800 mb-4">Invoice Volume (30 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={invoiceVolume}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94A3B8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94A3B8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="invoices"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: '#3B82F6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Stock Value Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-slate-100"
        >
          <h3 className="font-semibold text-slate-800 mb-4">Top Products by Stock Value</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stockValueData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94A3B8" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} stroke="#94A3B8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
              />
              <Bar dataKey="value" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Risk Distribution Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-slate-100"
        >
          <h3 className="font-semibold text-slate-800 mb-4">Invoice Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={riskData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {riskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span className="text-sm text-slate-600">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
