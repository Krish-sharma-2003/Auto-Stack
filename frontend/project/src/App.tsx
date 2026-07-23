import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Layout } from '@/components/layout/Layout';
import { Dashboard } from '@/components/pages/Dashboard';
import { UploadInvoice } from '@/components/pages/UploadInvoice';
import { SalesInvoice } from '@/components/pages/SalesInvoice';
import { PurchaseEntry } from '@/components/pages/PurchaseEntry';
import { PaymentVoucher } from '@/components/pages/PaymentVoucher';
import { ReceiptVoucher } from '@/components/pages/ReceiptVoucher';
import { Challan } from '@/components/pages/Challan';
import { Ledger } from '@/components/pages/Ledger';
import { AccountGroups } from '@/components/pages/AccountGroups';
import { Outstanding } from '@/components/pages/Outstanding';
import { StockItems } from '@/components/pages/StockItems';
import { StockMovementHistory } from '@/components/pages/StockMovementHistory';
import { LowStockAlerts } from '@/components/pages/LowStockAlerts';
import { GSTReports } from '@/components/pages/GSTReports';
import { SalesReport } from '@/components/pages/SalesReport';
import { PurchaseReport } from '@/components/pages/PurchaseReport';
import { StockReport } from '@/components/pages/StockReport';
import { CompanyProfile } from '@/components/pages/CompanyProfile';
import { UserManagement } from '@/components/pages/UserManagement';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="upload" element={<UploadInvoice />} />
          <Route path="sales" element={<SalesInvoice />} />
          <Route path="purchase" element={<PurchaseEntry />} />
          <Route path="payment" element={<PaymentVoucher />} />
          <Route path="receipt" element={<ReceiptVoucher />} />
          <Route path="challan" element={<Challan />} />
          <Route path="ledger" element={<Ledger />} />
          <Route path="account-groups" element={<AccountGroups />} />
          <Route path="outstanding" element={<Outstanding />} />
          <Route path="stock" element={<StockItems />} />
          <Route path="stock-movement" element={<StockMovementHistory />} />
          <Route path="low-stock" element={<LowStockAlerts />} />
          <Route path="gst-reports" element={<GSTReports />} />
          <Route path="sales-report" element={<SalesReport />} />
          <Route path="purchase-report" element={<PurchaseReport />} />
          <Route path="stock-report" element={<StockReport />} />
          <Route path="company" element={<CompanyProfile />} />
          <Route path="users" element={<UserManagement />} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
