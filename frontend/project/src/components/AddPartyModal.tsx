import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { API_BASE } from '@/lib/api';
import { supabase } from '@/lib/supabaseClient';
import { useCompany } from '@/context/CompanyContext';

export interface Party {
  id: string;
  name: string;
  party_type: string;
  address?: string;
  city?: string;
  pincode?: string;
  state?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  gst_no?: string;
  dl_no?: string;
  food_licence_no?: string;
  bank_acc?: string;
}

interface AddPartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (party: Party) => void;
}

const emptyForm = {
  name: '',
  party_type: 'Sundry Debtor',
  address: '',
  city: '',
  pincode: '',
  state: '',
  country: 'India',
  phone: '',
  email: '',
  website: '',
  gst_no: '',
  dl_no: '',
  food_licence_no: '',
  bank_acc: '',
};

export function AddPartyModal({ isOpen, onClose, onCreated }: AddPartyModalProps) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { activeCompanyId } = useCompany();

  const update = (field: keyof typeof emptyForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('Party name is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE}/api/parties/?company_id=${activeCompanyId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.detail || `Server error (${response.status})`);
      }
      onCreated(result.party);
      setForm(emptyForm);
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

  const fields: { key: keyof typeof emptyForm; label: string; span?: string }[] = [
    { key: 'name', label: 'Party Name', span: 'md:col-span-2' },
    { key: 'party_type', label: 'Type (Sundry Debtor / Creditor)' },
    { key: 'address', label: 'Address', span: 'md:col-span-2' },
    { key: 'city', label: 'City' },
    { key: 'pincode', label: 'Pincode' },
    { key: 'state', label: 'State' },
    { key: 'country', label: 'Country' },
    { key: 'phone', label: 'Mobile' },
    { key: 'email', label: 'E-mail' },
    { key: 'website', label: 'Website' },
    { key: 'gst_no', label: 'GST No.' },
    { key: 'dl_no', label: 'DL No.' },
    { key: 'food_licence_no', label: 'Food Licence No.' },
    { key: 'bank_acc', label: 'Bank Acc.' },
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
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Create New Party</h2>
                <p className="text-sm text-slate-500">Add party ledger details</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map(({ key, label, span }) => (
                <div key={key} className={span}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                  <input
                    type="text"
                    value={form[key]}
                    onChange={(e) => update(key, e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
                {saving ? 'Saving…' : 'Save Party'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}