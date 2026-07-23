export type RiskLevel = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type InvoiceStatus = 'PROCESSED' | 'MANUAL_REVIEW' | 'BLOCKED';
export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Expiring Soon';
export type PaymentMode = 'Cash' | 'Bank' | 'UPI' | 'Cheque';
export type OutstandingType = 'Receivable' | 'Payable';
export type GSTReportType = 'GSTR-1' | 'GSTR-3B' | 'HSN Summary';

export interface Product {
  id: string;
  name: string;
  hsn: string;
  category: string;
  qty: number;
  unit: string;
  rate: number;
  stockValue: number;
  expiry?: Date;
  status: StockStatus;
}

export interface InvoiceItem {
  product: string;
  hsn: string;
  qty: number;
  unit: string;
  rate: number;
  discount: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  vendor: string;
  date: Date;
  amount: number;
  risk: RiskLevel;
  status: InvoiceStatus;
  items?: InvoiceItem[];
  gstin?: string;
  category?: string;
}

export interface Vendor {
  id: string;
  name: string;
  gstin: string;
  state: string;
  city: string;
  outstanding: number;
}

export interface Party {
  id: string;
  name: string;
  gstin: string;
  state: string;
  city: string;
  phone: string;
  email: string;
  address: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  date: Date;
  type: 'IN' | 'OUT';
  qty: number;
  invoiceRef: string;
  remarks?: string;
}

export interface LedgerEntry {
  id: string;
  date: Date;
  particulars: string;
  voucherNo: string;
  debit: number | null;
  credit: number | null;
  balance: number;
  balanceType: 'Dr' | 'Cr';
}

export interface Account {
  id: string;
  name: string;
  group: string;
  openingBalance: number;
  balanceType: 'Dr' | 'Cr';
}

export interface PaymentVoucher {
  id: string;
  voucherNo: string;
  date: Date;
  partyName: string;
  paymentMode: PaymentMode;
  amount: number;
  narration: string;
  referenceNo?: string;
  bankName?: string;
  chequeNo?: string;
  chequeDate?: Date;
}

export interface Outstanding {
  id: string;
  partyName: string;
  totalAmount: number;
  paid: number;
  pending: number;
  dueDate: Date;
  type: OutstandingType;
}

export interface Challan {
  id: string;
  challanNo: string;
  date: Date;
  partyName: string;
  deliveryAddress: string;
  items: InvoiceItem[];
  transportName?: string;
  vehicleNo?: string;
}

export interface GSTReport {
  gstin: string;
  party: string;
  invoiceNo: string;
  date: Date;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Accountant';
  status: 'Active' | 'Inactive';
}

export interface CompanyProfile {
  name: string;
  gstin: string;
  pan: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  bankName: string;
  accountNo: string;
  ifscCode: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: Date;
  read: boolean;
}
