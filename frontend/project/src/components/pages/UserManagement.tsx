import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Shield, UserCog, Trash2, RefreshCw, Mail, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { API_BASE } from '@/lib/api';
import { useCompany } from '@/context/CompanyContext';
import { supabase } from '@/lib/supabaseClient';

interface UserRow {
  id: string;
  user_id: string | null;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

const roleColors = {
  Admin: { bg: 'bg-purple-100', text: 'text-purple-700', icon: Shield },
  Manager: { bg: 'bg-blue-100', text: 'text-blue-700', icon: UserCog },
  Accountant: { bg: 'bg-green-100', text: 'text-green-700', icon: Users },
};

const statusColors = {
  Active: { bg: 'bg-green-100', text: 'text-green-700' },
  Invited: { bg: 'bg-amber-100', text: 'text-amber-700' },
  Inactive: { bg: 'bg-slate-100', text: 'text-slate-600' },
};

export function UserManagement() {
  const { activeCompanyId } = useCompany();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Accountant');
  const [saving, setSaving] = useState(false);
  const [myRole, setMyRole] = useState<string | null>(null);
  const [replaceEmail, setReplaceEmail] = useState<{ [key: string]: string }>({});
  const [showReplace, setShowReplace] = useState<string | null>(null);

  const loadUsers = async () => {
    if (!activeCompanyId) return;
    setLoading(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE}/api/companies/${activeCompanyId}/users`, { headers });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.detail || 'Failed to load users');
      }
      setUsers(data.users || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const loadMyRole = async () => {
    if (!activeCompanyId) return;
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return;
    const headers: Record<string, string> = { 'Authorization': `Bearer ${token}` };
    const response = await fetch(`${API_BASE}/api/companies/${activeCompanyId}/users`, { headers });
    const data = await response.json();
    if (response.ok && data.success) {
      const me = data.users.find((u: UserRow) => u.user_id === session.user.id);
      if (me) setMyRole(me.role);
    }
  };

  useEffect(() => {
    loadUsers();
    loadMyRole();
  }, [activeCompanyId]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      setError('Enter an email address.');
      return;
    }
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE}/api/companies/${activeCompanyId}/users/invite`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.detail || 'Failed to invite user');
      }
      setMessage(data.message || 'User invited');
      setInviteEmail('');
      setShowInvite(false);
      await loadUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setError('');
    setMessage('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE}/api/companies/${activeCompanyId}/users/${userId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ role: newRole }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.detail || 'Failed to update role');
      }
      setMessage('Role updated');
      await loadUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    }
  };

  const handleReplace = async (userId: string) => {
    const newEmail = replaceEmail[userId]?.trim();
    if (!newEmail) {
      setError('Enter the new employee email.');
      return;
    }
    setError('');
    setMessage('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE}/api/companies/${activeCompanyId}/users/${userId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ email: newEmail }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.detail || 'Failed to replace user');
      }
      setMessage('Seat handed over. New user must sign in to accept.');
      setShowReplace(null);
      setReplaceEmail(prev => { const next = { ...prev }; delete next[userId]; return next; });
      await loadUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    }
  };

  const handleRemove = async (userId: string) => {
    if (!confirm('Remove this user from the company? They will lose access immediately.')) return;
    setError('');
    setMessage('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE}/api/companies/${activeCompanyId}/users/${userId}`, {
        method: 'DELETE',
        headers,
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.detail || 'Failed to remove user');
      }
      setMessage('User removed');
      await loadUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    }
  };

  const isAdmin = myRole === 'Admin';
  const admins = users.filter(u => u.role === 'Admin').length;
  const managers = users.filter(u => u.role === 'Manager').length;
  const activeCount = users.filter(u => u.status === 'Active').length;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">User Management</h2>
              <p className="text-sm text-slate-500">{users.length} users in this company</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadUsers}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              {isAdmin && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowInvite(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Invite User
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 p-6 bg-slate-50 border-b border-slate-100">
          <div className="bg-white p-4 rounded-lg text-center">
            <p className="text-sm text-slate-500 mb-1">Total Users</p>
            <p className="text-2xl font-bold text-slate-800">{users.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <p className="text-sm text-slate-500 mb-1">Admins</p>
            <p className="text-2xl font-bold text-purple-600">{admins}</p>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <p className="text-sm text-slate-500 mb-1">Managers</p>
            <p className="text-2xl font-bold text-blue-600">{managers}</p>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <p className="text-sm text-slate-500 mb-1">Active</p>
            <p className="text-2xl font-bold text-green-600">{activeCount}</p>
          </div>
        </div>

        {/* Messages */}
        {(error || message) && (
          <div className="px-6 py-3 border-b border-slate-100">
            {error && <p className="text-sm text-red-600">{error}</p>}
            {message && <p className="text-sm text-green-600">{message}</p>}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">User</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Email</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Role</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Joined</th>
                {isAdmin && <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="px-6 py-12 text-center text-slate-500">
                    Loading users…
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="px-6 py-12 text-center text-slate-500">
                    No users yet. Invite someone to get started.
                  </td>
                </tr>
              ) : (
                users.map((user, index) => {
                  const roleStyle = roleColors[user.role as keyof typeof roleColors] || roleColors.Accountant;
                  const statusStyle = statusColors[user.status as keyof typeof statusColors] || statusColors.Inactive;
                  const RoleIcon = roleStyle.icon;

                  return (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {user.email.split('@')[0].slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-800">
                            {user.user_id ? 'User' : 'Invited'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                      <td className="px-6 py-4">
                        {isAdmin ? (
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className={cn(
                              'px-2 py-1 rounded text-xs font-medium border-0 cursor-pointer',
                              roleStyle.bg,
                              roleStyle.text
                            )}
                          >
                            <option value="Admin">Admin</option>
                            <option value="Manager">Manager</option>
                            <option value="Accountant">Accountant</option>
                          </select>
                        ) : (
                          <span className={cn('px-2 py-1 rounded text-xs font-medium inline-flex items-center gap-1', roleStyle.bg, roleStyle.text)}>
                            <RoleIcon className="w-3 h-3" />
                            {user.role}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn('px-2 py-1 rounded-full text-xs font-medium', statusStyle.bg, statusStyle.text)}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(user.created_at).toLocaleDateString('en-IN')}
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {user.status === 'Active' && (
                              <button
                                onClick={() => setShowReplace(showReplace === user.id ? null : user.id)}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                title="Replace / Reassign"
                              >
                                <UserCog className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleRemove(user.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                              title="Remove"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Replace inline form */}
      <AnimatePresence>
        {showReplace && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-4 bg-white rounded-xl shadow-sm border border-slate-100 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-800">Replace / Reassign User</h3>
              <button onClick={() => setShowReplace(null)} className="p-1 hover:bg-slate-100 rounded">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Enter the new employee email. Their seat will be handed over — the old user loses access immediately.
            </p>
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="new.employee@company.com"
                value={replaceEmail[showReplace] || ''}
                onChange={(e) => setReplaceEmail(prev => ({ ...prev, [showReplace]: e.target.value }))}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handleReplace(showReplace)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Hand Over Seat
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInvite && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowInvite(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Invite User</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="user@company.com"
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Accountant">Accountant</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowInvite(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInvite}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? 'Inviting…' : 'Send Invite'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
