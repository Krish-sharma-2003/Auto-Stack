import { Product, Invoice, Vendor, Party, StockMovement, LedgerEntry, Account, Outstanding, User, Notification, CompanyProfile, GSTReport } from '@/types';

export const products: Product[] = [
  { id: '1', name: 'Paracetamol 500mg', hsn: '3004', category: 'Medicines', qty: 2500, unit: 'Strips', rate: 25, stockValue: 62500, status: 'In Stock' },
  { id: '2', name: 'Azithromycin 500mg', hsn: '3004', category: 'Medicines', qty: 8, unit: 'Strips', rate: 120, stockValue: 960, status: 'Low Stock' },
  { id: '3', name: 'Vitamin C Tablets', hsn: '3004', category: 'Supplements', qty: 500, unit: 'Bottles', rate: 85, stockValue: 42500, status: 'In Stock' },
  { id: '4', name: 'N95 Masks (Box of 50)', hsn: '6307', category: 'Medical Supplies', qty: 0, unit: 'Box', rate: 450, stockValue: 0, status: 'Out of Stock' },
  { id: '5', name: 'Hand Sanitizer 500ml', hsn: '3402', category: 'FMCG', qty: 120, unit: 'Bottles', rate: 75, stockValue: 9000, status: 'In Stock' },
  { id: '6', name: 'Digital Thermometer', hsn: '9025', category: 'Medical Equipment', qty: 45, unit: 'Pieces', rate: 250, stockValue: 11250, status: 'In Stock' },
  { id: '7', name: 'Crocin Pain Relief', hsn: '3004', category: 'Medicines', qty: 1500, unit: 'Strips', rate: 32, stockValue: 48000, status: 'In Stock' },
  { id: '8', name: 'Cetrizine 10mg', hsn: '3004', category: 'Medicines', qty: 5, unit: 'Strips', rate: 45, stockValue: 225, status: 'Low Stock' },
  { id: '9', name: 'Antiseptic Dettol 500ml', hsn: '3402', category: 'FMCG', qty: 80, unit: 'Bottles', rate: 95, stockValue: 7600, status: 'In Stock' },
  { id: '10', name: 'Bandage Roll', hsn: '3005', category: 'Medical Supplies', qty: 200, unit: 'Rolls', rate: 35, stockValue: 7000, status: 'In Stock' },
  { id: '11', name: 'Omeprazole 20mg', hsn: '3004', category: 'Medicines', qty: 320, unit: 'Strips', rate: 55, stockValue: 17600, status: 'In Stock' },
  { id: '12', name: 'Blood Pressure Monitor', hsn: '9018', category: 'Medical Equipment', qty: 18, unit: 'Pieces', rate: 1850, stockValue: 33300, status: 'In Stock' },
];

export const vendors: Vendor[] = [
  { id: '1', name: 'Sun Pharma Distributors Pvt Ltd', gstin: '27AABCS1234P1ZM', state: 'Maharashtra', city: 'Mumbai', outstanding: 450000 },
  { id: '2', name: 'Cipla Healthcare Ltd', gstin: '27AACCC5678L1Z5', state: 'Maharashtra', city: 'Pune', outstanding: 320000 },
  { id: '3', name: 'Dr Reddy Labs', gstin: '36AADCD3456R1Z8', state: 'Telangana', city: 'Hyderabad', outstanding: 180000 },
  { id: '4', name: 'Mankind Pharma', gstin: '09AADCM7890K1Z2', state: 'Uttar Pradesh', city: 'Lucknow', outstanding: 95000 },
  { id: '5', name: 'Medplus Distributors', gstin: '29AABBM1234C1ZA', state: 'Karnataka', city: 'Bangalore', outstanding: 275000 },
];

export const parties: Party[] = [
  { id: '1', name: 'Medicine House', gstin: '09AAACM1234P1Z5', state: 'Uttar Pradesh', city: 'Kanpur', phone: '9876543210', email: 'medicine.house@gmail.com', address: '123, Mall Road, Kanpur - 208001' },
  { id: '2', name: 'City Medical Store', gstin: '09AAACC5678P1Z3', state: 'Uttar Pradesh', city: 'Lucknow', phone: '9898989898', email: 'city.medical@yahoo.com', address: '45, Hazratganj, Lucknow - 226001' },
  { id: '3', name: 'Health Plus Pharmacy', gstin: '27AAAPH9012L1Z7', state: 'Maharashtra', city: 'Mumbai', phone: '9123456789', email: 'healthplus@rediffmail.com', address: '78, Andheri West, Mumbai - 400053' },
  { id: '4', name: 'Apollo Pharmacy', gstin: 'TNAPA1234G1Z9', state: 'Tamil Nadu', city: 'Chennai', phone: '9988776655', email: 'apollo.chennai@apollo.com', address: 'Sector 12, Anna Nagar, Chennai - 600040' },
  { id: '5', name: ' Wellness Medicals', gstin: 'KAAPW5678H1Z4', state: 'Karnataka', city: 'Bangalore', phone: '8877665544', email: 'wellness.blr@gmail.com', address: '22, MG Road, Bangalore - 560001' },
];

export const invoices: Invoice[] = [
  { id: '1', invoiceNo: 'INV-2024-001', vendor: 'Sun Pharma Distributors Pvt Ltd', date: new Date('2024-01-15'), amount: 125000, risk: 'NONE', status: 'PROCESSED', category: 'Medicines' },
  { id: '2', invoiceNo: 'INV-2024-002', vendor: 'Cipla Healthcare Ltd', date: new Date('2024-01-18'), amount: 87500, risk: 'LOW', status: 'PROCESSED', category: 'Medicines' },
  { id: '3', invoiceNo: 'INV-2024-003', vendor: 'Medplus Distributors', date: new Date('2024-01-20'), amount: 45000, risk: 'MEDIUM', status: 'MANUAL_REVIEW', category: 'Medical Supplies' },
  { id: '4', invoiceNo: 'INV-2024-004', vendor: 'Dr Reddy Labs', date: new Date('2024-01-22'), amount: 230000, risk: 'HIGH', status: 'MANUAL_REVIEW', category: 'Medicines' },
  { id: '5', invoiceNo: 'INV-2024-005', vendor: 'Unknown Vendor', date: new Date('2024-01-23'), amount: 56000, risk: 'CRITICAL', status: 'BLOCKED', category: 'FMCG' },
  { id: '6', invoiceNo: 'INV-2024-006', vendor: 'Mankind Pharma', date: new Date('2024-01-25'), amount: 78000, risk: 'NONE', status: 'PROCESSED', category: 'Medicines' },
  { id: '7', invoiceNo: 'INV-2024-007', vendor: 'Sun Pharma Distributors Pvt Ltd', date: new Date('2024-01-28'), amount: 92000, risk: 'LOW', status: 'PROCESSED', category: 'Medicines' },
];

export const stockMovements: StockMovement[] = [
  { id: '1', productId: '1', productName: 'Paracetamol 500mg', date: new Date('2024-01-15'), type: 'IN', qty: 1000, invoiceRef: 'INV-2024-001', remarks: 'Purchase from Sun Pharma' },
  { id: '2', productId: '3', productName: 'Vitamin C Tablets', date: new Date('2024-01-16'), type: 'OUT', qty: 50, invoiceRef: 'INV-2024-002', remarks: 'Sale to Medicine House' },
  { id: '3', productId: '5', productName: 'Hand Sanitizer 500ml', date: new Date('2024-01-17'), type: 'IN', qty: 200, invoiceRef: 'INV-2024-003', remarks: 'Purchase from Medplus' },
  { id: '4', productId: '6', productName: 'Digital Thermometer', date: new Date('2024-01-18'), type: 'OUT', qty: 10, invoiceRef: 'INV-2024-004', remarks: 'Sale to City Medical' },
  { id: '5', productId: '7', productName: 'Crocin Pain Relief', date: new Date('2024-01-19'), type: 'IN', qty: 500, invoiceRef: 'INV-2024-005', remarks: 'Purchase from Mankind' },
  { id: '6', productId: '9', productName: 'Antiseptic Dettol 500ml', date: new Date('2024-01-20'), type: 'OUT', qty: 30, invoiceRef: 'INV-2024-006', remarks: 'Sale to Health Plus' },
];

export const accounts: Account[] = [
  { id: '1', name: 'Cash Account', group: 'Current Assets', openingBalance: 150000, balanceType: 'Dr' },
  { id: '2', name: 'Bank of Baroda', group: 'Bank Accounts', openingBalance: 850000, balanceType: 'Dr' },
  { id: '3', name: 'Sales Account', group: 'Income', openingBalance: 2500000, balanceType: 'Cr' },
  { id: '4', name: 'Purchase Account', group: 'Expenses', openingBalance: 1800000, balanceType: 'Dr' },
  { id: '5', name: 'Sundry Debtors', group: 'Current Assets', openingBalance: 450000, balanceType: 'Dr' },
  { id: '6', name: 'Sundry Creditors', group: 'Current Liabilities', openingBalance: 320000, balanceType: 'Cr' },
  { id: '7', name: 'GST Input', group: 'Current Assets', openingBalance: 125000, balanceType: 'Dr' },
  { id: '8', name: 'GST Output', group: 'Current Liabilities', openingBalance: 180000, balanceType: 'Cr' },
];

export const ledgerEntries: LedgerEntry[] = [
  { id: '1', date: new Date('2024-01-01'), particulars: 'Opening Balance', voucherNo: '-', debit: null, credit: null, balance: 150000, balanceType: 'Dr' },
  { id: '2', date: new Date('2024-01-05'), particulars: 'Cash received from Medicine House', voucherNo: 'REC-001', debit: 45000, credit: null, balance: 195000, balanceType: 'Dr' },
  { id: '3', date: new Date('2024-01-08'), particulars: 'Payment to Sun Pharma Distributors', voucherNo: 'PAY-001', debit: null, credit: 75000, balance: 120000, balanceType: 'Dr' },
  { id: '4', date: new Date('2024-01-12'), particulars: 'Cash Sales', voucherNo: 'INV-2024-001', debit: 28000, credit: null, balance: 148000, balanceType: 'Dr' },
  { id: '5', date: new Date('2024-01-15'), particulars: 'Received from City Medical Store', voucherNo: 'REC-002', debit: 62000, credit: null, balance: 210000, balanceType: 'Dr' },
  { id: '6', date: new Date('2024-01-18'), particulars: 'Payment to Cipla Healthcare', voucherNo: 'PAY-002', debit: null, credit: 55000, balance: 155000, balanceType: 'Dr' },
  { id: '7', date: new Date('2024-01-22'), particulars: 'Cash Sales', voucherNo: 'INV-2024-005', debit: 35000, credit: null, balance: 190000, balanceType: 'Dr' },
];

export const outstandingReceivables: Outstanding[] = [
  { id: '1', partyName: 'Medicine House', totalAmount: 125000, paid: 80000, pending: 45000, dueDate: new Date('2024-01-25'), type: 'Receivable' },
  { id: '2', partyName: 'City Medical Store', totalAmount: 89000, paid: 89000, pending: 0, dueDate: new Date('2024-01-20'), type: 'Receivable' },
  { id: '3', partyName: 'Health Plus Pharmacy', totalAmount: 156000, paid: 50000, pending: 106000, dueDate: new Date('2024-01-10'), type: 'Receivable' },
  { id: '4', partyName: 'Apollo Pharmacy', totalAmount: 210000, paid: 100000, pending: 110000, dueDate: new Date('2024-01-15'), type: 'Receivable' },
  { id: '5', partyName: 'Wellness Medicals', totalAmount: 55000, paid: 25000, pending: 30000, dueDate: new Date('2024-02-01'), type: 'Receivable' },
];

export const outstandingPayables: Outstanding[] = [
  { id: '1', partyName: 'Sun Pharma Distributors', totalAmount: 450000, paid: 200000, pending: 250000, dueDate: new Date('2024-02-10'), type: 'Payable' },
  { id: '2', partyName: 'Cipla Healthcare Ltd', totalAmount: 320000, paid: 320000, pending: 0, dueDate: new Date('2024-01-28'), type: 'Payable' },
  { id: '3', partyName: 'Dr Reddy Labs', totalAmount: 180000, paid: 100000, pending: 80000, dueDate: new Date('2024-02-05'), type: 'Payable' },
  { id: '4', partyName: 'Mankind Pharma', totalAmount: 95000, paid: 45000, pending: 50000, dueDate: new Date('2024-02-15'), type: 'Payable' },
];

export const users: User[] = [
  { id: '1', name: 'Rajesh Kumar', email: 'rajesh.kumar@stockflow.com', role: 'Admin', status: 'Active' },
  { id: '2', name: 'Priya Sharma', email: 'priya.sharma@stockflow.com', role: 'Manager', status: 'Active' },
  { id: '3', name: 'Amit Singh', email: 'amit.singh@stockflow.com', role: 'Accountant', status: 'Active' },
  { id: '4', name: 'Neha Gupta', email: 'neha.gupta@stockflow.com', role: 'Accountant', status: 'Inactive' },
];

export const notifications: Notification[] = [
  { id: '1', title: 'Low Stock Alert', message: 'Azithromycin 500mg is running low (8 units remaining)', type: 'warning', timestamp: new Date('2024-01-28T09:30:00'), read: false },
  { id: '2', title: 'Invoice Processed', message: 'Invoice INV-2024-007 has been auto-approved', type: 'success', timestamp: new Date('2024-01-28T10:15:00'), read: false },
  { id: '3', title: 'Payment Received', message: '₹45,000 received from Medicine House', type: 'info', timestamp: new Date('2024-01-28T11:00:00'), read: true },
  { id: '4', title: 'Blocked Invoice', message: 'Invoice INV-2024-005 blocked due to GSTIN mismatch', type: 'error', timestamp: new Date('2024-01-27T14:30:00'), read: true },
];

export const companyProfile: CompanyProfile = {
  name: 'StockFlow Medicals Pvt Ltd',
  gstin: '09AABCS1234P1ZM',
  pan: 'AABCS1234P',
  email: 'info@stockflow.com',
  phone: '+91 98765 43210',
  address: '45, Industrial Area, Sector 18',
  city: 'Noida',
  state: 'Uttar Pradesh',
  pincode: '201301',
  bankName: 'Bank of Baroda',
  accountNo: '1234567890',
  ifscCode: 'BARB0NOIDA',
};

export const gstReports: GSTReport[] = [
  { gstin: '09AAACM1234P1Z5', party: 'Medicine House', invoiceNo: 'INV-2024-101', date: new Date('2024-01-05'), taxableValue: 50000, cgst: 4500, sgst: 4500, igst: 0, total: 59000 },
  { gstin: '09AAACC5678P1Z3', party: 'City Medical Store', invoiceNo: 'INV-2024-102', date: new Date('2024-01-08'), taxableValue: 75000, cgst: 6750, sgst: 6750, igst: 0, total: 88500 },
  { gstin: '27AAAPH9012L1Z7', party: 'Health Plus Pharmacy', invoiceNo: 'INV-2024-103', date: new Date('2024-01-12'), taxableValue: 120000, cgst: 0, sgst: 0, igst: 21600, total: 141600 },
  { gstin: 'TNAPA1234G1Z9', party: 'Apollo Pharmacy', invoiceNo: 'INV-2024-104', date: new Date('2024-01-15'), taxableValue: 95000, cgst: 0, sgst: 0, igst: 17100, total: 112100 },
  { gstin: 'KAAPW5678H1Z4', party: 'Wellness Medicals', invoiceNo: 'INV-2024-105', date: new Date('2024-01-18'), taxableValue: 45000, cgst: 0, sgst: 0, igst: 8100, total: 53100 },
];

export const accountGroups = [
  'Current Assets',
  'Fixed Assets',
  'Current Liabilities',
  'Long Term Liabilities',
  'Capital Account',
  'Income',
  'Expenses',
  'Bank Accounts',
  'Cash in Hand',
];

export const categories = ['Medicines', 'Medical Supplies', 'Medical Equipment', 'Supplements', 'FMCG'];

export const units = ['Strips', 'Bottles', 'Pieces', 'Box', 'Rolls', 'Kg', 'Liters'];

export function generateInvoiceVolumeData() {
  const data = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      invoices: Math.floor(Math.random() * 15) + 5,
      amount: Math.floor(Math.random() * 200000) + 50000,
    });
  }
  return data;
}

export function generateStockValueByProduct() {
  return products.slice(0, 5).map(p => ({
    name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
    value: p.stockValue,
  }));
}

export function generateRiskDistribution() {
  const riskCounts = { NONE: 0, LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
  invoices.forEach(inv => riskCounts[inv.risk]++);
  return [
    { name: 'None', value: riskCounts.NONE, color: '#10B981' },
    { name: 'Low', value: riskCounts.LOW, color: '#3B82F6' },
    { name: 'Medium', value: riskCounts.MEDIUM, color: '#F59E0B' },
    { name: 'High', value: riskCounts.HIGH, color: '#EF4444' },
    { name: 'Critical', value: riskCounts.CRITICAL, color: '#991B1B' },
  ];
}

export const lowStockProducts = products.filter(p => p.status === 'Low Stock' || p.status === 'Out of Stock');
