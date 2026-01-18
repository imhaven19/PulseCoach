import React, { useState, useRef } from 'react';
import { User, AppRoute } from '../types';
import { User as UserIcon, Settings, Shield, Bell, LogOut, Crown, ChevronRight, Calendar, Check, Lock, Gift, FileText, X, AlertCircle, Moon, Sun, Copy, BellOff, Dumbbell, Target, Camera, Loader2 } from 'lucide-react';
import { logout, toggleCalendarConnection, changePassword, updateProfile } from '../services/auth';
import { uploadAvatar } from '../services/storage';
import { NotificationService } from '../services/notifications';

interface ProfileProps {
  user: User;
  onNavigateToSubscription: () => void;
  onNavigateToAdmin?: () => void;
  onNavigateToLegal: (route: AppRoute) => void;
  onUserUpdate: (user: User) => void;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onNavigateToSubscription, onNavigateToAdmin, onNavigateToLegal, onUserUpdate, onLogout, isDarkMode, onToggleTheme }) => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  const [editGoal, setEditGoal] = useState(user.goal);
  const [editEquipment, setEditEquipment] = useState(user.equipment);
  const [editFitnessLevel, setEditFitnessLevel] = useState(user.fitnessLevel);
  const [editMessage, setEditMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const [copySuccess, setCopySuccess] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (file.size > 5 * 1024 * 1024) {
      alert("Photo must be smaller than 5MB.");
      return;
    }

    setIsUploadingPhoto(true);
    try {
        const publicUrl = await uploadAvatar(user.id, file);
        if (publicUrl) {
            const updatedUser = await updateProfile(user.id, { avatar_url: publicUrl });
            if (updatedUser) onUserUpdate(updatedUser);
        }
    } catch (err: any) {
        alert(err.message || "Failed to upload photo. Ensure your 'avatars' bucket is created and set to public.");
    } finally {
        setIsUploadingPhoto(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleToggleCalendar = () => {
      const updatedUser = toggleCalendarConnection(user.id);
      if (updatedUser && onUserUpdate) {
          if (updatedUser instanceof Promise) {
              updatedUser.then(onUserUpdate);
          }
      }
  };

  const handleToggleNotifications = async () => {
      setNotificationsLoading(true);
      if (user.notifications_enabled) {
          const success = await NotificationService.unsubscribe(user.id);
          if (success && onUserUpdate) onUserUpdate({ ...user, notifications_enabled: false });
      } else {
          const success = await NotificationService.requestPermissionAndSubscribe(user.id);
          if (success && onUserUpdate) onUserUpdate({ ...user, notifications_enabled: true });
      }
      setNotificationsLoading(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsUpdatingProfile(true);
      setEditMessage(null);
      
      try {
          const updatedUser = await updateProfile(user.id, {
              goal: editGoal,
              equipment: editEquipment,
              fitnessLevel: editFitnessLevel
          });
          
          if (updatedUser) {
              onUserUpdate(updatedUser);
              setEditMessage({ type: 'success', text: 'Profile updated successfully' });
              setTimeout(() => setShowEditProfileModal(false), 1500);
          } else {
              setEditMessage({ type: 'error', text: 'Failed to update profile' });
          }
      } catch (e) {
          setEditMessage({ type: 'error', text: 'An unexpected error occurred' });
      } finally {
          setIsUpdatingProfile(false);
      }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
        setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters' });
        return;
    }
    if (newPassword !== confirmPassword) {
        setPasswordMessage({ type: 'error', text: 'Passwords do not match' });
        return;
    }

    const success = await changePassword(user.id, newPassword);
    if (success) {
        setPasswordMessage({ type: 'success', text: 'Password updated successfully' });
        setTimeout(() => {
            setShowPasswordModal(false);
            setNewPassword('');
            setConfirmPassword('');
            setPasswordMessage(null);
        }, 1500);
    } else {
        setPasswordMessage({ type: 'error', text: 'Failed to update password' });
    }
  };

  const handleCopyReferral = () => {
      if (user.referralCode) {
          const link = `${window.location.origin}/signup?ref=${user.referralCode}`;
          navigator.clipboard.writeText(link);
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
      }
  };

  const userInitials = user.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const premiumDaysLeft = user.premiumEndsAt 
      ? Math.ceil((new Date(user.premiumEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : 0;

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto scrollbar-hide relative transition-colors duration-300">
      <div className="px-6 py-12 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex flex-col items-center shrink-0 transition-colors duration-300">
        <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
             <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*" 
             />
             <div className="w-24 h-24 bg-slate-900 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-white font-bold text-3xl shadow-lg ring-4 ring-slate-50 dark:ring-slate-800 transition-colors overflow-hidden relative">
                {isUploadingPhoto ? (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Loader2 className="animate-spin text-white" size={24} />
                    </div>
                ) : user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                    userInitials
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera size={24} className="text-white" />
                </div>
             </div>
             {user.subscriptionStatus === 'premium' && (
                 <div className="absolute -right-1 -top-1 bg-white dark:bg-slate-800 p-1.5 rounded-full shadow-sm">
                     <div className="bg-yellow-400 p-1.5 rounded-full text-white">
                         <Crown size={14} fill="currentColor" />
                     </div>
                 </div>
             )}
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{user.name}</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-2">{user.goal}</p>
        
        {user.isAdmin ? (
            <span className="px-3 py-1 bg-slate-900 dark:bg-slate-700 text-white rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                 <Shield size={12} fill="currentColor" /> Administrator
             </span>
        ) : user.subscriptionStatus === 'premium' ? (
             <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                 <Crown size={12} fill="currentColor" /> 
                 {user.billingStatus === 'trialing' ? 'Trial Active' : 'Premium Member'}
             </span>
        ) : (
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-xs font-bold uppercase tracking-wide">
                 Free Plan
             </span>
        )}
      </div>

      <div className="p-6 space-y-4 pb-24">
        {user.isAdmin && onNavigateToAdmin && (
            <button 
                onClick={onNavigateToAdmin}
                className="w-full text-left p-4 rounded-2xl flex items-center justify-between shadow-sm border border-slate-700 bg-slate-900 text-white transition-all active:scale-[0.98]"
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-white/10">
                        <Shield size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold">Admin Panel</h3>
                        <p className="text-xs text-slate-400">Manage users & content</p>
                    </div>
                </div>
                <ChevronRight size={20} className="text-slate-500" />
            </button>
        )}

        <button 
            onClick={onNavigateToSubscription}
            className={`w-full text-left p-4 rounded-2xl flex items-center justify-between shadow-sm border transition-all active:scale-[0.98] ${
                user.subscriptionStatus === 'premium' 
                ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white border-slate-700' 
                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-primary/50'
            }`}
        >
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${user.subscriptionStatus === 'premium' ? 'bg-white/10' : 'bg-primary/10 text-primary dark:bg-primary/20'}`}>
                    <Crown size={24} fill={user.subscriptionStatus === 'premium' ? "currentColor" : "none"} />
                </div>
                <div>
                    <h3 className={`font-bold ${user.subscriptionStatus === 'premium' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                        {user.subscriptionStatus === 'premium' 
                            ? (user.billingStatus === 'trialing' ? `${premiumDaysLeft} Days Left in Trial` : 'Premium Active') 
                            : 'Upgrade to Pro'}
                    </h3>
                    <p className={`text-xs ${user.subscriptionStatus === 'premium' ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>
                        {user.subscriptionStatus === 'premium' ? 'Manage subscription' : 'Unlock unlimited voice coaching'}
                    </p>
                </div>
            </div>
            <ChevronRight size={20} className={user.subscriptionStatus === 'premium' ? 'text-slate-500' : 'text-slate-300'} />
        </button>

        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-4 text-white relative overflow-hidden shadow-lg shadow-purple-200 dark:shadow-none">
             <div className="absolute right-0 top-0 p-8 opacity-10 transform translate-x-4 -translate-y-4">
                 <Gift size={80} fill="currentColor" />
             </div>
             <div className="relative z-10">
                 <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                     <Gift size={18} /> Refer & Earn
                 </h3>
                 <p className="text-xs text-purple-100 mb-3 max-w-[85%] leading-relaxed">
                     Give friends a <span className="font-bold text-white">7-Day Free Trial</span>. Get 1 month of Premium for every friend who subscribes.
                 </p>
                 
                 <div className="flex items-center gap-2 bg-white/10 rounded-lg p-1 pr-2">
                     <div className="bg-black/20 px-2 py-1 rounded text-[10px] font-mono tracking-wider opacity-80">
                         {user.referralCode || '...'}
                     </div>
                     <button 
                        onClick={handleCopyReferral}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white text-purple-600 rounded-md text-xs font-bold hover:bg-purple-50 transition-colors"
                    >
                        {copySuccess ? <Check size={14} /> : <Copy size={14} />}
                        {copySuccess ? 'Copied' : 'Copy Link'}
                     </button>
                 </div>
             </div>
        </div>

        {/* Training Environment Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 transition-colors">
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Training Environment</h3>
                <button 
                    onClick={() => setShowEditProfileModal(true)}
                    className="text-[10px] font-black uppercase text-primary tracking-widest hover:underline"
                >
                    Edit Profile
                </button>
            </div>
            
            <div className="p-4 flex items-center justify-between border-b border-slate-50 dark:border-slate-800">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center p-2 text-primary">
                        <Target size={20} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Primary Goal</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{user.goal}</p>
                    </div>
                </div>
            </div>

            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center p-2 text-primary">
                        <Dumbbell size={20} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Available Equipment</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">{user.equipment}</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 transition-colors">
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Integrations</h3>
            </div>
            
            {/* Google Calendar */}
            <div className="p-4 flex items-center justify-between border-b border-slate-50 dark:border-slate-800">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center p-2">
                        <Calendar size={20} className="text-blue-500" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Google Calendar</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Sync busy slots with coach</p>
                    </div>
                </div>
                <button 
                    onClick={handleToggleCalendar}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${user.is_calendar_connected ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
                >
                    <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm flex items-center justify-center ${user.is_calendar_connected ? 'translate-x-6' : 'translate-x-0'}`}>
                         {user.is_calendar_connected && <Check size={10} className="text-primary" />}
                    </div>
                </button>
            </div>

            {/* Push Notifications */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center p-2">
                        {user.notifications_enabled ? <Bell size={20} className="text-primary" /> : <BellOff size={20} className="text-slate-400" />}
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Smart Reminders</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">AI prompts for detected gaps</p>
                    </div>
                </div>
                <button 
                    onClick={handleToggleNotifications}
                    disabled={notificationsLoading}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${user.notifications_enabled ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'} ${notificationsLoading ? 'opacity-50' : ''}`}
                >
                    <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm flex items-center justify-center ${user.notifications_enabled ? 'translate-x-6' : 'translate-x-0'}`}>
                         {notificationsLoading ? <div className="w-2 h-2 border border-primary border-t-transparent rounded-full animate-spin" /> : (user.notifications_enabled && <Check size={10} className="text-primary" />)}
                    </div>
                </button>
            </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 transition-colors">
           <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Settings</h3>
            </div>
           
           <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors" onClick={onToggleTheme}>
            <div className="flex items-center gap-3">
              {isDarkMode ? <Moon size={20} className="text-purple-400" /> : <Sun size={20} className="text-orange-400" />}
              <span className="text-slate-700 dark:text-slate-200">Dark Mode</span>
            </div>
             <button 
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${isDarkMode ? 'bg-purple-600' : 'bg-slate-200'}`}
            >
                <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm flex items-center justify-center ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}>
                </div>
            </button>
          </div>

           <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <Settings size={20} className="text-slate-400" />
              <span className="text-slate-700 dark:text-slate-200">Preferences</span>
            </div>
            <ChevronRight size={16} className="text-slate-300 dark:text-slate-600" />
          </div>
           
           <div 
             onClick={() => setShowPasswordModal(true)}
             className="p-4 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
           >
            <div className="flex items-center gap-3">
              <Lock size={20} className="text-slate-400" />
              <div className="flex flex-col">
                <span className="text-slate-700 dark:text-slate-200">Security</span>
                <span className="text-[10px] text-slate-400">Password, 2FA</span>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-300 dark:text-slate-600" />
          </div>

           <div 
            onClick={() => onNavigateToLegal(AppRoute.PRIVACY)}
            className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
           >
            <div className="flex items-center gap-3">
              <Shield size={20} className="text-slate-400" />
              <span className="text-slate-700 dark:text-slate-200">Privacy Policy</span>
            </div>
            <ChevronRight size={16} className="text-slate-300 dark:text-slate-600" />
          </div>
        </div>

        <div className="flex justify-center gap-4 text-xs text-slate-400">
            <button onClick={() => onNavigateToLegal(AppRoute.TERMS)} className="hover:text-slate-600 dark:hover:text-slate-300">Terms of Service</button>
            <span>•</span>
            <button onClick={() => onNavigateToLegal(AppRoute.PRIVACY)} className="hover:text-slate-600 dark:hover:text-slate-300">Privacy Policy</button>
        </div>

        <button 
            onClick={onLogout}
            className="w-full py-4 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-2 transition-colors"
        >
            <LogOut size={18} />
            Log Out
        </button>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
          <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center animate-in fade-in duration-200">
              <div className="bg-white dark:bg-slate-900 w-full max-w-sm mx-auto rounded-t-3xl sm:rounded-2xl p-6 animate-in slide-in-from-bottom-10 duration-300 shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Profile</h3>
                      <button 
                        onClick={() => setShowEditProfileModal(false)}
                        className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                      >
                          <X size={18} />
                      </button>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Performance Goal</label>
                          <input 
                              type="text"
                              value={editGoal}
                              onChange={(e) => setEditGoal(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm font-medium"
                              placeholder="e.g. Build muscle, Run a marathon"
                          />
                      </div>
                      <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Available Equipment</label>
                          <textarea 
                              value={editEquipment}
                              onChange={(e) => setEditEquipment(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm font-medium h-24 resize-none"
                              placeholder="e.g. Bands, Dumbbells, Bench, Treadmill"
                          />
                      </div>
                      <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Fitness Level (1-5)</label>
                          <div className="flex justify-between gap-2 mt-2">
                              {[1, 2, 3, 4, 5].map(lvl => (
                                  <button
                                      key={lvl}
                                      type="button"
                                      onClick={() => setEditFitnessLevel(lvl)}
                                      className={`flex-1 h-10 rounded-lg border-2 font-black transition-all ${
                                          editFitnessLevel === lvl ? 'border-primary bg-primary text-white' : 'border-slate-100 dark:border-slate-800 text-slate-400'
                                      }`}
                                  >
                                      {lvl}
                                  </button>
                              ))}
                          </div>
                      </div>

                      {editMessage && (
                          <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                              editMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                          }`}>
                              {editMessage.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                              {editMessage.text}
                          </div>
                      )}

                      <button 
                          type="submit"
                          disabled={isUpdatingProfile}
                          className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black py-4 rounded-xl shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 uppercase tracking-widest text-xs"
                      >
                          {isUpdatingProfile ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" /> : 'Save Changes'}
                      </button>
                  </form>
              </div>
          </div>
      )}

      {showPasswordModal && (
          <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center animate-in fade-in duration-200">
              <div className="bg-white dark:bg-slate-900 w-full max-w-sm mx-auto rounded-t-3xl sm:rounded-2xl p-6 animate-in slide-in-from-bottom-10 duration-300 shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Change Password</h3>
                      <button 
                        onClick={() => setShowPasswordModal(false)}
                        className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                      >
                          <X size={18} />
                      </button>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                          <input 
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                              placeholder="Min. 6 characters"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
                          <input 
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                              placeholder="Re-enter password"
                          />
                      </div>

                      {passwordMessage && (
                          <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
                              passwordMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                          }`}>
                              {passwordMessage.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                              {passwordMessage.text}
                          </div>
                      )}

                      <button 
                          type="submit"
                          className="w-full bg-slate-900 dark:bg-slate-700 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
                      >
                          Update Password
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default Profile;