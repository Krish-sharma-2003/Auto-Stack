import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { API_BASE } from '@/lib/api';

export interface Company {
  company_id: string;
  name: string;
  role: string;
  status: string;
  business_type?: string;
  industry?: string;
  gstin?: string;
  pan?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  bank_name?: string;
  bank_account_no?: string;
  ifsc_code?: string;
  financial_year_start?: string;
  logo_url?: string;
}

interface CompanyState {
  companies: Company[];
  activeCompanyId: string | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createCompany: (data: Partial<Company>) => Promise<void>;
  switchCompany: (companyId: string) => void;
  showCreateModal: boolean;
  openCreateModal: () => void;
  closeCreateModal: () => void;
}

const CompanyContext = createContext<CompanyState | null>(null);

export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error('useCompany must be used within CompanyProvider');
  return ctx;
}

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setCompanies([]);
        setActiveCompanyId(null);
        return;
      }

      const response = await fetch(`${API_BASE}/api/companies/my`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.detail || 'Failed to load companies');
      }

      const list = result.companies || [];
      setCompanies(list);
      setActiveCompanyId(prev => prev || (list.length > 0 ? list[0].company_id : null));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createCompany = async (data: Partial<Company>): Promise<void> => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) throw new Error('No session');

    const response = await fetch(`${API_BASE}/api/companies`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.detail || 'Failed to create company');
    }
    await refresh();
  };

  const switchCompany = (companyId: string) => {
    setActiveCompanyId(companyId);
  };

  const openCreateModal = () => setShowCreateModal(true);
  const closeCreateModal = () => setShowCreateModal(false);

  useEffect(() => {
    refresh();
  }, []);

  return (
    <CompanyContext.Provider value={{
      companies,
      activeCompanyId,
      loading,
      error,
      refresh,
      createCompany,
      switchCompany,
      showCreateModal,
      openCreateModal,
      closeCreateModal,
    }}>
      {children}
    </CompanyContext.Provider>
  );
}
