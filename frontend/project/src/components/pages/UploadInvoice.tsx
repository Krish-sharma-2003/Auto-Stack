import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, XCircle, X, Sparkles, Database, MapPin, FileSearch, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { API_BASE } from '@/lib/api';
import { useCompany } from '@/context/CompanyContext';
import { supabase } from '@/lib/supabaseClient';

type ProcessingStep = 'upload' | 'extracting' | 'gstin' | 'state' | 'stock' | 'saving' | 'complete' | 'error';

type StockAction = 'CREATED' | 'UPDATED' | 'ERROR' | 'PENDING' | 'SKIPPED';

interface ExtractedData {
  vendorName: string;
  invoiceNo: string;
  invoiceDate: string;
  totalAmount: number;
  gstin: string;
  stateCode: string;
  stateName: string;
  formatValid: boolean;
  stateMatch: boolean | null;
  gstinState: string;
  addressState: string;
  riskScore: number;
  riskLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  action: string;
  status: 'PROCESSED' | 'MANUAL_REVIEW' | 'BLOCKED';
  message: string;
  stockUpdated: boolean;
  stockReason: string;
  flags: string[];
  items: { product: string; qty: number; unit: string; rate: number; amount: number; stockUpdate: StockAction }[];
}

const processingSteps = [
  { id: 'extracting', label: 'Extracting invoice data with AI OCR...', icon: FileSearch },
  { id: 'gstin', label: 'GSTIN Format Validation', icon: CheckCircle },
  { id: 'state', label: 'State Code Verification', icon: MapPin },
  { id: 'stock', label: 'Updating Inventory Stock', icon: Database },
  { id: 'saving', label: 'Saving to Database', icon: Sparkles },
];

const formatAction = (action: string) => {
  switch (action) {
    case 'AUTO_APPROVE': return 'AUTO APPROVED';
    case 'MANUAL_REVIEW': return 'MANUAL REVIEW';
    case 'BLOCK': return 'BLOCKED';
    default: return action.replace(/_/g, ' ');
  }
};

export function UploadInvoice() {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentStep, setCurrentStep] = useState<ProcessingStep>('upload');
  const [stepIndex, setStepIndex] = useState(0);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { activeCompanyId } = useCompany();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type.includes('pdf') || droppedFile.type.includes('image'))) {
      setFile(droppedFile);
      startProcessing(droppedFile);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      startProcessing(selectedFile);
    }
  }, []);

  const startProcessing = async (selectedFile: File) => {
    if (!selectedFile) return;

    setErrorMessage('');
    setExtractedData(null);
    setCurrentStep('extracting');
    setStepIndex(0);

    // Advance the visual pipeline while the real request is in flight.
    const timers: ReturnType<typeof setTimeout>[] = [];
    processingSteps.forEach((_, index) => {
      timers.push(setTimeout(() => setStepIndex(index), index * 700));
    });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const formData = new FormData();
      formData.append('file', selectedFile);

      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE}/api/invoices/upload?company_id=${activeCompanyId}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const result = await response.json();
      timers.forEach(clearTimeout);

      // Network/validation errors (400/422/500) come back without a gstin_report.
      if (!response.ok && !result.gstin_report) {
        throw new Error(result.detail || `Server error (${response.status})`);
      }

      const gstinReport = result.gstin_report || {};
      const formatCheck = gstinReport.format_check || {};
      const stateCheck = gstinReport.state_check || {};
      const riskAssessment = gstinReport.risk_assessment || {};
      const invoice = result.invoice_data || {};

      // Map product name -> stock action from the real stock_update results.
      const stockActions: Record<string, StockAction> = {};
      (result.stock_update?.results || []).forEach((r: any) => {
        if (r?.product) stockActions[r.product.toLowerCase()] = r.action;
      });
      const stockUpdated = result.stock_updated === true;
      const stockReason = result.reason || 'Stock update was skipped';

      const realData: ExtractedData = {
        vendorName: invoice.vendor_name || 'Unknown',
        invoiceNo: invoice.invoice_number || '—',
        invoiceDate: invoice.invoice_date || '—',
        totalAmount: invoice.total_amount || 0,
        gstin: gstinReport.gstin || invoice.gstin || '—',
        stateCode: formatCheck.state_code || '',
        stateName: formatCheck.state_name || '',
        formatValid: !!formatCheck.valid,
        stateMatch: stateCheck.match ?? null,
        gstinState: stateCheck.gstin_state || formatCheck.state_name || '—',
        addressState: stateCheck.address_state || '—',
        riskScore: riskAssessment.score ?? 0,
        riskLevel: riskAssessment.level || 'NONE',
        action: formatAction(riskAssessment.action || 'AUTO_APPROVE'),
        status: result.status || (result.success ? 'PROCESSED' : 'BLOCKED'),
        message: result.message || '',
        stockUpdated,
        stockReason,
        flags: riskAssessment.flags || [],
        items: (invoice.items || []).map((item: any) => ({
          product: item.name || 'Unknown',
          qty: item.quantity || 0,
          unit: item.unit || 'pcs',
          rate: item.rate ?? item.unit_price ?? 0,
          amount: item.amount ?? item.total_price ?? 0,
          stockUpdate: (stockActions[(item.name || '').toLowerCase()] ||
            (stockUpdated ? 'UPDATED' : 'SKIPPED')) as StockAction,
        })),
      };

      setExtractedData(realData);
      setCurrentStep('complete');
    } catch (error) {
      timers.forEach(clearTimeout);
      console.error('API Error:', error);
      setErrorMessage(
        error instanceof Error && error.message !== 'Failed to fetch'
          ? error.message
          : `Could not connect to backend. Make sure the server is running on ${API_BASE}.`
      );
      setCurrentStep('error');
    }
  };

  const reset = () => {
    setFile(null);
    setCurrentStep('upload');
    setStepIndex(0);
    setExtractedData(null);
    setErrorMessage('');
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'NONE': return 'text-green-600 bg-green-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      case 'MEDIUM': return 'text-amber-600 bg-amber-100';
      case 'HIGH': return 'text-red-600 bg-red-100';
      case 'CRITICAL': return 'text-red-900 bg-red-200';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-6 text-white"
      >
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-6 h-6" />
          <h1 className="text-2xl font-bold">AI-Powered Invoice Processing</h1>
        </div>
        <p className="text-blue-100">Upload invoices and let our AI automatically extract, validate, and update your inventory</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Upload Zone */}
        {currentStep === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                'border-2 border-dashed rounded-2xl p-12 text-center transition-all bg-white',
                isDragging
                  ? 'border-blue-500 bg-blue-50 scale-[1.02]'
                  : 'border-slate-300 hover:border-blue-400'
              )}
            >
              <motion.div
                animate={isDragging ? { y: [0, -10, 0] } : {}}
                transition={{ repeat: isDragging ? Infinity : 0, duration: 0.5 }}
              >
                <Upload className={cn(
                  'w-16 h-16 mx-auto mb-4 transition-colors',
                  isDragging ? 'text-blue-500' : 'text-slate-400'
                )} />
              </motion.div>

              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                {isDragging ? 'Drop your Invoice here' : 'Drop your Invoice here'}
              </h3>
              <p className="text-slate-500 mb-6">PDF, JPG, PNG supported — Max 10MB</p>

              <div className="inline-block">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Browse Files
                </motion.button>
              </div>

              <p className="text-xs text-slate-400 mt-4">or drag and drop</p>
            </div>
          </motion.div>
        )}

        {/* Processing View */}
        {currentStep !== 'upload' && currentStep !== 'complete' && currentStep !== 'error' && file && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100"
          >
            {/* File Info */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg mb-8">
              <FileText className="w-10 h-10 text-blue-500" />
              <div className="flex-1">
                <p className="font-medium text-slate-800">{file.name}</p>
                <p className="text-sm text-slate-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>

            {/* Processing Steps */}
            <div className="space-y-4">
              {processingSteps.map((step, index) => {
                const isActive = stepIndex >= index;
                const isCurrent = stepIndex === index;
                const Icon = step.icon;

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{
                      opacity: isActive ? 1 : 0.4,
                      x: 0
                    }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      'flex items-center gap-4 p-4 rounded-lg transition-all',
                      isCurrent ? 'bg-blue-50 border border-blue-200' : 'bg-slate-50'
                    )}
                  >
                    <motion.div
                      animate={isCurrent ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ repeat: isCurrent ? Infinity : 0, duration: 1 }}
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        isActive ? 'bg-green-500' : 'bg-slate-300'
                      )}
                    >
                      {isActive ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : (
                        <Icon className="w-5 h-5 text-white" />
                      )}
                    </motion.div>
                    <span className={cn(
                      'font-medium',
                      isActive ? 'text-slate-800' : 'text-slate-400'
                    )}>
                      {step.label}
                    </span>
                    {isCurrent && (
                      <motion.span
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="ml-auto text-sm text-blue-600"
                      >
                        Processing...
                      </motion.span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Complete View */}
        {currentStep === 'complete' && extractedData && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Verification Report */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-green-50 to-blue-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">Invoice Verification Report</h2>
                      <p className="text-sm text-slate-500">AI analysis completed successfully</p>
                    </div>
                  </div>
                  <button
                    onClick={reset}
                    className="p-2 hover:bg-white/80 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
              </div>

              <div className="p-6 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-500">Vendor</p>
                  <p className="font-semibold text-slate-800">{extractedData.vendorName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">GSTIN</p>
                  <p className="font-mono font-semibold text-slate-800">{extractedData.gstin}</p>
                </div>
                <div className="flex items-center gap-2">
                  {extractedData.formatValid ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <div>
                    <p className="text-sm text-slate-500">Format Check</p>
                    <p className={cn(
                      'font-medium',
                      extractedData.formatValid ? 'text-green-600' : 'text-red-600'
                    )}>
                      {extractedData.formatValid
                        ? `Valid${extractedData.stateName ? ` (${extractedData.stateName})` : ''}`
                        : 'Invalid'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className={cn(
                    'w-5 h-5',
                    extractedData.stateMatch === true ? 'text-green-500'
                      : extractedData.stateMatch === false ? 'text-red-500'
                      : 'text-amber-500'
                  )} />
                  <div>
                    <p className="text-sm text-slate-500">State Match</p>
                    <p className={cn(
                      'font-medium',
                      extractedData.stateMatch === true ? 'text-green-600'
                        : extractedData.stateMatch === false ? 'text-red-600'
                        : 'text-amber-600'
                    )}>
                      {extractedData.stateMatch === true
                        ? `Matched (${extractedData.gstinState})`
                        : extractedData.stateMatch === false
                        ? `${extractedData.gstinState} ≠ ${extractedData.addressState}`
                        : 'Not verified'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Risk Score</p>
                  <p className="font-bold text-2xl text-slate-800">{extractedData.riskScore}/100</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Risk Level</p>
                  <span className={cn(
                    'px-3 py-1 rounded-full text-sm font-semibold',
                    getRiskColor(extractedData.riskLevel)
                  )}>
                    {extractedData.riskLevel}
                  </span>
                </div>
              </div>

              <div className={cn(
                'p-4 border-t',
                extractedData.status === 'PROCESSED' ? 'bg-green-50 border-green-100'
                  : extractedData.status === 'MANUAL_REVIEW' ? 'bg-amber-50 border-amber-100'
                  : 'bg-red-50 border-red-100'
              )}>
                <div className="flex items-start gap-3">
                  {extractedData.status === 'PROCESSED' ? (
                    <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
                  ) : extractedData.status === 'MANUAL_REVIEW' ? (
                    <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 shrink-0" />
                  )}
                  <div>
                    <p className={cn(
                      'font-semibold',
                      extractedData.status === 'PROCESSED' ? 'text-green-800'
                        : extractedData.status === 'MANUAL_REVIEW' ? 'text-amber-800'
                        : 'text-red-800'
                    )}>
                      {extractedData.action}
                    </p>
                    <p className={cn(
                      'text-sm',
                      extractedData.status === 'PROCESSED' ? 'text-green-600'
                        : extractedData.status === 'MANUAL_REVIEW' ? 'text-amber-600'
                        : 'text-red-600'
                    )}>
                      {extractedData.message || 'Invoice has been processed'}
                    </p>
                    {extractedData.flags.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {extractedData.flags.map((flag, i) => (
                          <li key={i} className="text-xs text-slate-600 flex items-start gap-1">
                            <span className="mt-0.5">•</span>
                            <span>{flag}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Extracted Data */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800">Extracted Invoice Data</h3>
              </div>
              <div className="p-4 grid grid-cols-4 gap-4 bg-slate-50">
                <div>
                  <p className="text-xs text-slate-500">Invoice No</p>
                  <p className="font-medium text-slate-800">{extractedData.invoiceNo}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Date</p>
                  <p className="font-medium text-slate-800">{extractedData.invoiceDate}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total Amount</p>
                  <p className="font-bold text-slate-800">₹{extractedData.totalAmount.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Items</p>
                  <p className="font-medium text-slate-800">{extractedData.items.length} products</p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800">Invoice Items</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Product</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Qty</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Unit</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Rate</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Amount</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Stock Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extractedData.items.map((item, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-b border-slate-50 hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 text-sm text-slate-800">{item.product}</td>
                        <td className="px-4 py-3 text-sm text-slate-800">{item.qty}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{item.unit}</td>
                        <td className="px-4 py-3 text-sm text-slate-800">₹{item.rate}</td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-800">
                          ₹{item.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            'px-2 py-1 rounded text-xs font-medium',
                            item.stockUpdate === 'CREATED'
                              ? 'bg-blue-100 text-blue-700'
                              : item.stockUpdate === 'UPDATED'
                              ? 'bg-green-100 text-green-700'
                              : item.stockUpdate === 'ERROR'
                              ? 'bg-red-100 text-red-700'
                              : item.stockUpdate === 'SKIPPED'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-slate-100 text-slate-600'
                          )}>
                            {item.stockUpdate === 'SKIPPED'
                              ? `SKIPPED - ${extractedData.stockReason}`
                              : item.stockUpdate}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 font-semibold">
                      <td colSpan={4} className="px-4 py-3 text-sm text-right text-slate-600">Total</td>
                      <td className="px-4 py-3 text-sm text-slate-800">
                        ₹{extractedData.items.reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-IN')}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={reset}
                className="px-6 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Upload Another
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View in Purchase Entry
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Error View */}
        {currentStep === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white rounded-2xl p-8 shadow-sm border border-red-100 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="w-9 h-9 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Processing Failed</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">{errorMessage}</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={reset}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Try Again
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
