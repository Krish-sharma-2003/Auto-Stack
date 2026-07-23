import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileDown } from 'lucide-react';
import { gstReports } from '@/data/mockData';
import { cn } from '@/lib/utils';
import type { GSTReportType } from '@/types';

const tabs: GSTReportType[] = ['GSTR-1', 'GSTR-3B', 'HSN Summary'];

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function GSTReports() {
  const [activeTab, setActiveTab] = useState<GSTReportType>('GSTR-1');
  const [selectedMonth, setSelectedMonth] = useState('January');
  const [selectedYear, setSelectedYear] = useState('2024');

  const totalTaxableValue = gstReports.reduce((sum, r) => sum + r.taxableValue, 0);
  const totalCGST = gstReports.reduce((sum, r) => sum + r.cgst, 0);
  const totalSGST = gstReports.reduce((sum, r) => sum + r.sgst, 0);
  const totalIGST = gstReports.reduce((sum, r) => sum + r.igst, 0);
  const grandTotal = gstReports.reduce((sum, r) => sum + r.total, 0);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">GST Reports</h2>
              <p className="text-sm text-slate-500">Generate GST returns in prescribed format</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {months.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-100 px-6">
          <div className="flex gap-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'py-4 px-2 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-6 bg-slate-50 border-b border-slate-100">
          <div className="bg-white p-4 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Taxable Value</p>
            <p className="text-lg font-bold text-slate-800">₹{totalTaxableValue.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">CGST</p>
            <p className="text-lg font-bold text-blue-600">₹{totalCGST.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">SGST</p>
            <p className="text-lg font-bold text-green-600">₹{totalSGST.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">IGST</p>
            <p className="text-lg font-bold text-purple-600">₹{totalIGST.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Total Tax</p>
            <p className="text-lg font-bold text-red-600">₹{(totalCGST + totalSGST + totalIGST).toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">GSTIN</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Party</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Invoice No</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Taxable Value</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">CGST</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">SGST</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">IGST</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody>
              {gstReports.map((report, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-4 py-3 text-xs font-mono text-slate-600">{report.gstin}</td>
                  <td className="px-4 py-3 text-sm text-slate-800">{report.party}</td>
                  <td className="px-4 py-3 text-sm text-blue-600 font-medium">{report.invoiceNo}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {report.date.toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-slate-800">
                    ₹{report.taxableValue.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-slate-800">
                    {report.cgst ? `₹${report.cgst.toLocaleString('en-IN')}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-slate-800">
                    {report.sgst ? `₹${report.sgst.toLocaleString('en-IN')}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-slate-800">
                    {report.igst ? `₹${report.igst.toLocaleString('en-IN')}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-slate-800">
                    ₹{report.total.toLocaleString('en-IN')}
                  </td>
                </motion.tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 font-semibold">
              <tr className="border-t-2 border-slate-200">
                <td colSpan={4} className="px-4 py-3 text-sm text-right text-slate-600">Total</td>
                <td className="px-4 py-3 text-sm text-right text-slate-800">₹{totalTaxableValue.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 text-sm text-right text-blue-600">₹{totalCGST.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 text-sm text-right text-green-600">₹{totalSGST.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 text-sm text-right text-purple-600">₹{totalIGST.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 text-sm text-right font-bold text-red-600">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Export Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3 justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-white transition-colors flex items-center gap-2"
          >
            <FileDown className="w-4 h-4" />
            Export JSON
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-white transition-colors flex items-center gap-2"
          >
            <FileDown className="w-4 h-4" />
            Export Excel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-white transition-colors flex items-center gap-2"
          >
            <FileDown className="w-4 h-4" />
            Export PDF
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
