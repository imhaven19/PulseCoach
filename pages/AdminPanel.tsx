
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { getAllUsers, updateUserStatus } from '../services/auth';
import { ArrowLeft, Search, User as UserIcon, Crown, Shield, Ban, PauseCircle } from 'lucide-react';

interface AdminPanelProps {
  user: User;
  onBack: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ user, onBack }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    refreshUsers();
  }, []);

  // Fixed refreshUsers to be async and await getAllUsers
  const refreshUsers = async () => {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
  };

  // Fixed handleStatusChange to be async and await updateUserStatus
  const handleStatusChange = async (userId: string, newStatus: 'active' | 'disabled' | 'banned') => {
      await updateUserStatus(userId, newStatus);
      refreshUsers();
  };

  const filteredUsers = users.filter(u => 
    !u.isAdmin && // Don't show admin in list
    (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const premiumCount = users.filter(u => u.subscriptionStatus === 'premium' && !u.isAdmin).length;
  const totalUsersCount = users.filter(u => !u.isAdmin).length;

  return (
    <div className="flex flex-col h-full bg-slate-50">
        <div className="bg-slate-900 text-white p-6 shrink-0">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <Shield className="text-primary" size={32} />
                    <div>
                        <h1 className="text-xl font-bold">Admin Panel</h1>
                        <p className="text-xs text-slate-400">Welcome back, Administrator</p>
                    </div>
                </div>
                <button onClick={onBack} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                    <ArrowLeft size={20} />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 p-4 rounded-xl">
                    <p className="text-2xl font-bold">{totalUsersCount}</p>
                    <p className="text-xs text-slate-400">Total Users</p>
                </div>
                 <div className="bg-white/10 p-4 rounded-xl">
                    <p className="text-2xl font-bold text-yellow-400">{premiumCount}</p>
                    <p className="text-xs text-slate-400">Premium Members</p>
                </div>
            </div>
        </div>

        <div className="p-4 bg-white border-b border-slate-100 sticky top-0 z-10">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search users..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 pl-10 pr-4 py-2 rounded-lg text-sm border border-slate-200 focus:outline-none focus:border-primary transition-all"
                />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredUsers.length === 0 ? (
                <div className="text-center mt-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserIcon className="text-slate-300" size={32} />
                    </div>
                    <p className="text-slate-400 text-sm">No users found.</p>
                </div>
            ) : (
                filteredUsers.map(u => (
                    <div key={u.id} className={`bg-white p-4 rounded-xl border shadow-sm flex items-center justify-between transition-colors ${
                        u.accountStatus === 'banned' ? 'border-red-200 bg-red-50/30' : 
                        u.accountStatus === 'disabled' ? 'border-slate-200 bg-slate-50' :
                        'border-slate-100 hover:border-primary/30'
                    }`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 ${
                                u.accountStatus === 'banned' ? 'bg-red-500' : 
                                u.accountStatus === 'disabled' ? 'bg-slate-400' :
                                'bg-slate-200 text-slate-500'
                            }`}>
                                {u.accountStatus === 'banned' ? <Ban size={18} /> : 
                                 u.accountStatus === 'disabled' ? <PauseCircle size={18} /> :
                                 <UserIcon size={20} />}
                            </div>
                            <div className="min-w-0">
                                <h3 className={`font-semibold text-sm truncate ${u.accountStatus !== 'active' ? 'text-slate-500' : 'text-slate-900'}`}>{u.name}</h3>
                                <p className="text-xs text-slate-500 truncate">{u.email}</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                             <div className="flex items-center gap-2">
                                {u.subscriptionStatus === 'premium' ? (
                                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase rounded-full flex items-center gap-1">
                                        <Crown size={10} /> Pro
                                    </span>
                                ) : (
                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded-full">
                                        Free
                                    </span>
                                )}
                             </div>
                             
                             <div className="relative group">
                                <select 
                                    className={`text-[10px] font-bold uppercase rounded-md px-2 py-1 outline-none cursor-pointer border ${
                                        u.accountStatus === 'active' ? 'bg-green-100 text-green-700 border-green-200' :
                                        u.accountStatus === 'disabled' ? 'bg-slate-200 text-slate-600 border-slate-300' :
                                        'bg-red-100 text-red-700 border-red-200'
                                    }`}
                                    value={u.accountStatus || 'active'}
                                    onChange={(e) => handleStatusChange(u.id, e.target.value as any)}
                                >
                                    <option value="active">Active</option>
                                    <option value="disabled">Disable</option>
                                    <option value="banned">Ban</option>
                                </select>
                             </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );
};

export default AdminPanel;
