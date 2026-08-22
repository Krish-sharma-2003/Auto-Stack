import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Printer, Eye, FileText, MessageCircle } from 'lucide-react';
import { parties, units } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { API_BASE } from '@/lib/api';

interface InvoiceItem {
  id: string;
  productId: string;
  product: string;
  hsn: string;
  qty: number;
  unit: string;
  rate: number;
  discount: number;
  amount: number;
}

interface InventoryProduct {
  id: string;
  product_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  hsn?: string;
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

const partyNames = parties.map(p => p.name);

export function SalesInvoice() {
  const [partyName, setPartyName] = useState('');
  const [invoiceNo] = useState(
    () => `SI-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000) + 1).padStart(3, '0')}`
  );
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [transportName, setTransportName] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [isInterstate, setIsInterstate] = useState(false);
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: generateId(), productId: '', product: '', hsn: '', qty: 0, unit: 'Strips', rate: 0, discount: 0, amount: 0 }
  ]);
  const [showPreview, setShowPreview] = useState(false);
  const [inventoryProducts, setInventoryProducts] = useState<InventoryProduct[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    let active = true;

    const loadInventory = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/inventory/`);
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.detail || `Server error (${response.status})`);
        }
        if (active) setInventoryProducts(result.items || []);
      } catch {
        if (active) setSaveError(`Could not load inventory from ${API_BASE}.`);
      }
    };

    loadInventory();
    return () => {
      active = false;
    };
  }, []);

  const addItem = () => {
    setItems([...items, {
      id: generateId(),
      productId: '',
      product: '',
      hsn: '',
      qty: 0,
      unit: 'Strips',
      rate: 0,
      discount: 0,
      amount: 0
    }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'qty' || field === 'rate' || field === 'discount') {
          updated.amount = updated.qty * updated.rate * (1 - updated.discount / 100);
        }
        if (field === 'productId') {
          const product = inventoryProducts.find(p => p.id === value);
          if (product) {
            updated.product = product.product_name;
            updated.hsn = product.hsn || '';
            updated.unit = product.unit;
            updated.rate = product.unit_price;
          }
        }
        return updated;
      }
      return item;
    }));
  };

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const cgst = isInterstate ? 0 : subtotal * 0.09;
  const sgst = isInterstate ? 0 : subtotal * 0.09;
  const igst = isInterstate ? subtotal * 0.18 : 0;
  const grandTotal = subtotal + cgst + sgst + igst;

  const handleSaveInvoice = async () => {
    const validItems = items
      .filter(item => item.product && item.qty > 0 && item.unit)
      .map(({ product, qty, unit, rate, discount, amount }) => ({
        product_name: product,
        quantity: qty,
        unit,
        rate,
        discount,
        amount,
      }));

    if (!partyName || validItems.length === 0) {
      setSaveError('Select a party and add at least one product with quantity.');
      setSaveMessage('');
      return;
    }

    setIsSaving(true);
    setSaveError('');
    setSaveMessage('');

    try {
      const response = await fetch(`${API_BASE}/api/sales-invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice_no: invoiceNo,
          party_name: partyName,
          invoice_date: invoiceDate,
          items: validItems,
          subtotal,
          tax_amount: cgst + sgst + igst,
          total_amount: grandTotal,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.detail || `Server error (${response.status})`);
      }

      const skippedReasons = (result.results || [])
        .filter((item: { action?: string }) => item.action === 'SKIPPED')
        .map((item: { reason?: string }) => item.reason)
        .filter(Boolean);
      setSaveMessage(
        `${result.sold_count} items sold${
          result.skipped_count ? `, ${result.skipped_count} skipped${skippedReasons[0] ? ` - ${skippedReasons[0]}` : ''}` : ''
        }`
      );
    } catch (error) {
      setSaveError(
        error instanceof Error && error.message !== 'Failed to fetch'
          ? error.message
          : `Could not connect to backend at ${API_BASE}.`
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Sales Invoice</h2>
              <p className="text-sm text-slate-500">Create new sales invoice</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Invoice No</p>
              <p className="font-semibold text-blue-600">{invoiceNo}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Party Details */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Party Name</label>
              <select
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Party</option>
                {partyNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Invoice Date</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sales Type</label>
              <select
                value={isInterstate ? 'interstate' : 'intrastate'}
                onChange={(e) => setIsInterstate(e.target.value === 'interstate')}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="intrastate">Intrastate</option>
                <option value="interstate">Interstate</option>
              </select>
            </div>
          </div>

          {/* Transport Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Transport Name</label>
              <input
                type="text"
                value={transportName}
                onChange={(e) => setTransportName(e.target.value)}
                placeholder="Enter transport name"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle No</label>
              <input
                type="text"
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value)}
                placeholder="E.g., UP32 AB 1234"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 w-16">S.No</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Product</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 w-24">HSN</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 w-20">Qty</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 w-28">Unit</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 w-28">Rate</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 w-24">Disc%</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 w-32">Amount</th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id} className="border-b border-slate-100">
                      <td className="px-4 py-2 text-sm text-slate-600">{index + 1}</td>
                      <td className="px-4 py-2">
                        <select
                          value={item.productId}
                          onChange={(e) => updateItem(item.id, 'productId', e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        >
                          <option value="">Select Product</option>
                          {inventoryProducts.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.product_name} ({p.quantity} {p.unit || 'pcs'} available)
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={item.hsn}
                          onChange={(e) => updateItem(item.id, 'hsn', e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={item.qty || ''}
                          onChange={(e) => updateItem(item.id, 'qty', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <select
                          value={item.unit}
                          onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        >
                          {units.map(u => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={item.rate || ''}
                          onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={item.discount || ''}
                          onChange={(e) => updateItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                          min="0"
                          max="100"
                        />
                      </td>
                      <td className="px-4 py-2 text-sm font-medium text-slate-800">
                        ₹{item.amount.toFixed(2)}
                      </td>
                      <td className="px-2 py-2">
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={items.length === 1}
                          className={cn(
                            'p-1.5 rounded transition-colors',
                            items.length === 1
                              ? 'text-slate-300 cursor-not-allowed'
                              : 'text-red-500 hover:bg-red-50'
                          )}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={addItem}
              className="w-full py-2 flex items-center justify-center gap-2 text-blue-600 hover:bg-blue-50 transition-colors border-t border-slate-200"
            >
              <Plus className="w-4 h-4" />
              Add Row
            </button>
          </div>

          {/* GST Calculation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div></div>
            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-medium text-slate-800">₹{subtotal.toFixed(2)}</span>
              </div>
              {!isInterstate ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">CGST (9%)</span>
                    <span className="font-medium text-slate-800">₹{cgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">SGST (9%)</span>
                    <span className="font-medium text-slate-800">₹{sgst.toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">IGST (18%)</span>
                  <span className="font-medium text-slate-800">₹{igst.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-800">Grand Total</span>
                  <span className="text-xl font-bold text-blue-600">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-wrap gap-3 justify-end">
          {(saveMessage || saveError) && (
            <p className={cn('mr-auto self-center text-sm font-medium', saveError ? 'text-red-600' : 'text-green-600')}>
              {saveError || saveMessage}
            </p>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-white transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Save Draft
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowPreview(true)}
            className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-white transition-colors flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-white transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Share on WhatsApp
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSaveInvoice}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isSaving ? 'Saving…' : 'Save Invoice'}
          </motion.button>
        </div>
      </motion.div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-auto p-8"
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Sales Invoice Preview</h2>
              </div>
              <div className="border border-slate-200 rounded-lg p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-slate-500">Invoice No</p>
                    <p className="font-semibold">{invoiceNo}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Date</p>
                    <p className="font-semibold">{invoiceDate}</p>
                  </div>
                </div>
                <div className="mb-6">
                  <p className="text-sm text-slate-500">Bill To</p>
                  <p className="font-semibold text-slate-800">{partyName || '---'}</p>
                </div>
                <table className="w-full mb-6">
                  <thead>
                    <tr className="border-y border-slate-200">
                      <th className="text-left py-2 text-sm">Product</th>
                      <th className="text-right py-2 text-sm">Qty</th>
                      <th className="text-right py-2 text-sm">Rate</th>
                      <th className="text-right py-2 text-sm">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.filter(i => i.product).map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-100">
                        <td className="py-2 text-sm">{item.product}</td>
                        <td className="py-2 text-sm text-right">{item.qty} {item.unit}</td>
                        <td className="py-2 text-sm text-right">₹{item.rate}</td>
                        <td className="py-2 text-sm text-right">₹{item.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-slate-200">
                      <td colSpan={3} className="py-2 text-sm text-right font-medium">Total</td>
                      <td className="py-2 text-right font-bold">₹{grandTotal.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
