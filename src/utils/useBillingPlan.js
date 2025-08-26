import { useEffect, useState, useCallback } from 'react';
import { getApiBaseUrl } from '../config/environment';
import { getCurrentSession } from '../config/supabase';

// Centralized billing state hook
// - Reads current plan and credits from localStorage on mount
// - Subscribes to `billing:updated` CustomEvent for live updates
// - Subscribes to `storage` event for cross-tab sync
// - Exposes `refresh` to force-fetch `/api/billing/me` and broadcast
export default function useBillingPlan() {
  const [plan, setPlan] = useState(() => {
    try {
      return localStorage.getItem('jetsy_billing_plan') || 'free';
    } catch (_) {
      return 'free';
    }
  });
  const [credits, setCredits] = useState(() => {
    try {
      const c = localStorage.getItem('jetsy_credits');
      return c ? Number(c) : null;
    } catch (_) {
      return null;
    }
  });
  const [creditLimit, setCreditLimit] = useState(() => {
    try {
      const v = localStorage.getItem('jetsy_credit_limit');
      return v ? Number(v) : null;
    } catch (_) {
      return null;
    }
  });

  const applyBilling = useCallback((data) => {
    if (!data || typeof data !== 'object') return;
    if (data.plan) setPlan(data.plan);
    if (typeof data.credits === 'number') setCredits(data.credits);
    if (typeof data.credit_limit === 'number') setCreditLimit(data.credit_limit);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const session = await getCurrentSession();
      const headers = { 'Content-Type': 'application/json' };
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;
      const res = await fetch(`${getApiBaseUrl()}/api/billing/me`, { headers });
      if (!res.ok) return;
      const data = await res.json();
      try {
        if (data?.plan) localStorage.setItem('jetsy_billing_plan', data.plan);
        if (typeof data?.credits === 'number') localStorage.setItem('jetsy_credits', String(data.credits));
        if (typeof data?.credit_limit === 'number') localStorage.setItem('jetsy_credit_limit', String(data.credit_limit));
        if (data?.next_refresh_at) localStorage.setItem('jetsy_next_refresh_at', String(data.next_refresh_at));
      } catch (_) {}
      // Broadcast globally for any listeners
      window.dispatchEvent(new CustomEvent('billing:updated', { detail: data }));
      applyBilling(data);
    } catch (_) {
      // swallow
    }
  }, [applyBilling]);

  useEffect(() => {
    const handleBillingUpdated = (e) => {
      applyBilling(e?.detail || {});
    };
    const handleStorage = (e) => {
      if (!e) return;
      if (e.key === 'jetsy_billing_plan' && e.newValue) setPlan(e.newValue);
      if (e.key === 'jetsy_credits') setCredits(e.newValue ? Number(e.newValue) : null);
      if (e.key === 'jetsy_credit_limit') setCreditLimit(e.newValue ? Number(e.newValue) : null);
    };

    window.addEventListener('billing:updated', handleBillingUpdated);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('billing:updated', handleBillingUpdated);
      window.removeEventListener('storage', handleStorage);
    };
  }, [applyBilling]);

  return { plan, credits, creditLimit, refresh };
}
