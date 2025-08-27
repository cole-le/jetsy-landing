import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { supabase, getCurrentSession } from '../../config/supabase';
import { getApiBaseUrl } from '../../config/environment';
import PricingModal from '../PricingModal';
import useBillingPlan from '../../utils/useBillingPlan';
import AutoFitText from '../AutoFitText';

const ProfilePage = ({ onBackToChat }) => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const { plan, refresh: refreshBilling } = useBillingPlan();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [billing, setBilling] = useState(null);
  const [billingLoading, setBillingLoading] = useState(true);
  const [billingError, setBillingError] = useState(null);
  const [showPricing, setShowPricing] = useState(false);

  // Redirect unauthenticated users once auth has finished loading
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      try { window.location.href = '/'; } catch (_) {}
    }
  }, [authLoading, user]);

  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadBillingInfo();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      
      // Get user metadata from auth
      const userData = user.user_metadata || {};
      
      // Try to get additional profile data from your database if needed
      // This would be where you'd fetch from your leads table or users table
      
      setProfile({
        id: user.id,
        email: user.email,
        email_verified: user.email_confirmed_at ? true : false,
        full_name: userData.full_name || 'Not provided',
        phone: userData.phone || 'Not provided',
        created_at: user.created_at,
        last_sign_in: user.last_sign_in_at
      });

      setEditForm({
        full_name: userData.full_name || '',
        phone: userData.phone || ''
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user?.id) return;
    const confirmCancel = window.confirm('Cancel your subscription? You will be moved to the Free plan. Credits remain, but no future monthly refills.');
    if (!confirmCancel) return;
    try {
      setIsCancelling(true);
      const session = await getCurrentSession();
      const headers = { 'Content-Type': 'application/json' };
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;
      const res = await fetch(`${getApiBaseUrl()}/api/stripe/cancel-subscription`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ user_id: user.id, cancel_at_period_end: true })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to cancel subscription');
      }
      await refreshBilling();
      window.alert('Subscription cancelled. Your plan has been set to Free.');
    } catch (e) {
      console.error(e);
      window.alert(`Could not cancel subscription: ${e.message}`);
    } finally {
      setIsCancelling(false);
    }
  };

  const loadBillingInfo = async () => {
    setBillingLoading(true);
    setBillingError(null);
    try {
      const session = await getCurrentSession();
      const token = session?.access_token;
      if (!token) {
        setBilling(null);
        return;
      }
      const res = await fetch(`${getApiBaseUrl()}/api/billing/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error(`Failed to load billing (${res.status})`);
      }
      const data = await res.json();
      setBilling(data);
    } catch (e) {
      console.error('Error loading billing:', e);
      setBillingError(e.message || 'Failed to load billing');
    } finally {
      setBillingLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!editForm.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!editForm.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: editForm.full_name,
          phone: editForm.phone
        }
      });

      if (error) {
        setErrors({ general: error.message });
      } else {
        // Update local profile state
        setProfile(prev => ({
          ...prev,
          full_name: editForm.full_name,
          phone: editForm.phone
        }));
        setIsEditing(false);
        setErrors({});
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // Redirect to home page after sign out
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Profile not found</p>
          <button
            onClick={onBackToChat}
            className="mt-4 text-blue-600 hover:underline"
          >
            Back to Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600 mt-1">Manage your account settings</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onBackToChat}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Chat
            </button>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1 text-sm text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={editForm.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.full_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {errors.full_name && (
                      <p className="mt-1 text-sm text-red-500">{errors.full_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your phone number"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                    )}
                  </div>

                  {errors.general && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{errors.general}</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setErrors({});
                        // Reset form to original values
                        setEditForm({
                          full_name: profile.full_name,
                          phone: profile.phone
                        });
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Full Name
                    </label>
                    <p className="text-gray-900">{profile.full_name}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Phone Number
                    </label>
                    <p className="text-gray-900">{profile.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Email Address
                  </label>
                  <AutoFitText text={profile.email} max={16} min={12} className="font-normal" />
                  <div className="flex items-center mt-1">
                    {profile.email_verified ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Unverified
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Member Since
                  </label>
                  <p className="text-gray-900">
                    {new Date(profile.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {profile.last_sign_in && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Last Sign In
                    </label>
                    <p className="text-gray-900">
                      {new Date(profile.last_sign_in).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Plan & Credits */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Plan & Credits</h2>
                <div className="flex items-center gap-4">
                  {plan === 'free' ? (
                    <button
                      onClick={() => setShowPricing(true)}
                      className="px-3 py-1 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Upgrade plan
                    </button>
                  ) : (
                    <button
                      onClick={handleCancelSubscription}
                      disabled={isCancelling}
                      className="text-sm underline text-gray-500 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Cancel subscription"
                    >
                      {isCancelling ? 'Cancelling…' : 'Cancel subscription'}
                    </button>
                  )}
                </div>
              </div>

              {billingLoading ? (
                <p className="text-gray-600">Loading billing...</p>
              ) : billingError ? (
                <p className="text-red-600 text-sm">{billingError}</p>
              ) : billing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Current Plan</label>
                    <p className="text-gray-900 capitalize">{billing?.plan || 'free'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Credits remaining</label>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-900 font-medium">{billing?.credits ?? 0}</span>
                      <span className="text-gray-500 text-sm">of {billing?.credit_limit ?? billing?.limit ?? 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      {(() => {
                        const used = Number(billing?.credits ?? 0);
                        const limit = Number(billing?.credit_limit ?? billing?.limit ?? 0) || 0;
                        const pct = limit > 0 ? Math.max(0, Math.min(100, Math.round((used / limit) * 100))) : 0;
                        return (
                          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${pct}%` }}></div>
                        );
                      })()}
                    </div>
                  </div>
                  {billing?.next_refresh_at && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Next refresh</label>
                      <p className="text-gray-900">{new Date(billing.next_refresh_at).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-600">No billing data available.</p>
              )}
            </div>

            {/* Security Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Security</h2>
              
              <div className="space-y-4">
                <button
                  onClick={() => {
                    // This would typically open a password change modal
                    alert('Password change functionality would be implemented here');
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                >
                  Change Password
                </button>

                <button
                  onClick={() => {
                    // This would typically open a 2FA setup modal
                    alert('Two-factor authentication setup would be implemented here');
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Set up Two-Factor Authentication
                </button>
              </div>
            </div>
          </div>
        </div>
        {showPricing && (
          <PricingModal
            onPlanSelect={() => setShowPricing(false)}
            onClose={() => setShowPricing(false)}
            currentPlanType={plan || billing?.plan || null}
          />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
