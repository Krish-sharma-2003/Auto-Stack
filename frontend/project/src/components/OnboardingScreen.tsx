import { Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { AddCompanyModal } from '@/components/AddCompanyModal';
import { useCompany } from '@/context/CompanyContext';

export function OnboardingScreen() {
  const { refresh } = useCompany();

  const handleCreated = async () => {
    await refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center"
      >
        <div className="w-16 h-16 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-6">
          <Building2 className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Create your first company</h1>
        <p className="text-sm text-slate-500 mb-8">
          Set up your business workspace to start managing inventory, invoices, and more.
        </p>
        <AddCompanyModal
          isOpen={true}
          onClose={() => {}}
          onCreated={handleCreated}
        />
      </motion.div>
    </div>
  );
}
