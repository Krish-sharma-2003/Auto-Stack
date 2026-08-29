import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { API_BASE } from '@/lib/api';
import { supabase } from '@/lib/supabaseClient';

export interface CompanyFormData {
  name: string;
  business_type: string;
  industry: string;
  gstin: string;
  pan: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  bank_name: string;
  bank_account_no: string;
  ifsc_code: string;
  financial_year_start: string;
  logo_url: string;
}

const emptyForm: CompanyFormData = {
  name: '',
  business_type: 'Proprietorship',
  industry: 'General Trading',
  gstin: '',
  pan: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
  phone: '',
  email: '',
  website: '',
  bank_name: '',
  bank_account_no: '',
  ifsc_code: '',
  financial_year_start: new Date().toISOString().split('T')[0],
  logo_url: '',
};

interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function AddCompanyModal({ isOpen, onClose, onCreated }: AddCompanyModalProps) {
  const [form, setForm] = useState<CompanyFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = (field: keyof typeof emptyForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('Company name is required.');
      return;
    }
    if (!form.address.trim() || !form.city.trim() || !form.state.trim() || !form.pincode.trim()) {
      setError('Address, City, State, and Pincode are required.');
      return;
    }
    if (!form.phone.trim() || !form.email.trim()) {
      setError('Phone and Email are required.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const sessionResult = await supabase.auth.getSession();
      const token = sessionResult.data.session?.access_token;
      if (!token) {
        throw new Error('No session');
      }

      const response = await fetch(`${API_BASE}/api/companies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.detail || `Server error (${response.status})`);
      }
      setForm(emptyForm);
      onCreated();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error && err.message !== 'Failed to fetch'
          ? err.message
          : `Could not connect to backend at ${API_BASE}.`
      );
    } finally {
      setSaving(false);
    }
  };

  const fields: { key: keyof CompanyFormData; label: string; span?: string; type?: string; placeholder?: string }[] = [
    { key: 'name', label: 'Company Name*', span: 'md:col-span-2' },
    { key: 'business_type', label: 'Business Type', type: 'select' },
    { key: 'industry', label: 'Industry', type: 'select' },
    { key: 'gstin', label: 'GSTIN', placeholder: 'e.g., 09AAACM1234P1Z5' },
    { key: 'pan', label: 'PAN', placeholder: 'e.g., AAACM1234P' },
    { key: 'address', label: 'Address*', span: 'md:col-span-2' },
    { key: 'city', label: 'City*' },
    { key: 'state', label: 'State*' },
    { key: 'pincode', label: 'Pincode*' },
    { key: 'country', label: 'Country' },
    { key: 'phone', label: 'Phone*' },
    { key: 'email', label: 'Email*' },
    { key: 'website', label: 'Website' },
    { key: 'bank_name', label: 'Bank Name' },
    { key: 'bank_account_no', label: 'Account Number' },
    { key: 'ifsc_code', label: 'IFSC Code' },
    { key: 'financial_year_start', label: 'Financial Year Start', type: 'date' },
    { key: 'logo_url', label: 'Logo URL (optional)', placeholder: 'https://...' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-auto"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Create Company</h2>
                <p className="text-sm text-slate-500">Set up your business workspace</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map(({ key, label, span, type, placeholder }) => (
                <div key={key} className={span}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {label}
                  </label>
                  {type === 'select' ? (
                    <select
                      value={form[key]}
                      onChange={(e) => update(key, e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {key === 'business_type' ? (
                        <>
                          <option value="Proprietorship">Proprietorship</option>
                          <option value="Partnership">Partnership</option>
                          <option value="Pvt Ltd">Pvt Ltd</option>
                          <option value="LLP">LLP</option>
                          <option value="Public Ltd">Public Ltd</option>
                        </>
                      ) : (
                        <>
                          <option value="Pharmaceuticals">Pharmaceuticals</option>
                          <option value="FMCG">FMCG</option>
                          <option value="Electronics">Electronics</option>
                          <option value="Textiles">Textiles</option>
                          <option value="General Trading">General Trading</option>
                          <option value="Other">Other</option>
                        </>
                      )}
                    </select>
                  ) : (
                    <input
                      type={type || 'text'}
                      value={form[key]}
                      onChange={(e) => update(key, e.target.value)}
                      placeholder={placeholder}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              ))}
            </div>

            {error && (
              <p className="px-6 text-sm text-red-600 -mt-2 mb-2">{error}</p>
            )}

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? 'Creating…' : 'Create Company'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
