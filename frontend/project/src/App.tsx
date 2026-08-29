import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { LoginScreen } from '@/components/auth/LoginScreen';
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
import { OnboardingScreen } from '@/components/OnboardingScreen';
import { AddCompanyModal } from '@/components/AddCompanyModal';
import { CompanyProvider, useCompany } from '@/context/CompanyContext';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';

function AppContent({ session }: { session: Session }) {
  const { loading, companies, showCreateModal, closeCreateModal } = useCompany();

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">
        Loading workspace…
      </main>
    );
  }

  if (companies.length === 0) {
    return <OnboardingScreen />;
  }

  return (
    <>
      <Layout user={session.user} />
      <AddCompanyModal isOpen={showCreateModal} onClose={closeCreateModal} onCreated={closeCreateModal} />
    </>
  );
}

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (!isSupabaseConfigured) {
    return <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center text-slate-600">Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `frontend/project/.env` to enable sign-in.</main>;
  }
  if (loading) {
    return <main className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Checking your session...</main>;
  }
  if (!session) return <LoginScreen />;

  return (
    <CompanyProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppContent session={session} />}>
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
    </CompanyProvider>
  );
}

export default App;
