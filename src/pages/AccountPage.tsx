import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../api';
import { useUiStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { User, MapPin, Lock, Trash2, Edit2, Loader2 } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(8, 'Please enter a valid phone number'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const addressSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  region: z.string().min(1, 'Region is required'),
  isDefault: z.boolean().optional(),
});

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses'>('profile');
  const { showNotification } = useUiStore();
  const { user, login } = useAuthStore();
  
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);

  // Profile Form
  const { register: registerProfile, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors }, reset: resetProfile } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', phone: '' }
  });

  // Password Form
  const { register: registerPassword, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors }, reset: resetPassword } = useForm({
    resolver: zodResolver(passwordSchema)
  });

  // Address Form
  const { register: registerAddress, handleSubmit: handleAddressSubmit, formState: { errors: addressErrors }, reset: resetAddress } = useForm({
    resolver: zodResolver(addressSchema)
  });

  useEffect(() => {
    fetchProfile();
    fetchAddresses();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/users/profile');
      resetProfile({ name: data.data.name, phone: data.data.phone || '' });
    } catch (error) {
      showNotification('Failed to load profile', 'error');
    }
  };

  const fetchAddresses = async () => {
    try {
      const { data } = await api.get('/users/addresses');
      setAddresses(data.data);
    } catch (error) {
      showNotification('Failed to load addresses', 'error');
    }
  };

  const onUpdateProfile = async (data: any) => {
    setIsLoadingProfile(true);
    try {
      const res = await api.put('/users/profile', data);
      showNotification('Profile updated successfully', 'success');
      // Update local user state
      if (user) {
        login({ user: { ...user, name: res.data.data.name }, accessToken: localStorage.getItem('marketdash_token')!, refreshToken: localStorage.getItem('marketdash_refresh_token')! });
      }
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const onChangePassword = async (data: any) => {
    setIsLoadingPassword(true);
    try {
      await api.put('/users/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      showNotification('Password changed successfully', 'success');
      resetPassword();
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setIsLoadingPassword(false);
    }
  };

  const onAddAddress = async (data: any) => {
    try {
      await api.post('/users/addresses', data);
      showNotification('Address added successfully', 'success');
      setIsAddingAddress(false);
      resetAddress();
      fetchAddresses();
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to add address', 'error');
    }
  };

  const onDeleteAddress = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await api.delete(`/users/addresses/${id}`);
        showNotification('Address deleted', 'success');
        fetchAddresses();
      } catch (error) {
        showNotification('Failed to delete address', 'error');
      }
    }
  };

  const onSetDefaultAddress = async (id: string) => {
    try {
      await api.put(`/users/addresses/${id}/default`);
      showNotification('Default address updated', 'success');
      fetchAddresses();
    } catch (error) {
      showNotification('Failed to set default address', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex overflow-x-auto md:flex-col gap-1 hide-scrollbar">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-xl font-medium transition-colors whitespace-nowrap min-h-[44px] flex-1 md:flex-none ${
                activeTab === 'profile' ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <User className="w-5 h-5" /> Profile Details
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-xl font-medium transition-colors whitespace-nowrap min-h-[44px] flex-1 md:flex-none ${
                activeTab === 'addresses' ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <MapPin className="w-5 h-5" /> Saved Addresses
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="space-y-8">
              {/* Profile Info */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-green-600" /> Personal Information
                </h2>
                <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input {...registerProfile('name')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-[16px]" />
                    {profileErrors.name && <p className="text-red-500 text-xs mt-1">{profileErrors.name.message as string}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input value={user?.email || ''} disabled className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-500 cursor-not-allowed text-[16px]" />
                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input {...registerProfile('phone')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-[16px]" />
                    {profileErrors.phone && <p className="text-red-500 text-xs mt-1">{profileErrors.phone.message as string}</p>}
                  </div>
                  <button type="submit" disabled={isLoadingProfile} className="mt-4 bg-green-600 text-white px-6 py-3 sm:py-2 rounded-xl sm:rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 min-h-[44px] w-full sm:w-auto">
                    {isLoadingProfile && <Loader2 className="w-4 h-4 animate-spin" />} Save Changes
                  </button>
                </form>
              </div>

              {/* Change Password */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-green-600" /> Change Password
                </h2>
                <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <input type="password" {...registerPassword('currentPassword')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-[16px]" />
                    {passwordErrors.currentPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.currentPassword.message as string}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input type="password" {...registerPassword('newPassword')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-[16px]" />
                    {passwordErrors.newPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword.message as string}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input type="password" {...registerPassword('confirmPassword')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-[16px]" />
                    {passwordErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword.message as string}</p>}
                  </div>
                  <button type="submit" disabled={isLoadingPassword} className="mt-4 bg-gray-900 text-white px-6 py-3 sm:py-2 rounded-xl sm:rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2 min-h-[44px] w-full sm:w-auto">
                    {isLoadingPassword && <Loader2 className="w-4 h-4 animate-spin" />} Update Password
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" /> Saved Addresses
                </h2>
                {!isAddingAddress && (
                  <button onClick={() => setIsAddingAddress(true)} className="text-green-600 font-medium hover:bg-green-50 px-4 py-2 rounded-lg transition-colors min-h-[44px]">
                    + Add New
                  </button>
                )}
              </div>

              {isAddingAddress && (
                <form onSubmit={handleAddressSubmit(onAddAddress)} className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
                  <h3 className="font-bold text-gray-900 mb-4">Add New Address</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Label (e.g., Home, Work)</label>
                      <input {...registerAddress('label')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-[16px]" />
                      {addressErrors.label && <p className="text-red-500 text-xs mt-1">{addressErrors.label.message as string}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                      <input {...registerAddress('line1')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-[16px]" />
                      {addressErrors.line1 && <p className="text-red-500 text-xs mt-1">{addressErrors.line1.message as string}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
                      <input {...registerAddress('line2')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-[16px]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input {...registerAddress('city')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-[16px]" />
                      {addressErrors.city && <p className="text-red-500 text-xs mt-1">{addressErrors.city.message as string}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                      <input {...registerAddress('region')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-[16px]" />
                      {addressErrors.region && <p className="text-red-500 text-xs mt-1">{addressErrors.region.message as string}</p>}
                    </div>
                    <div className="sm:col-span-2 flex items-center mt-2">
                      <input type="checkbox" {...registerAddress('isDefault')} id="isDefault" className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500" />
                      <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">Set as default address</label>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <button type="submit" className="bg-green-600 text-white px-6 py-3 sm:py-2 rounded-xl sm:rounded-lg font-medium hover:bg-green-700 min-h-[44px] w-full sm:w-auto">Save Address</button>
                    <button type="button" onClick={() => setIsAddingAddress(false)} className="px-6 py-3 sm:py-2 border border-gray-300 rounded-xl sm:rounded-lg font-medium text-gray-700 hover:bg-gray-50 min-h-[44px] w-full sm:w-auto">Cancel</button>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                {addresses.length === 0 && !isAddingAddress ? (
                  <p className="text-gray-500 text-center py-8">You haven't saved any addresses yet.</p>
                ) : (
                  addresses.map((addr) => (
                    <div key={addr.id} className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-4 rounded-xl border border-gray-200 hover:border-green-200 transition-colors">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900">{addr.label}</span>
                          {addr.isDefault && <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-medium">Default</span>}
                        </div>
                        <p className="text-gray-600">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                        <p className="text-gray-600">{addr.city}, {addr.region}</p>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4 sm:flex-col sm:items-end mt-2 sm:mt-0">
                        {!addr.isDefault && (
                          <button onClick={() => onSetDefaultAddress(addr.id)} className="text-sm text-gray-500 hover:text-green-600 font-medium min-h-[44px] flex items-center">
                            Set as Default
                          </button>
                        )}
                        <button onClick={() => onDeleteAddress(addr.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center" title="Delete">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
