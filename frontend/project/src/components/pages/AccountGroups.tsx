import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Folder } from 'lucide-react';
import { accounts, accountGroups } from '@/data/mockData';
import { cn } from '@/lib/utils';

export function AccountGroups() {
  const [selectedGroup, setSelectedGroup] = useState(accountGroups[0]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const groupAccounts = accounts.filter(a => a.group === selectedGroup);
  const groupTotal = groupAccounts.reduce((sum, a) => sum + a.openingBalance, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Left Panel - Groups List */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"
      >
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Account Groups</h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
          >
            <Plus className="w-4 h-4" />
          </motion.button>
        </div>
        <div className="max-h-[500px] overflow-y-auto">
          {accountGroups.map((group) => (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              className={cn(
                'w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors flex items-center gap-3',
                selectedGroup === group ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              )}
            >
              <Folder className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-700">{group}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Right Panel - Group Details */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">{selectedGroup}</h2>
              <p className="text-sm text-slate-500">{groupAccounts.length} accounts</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Total Balance</p>
              <p className="text-xl font-bold text-slate-800">₹{groupTotal.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        {/* Accounts Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Account Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Group</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Opening Balance</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Type</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {groupAccounts.map((account, index) => (
                <motion.tr
                  key={account.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">{account.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{account.group}</td>
                  <td className="px-6 py-4 text-sm text-right font-semibold text-slate-800">
                    ₹{account.openingBalance.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      'px-2 py-1 rounded text-xs font-medium',
                      account.balanceType === 'Dr' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    )}>
                      {account.balanceType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add Group Modal */}
      {showAddModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl p-6 w-full max-w-md"
          >
            <h3 className="font-semibold text-slate-800 mb-4">Add New Account Group</h3>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Enter group name"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Group
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
