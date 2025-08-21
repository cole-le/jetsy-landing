import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getApiBaseUrl } from '../config/environment';

const formatCentsToDollars = (cents) => {
  if (cents == null || isNaN(cents)) return '';
  return (Number(cents) / 100).toFixed(2);
};

const dollarsToCents = (dollarsStr) => {
  const n = parseFloat(String(dollarsStr || '').replace(/[^0-9.\-]/g, ''));
  if (isNaN(n)) return null;
  return Math.max(0, Math.round(n * 100));
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

const LaunchMonitorPage = ({ projectId }) => {
  const [deployment, setDeployment] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [score, setScore] = useState(null);
  const [testRun, setTestRun] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Step 3 inputs
  const [targetAudience, setTargetAudience] = useState('');
  const [savingAudience, setSavingAudience] = useState(false);
  const [launchSaving, setLaunchSaving] = useState(false);

  // Step 4 inputs
  const [adSpendDollars, setAdSpendDollars] = useState('');
  const [impressions, setImpressions] = useState('');
  const [clicks, setClicks] = useState('');
  const [saveStep4Loading, setSaveStep4Loading] = useState(false);
  const [validationMsg, setValidationMsg] = useState(null);

  const apiBase = getApiBaseUrl();

  const displayUrl = useMemo(() => {
    if (!deployment) return null;
    const url = deployment.customDomain || deployment.vercelDomain;
    return url || null;
  }, [deployment]);

  // UTM helper removed per request

  const cpc = useMemo(() => {
    const cents = dollarsToCents(adSpendDollars);
    const c = parseInt(clicks || '0', 10) || 0;
    if (!cents || !c || c <= 0) return '—';
    return `$${(cents / 100 / c).toFixed(2)}`;
  }, [adSpendDollars, clicks]);

  const loadDeployment = async () => {
    try {
      const res = await fetch(`${apiBase}/api/projects/${projectId}/deployment`);
      const j = await res.json();
      setDeployment(j);
    } catch (e) {
      setDeployment({ status: 'error', customDomain: null, vercelDomain: null, lastDeployedAt: null, notes: e.message });
    }
  };

  const loadMetrics = async () => {
    try {
      const res = await fetch(`${apiBase}/api/projects/${projectId}/metrics`);
      if (!res.ok) throw new Error('metrics failed');
      const j = await res.json();
      setMetrics(j);
    } catch (e) {
      // non-blocking
    }
  };

  const loadScore = async () => {
    try {
      const res = await fetch(`${apiBase}/api/projects/${projectId}/score`);
      if (!res.ok) throw new Error('score failed');
      const j = await res.json();
      setScore(j);
    } catch (e) {
      // non-blocking
    }
  };

  const loadTestRun = async () => {
    try {
      const res = await fetch(`${apiBase}/api/projects/${projectId}/testrun`);
      const j = await res.json();
      setTestRun(j);
      setTargetAudience(j?.notes || '');
      setAdSpendDollars(j?.ad_spend_cents != null ? formatCentsToDollars(j.ad_spend_cents) : '');
      setImpressions(j?.impressions != null ? String(j.impressions) : '');
      setClicks(j?.clicks != null ? String(j.clicks) : '');
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadDeployment(), loadMetrics(), loadScore(), loadTestRun()]).finally(() => setLoading(false));
    // Poll metrics and score every ~20s
    const interval = setInterval(() => {
      loadMetrics();
      loadScore();
    }, 20000);
    return () => clearInterval(interval);
  }, [projectId]);

  const saveAudience = async () => {
    try {
      setSavingAudience(true);
      await fetch(`${apiBase}/api/projects/${projectId}/testrun`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: targetAudience })
      });
      await loadTestRun();
    } catch (e) {
      setError('Failed to save target audience');
      setTimeout(() => setError(null), 3000);
    } finally {
      setSavingAudience(false);
    }
  };

  const handleLaunched = async () => {
    try {
      setLaunchSaving(true);
      const launchedAt = new Date().toISOString();
      await fetch(`${apiBase}/api/projects/${projectId}/testrun`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ launchedAt })
      });
      await loadTestRun();
    } catch (e) {
      setError('Failed to set launch timestamp');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLaunchSaving(false);
    }
  };

  const saveStep4 = async () => {
    // Validate non-negative numbers
    const spendCents = dollarsToCents(adSpendDollars);
    const imp = impressions === '' ? null : parseInt(impressions, 10);
    const clk = clicks === '' ? null : parseInt(clicks, 10);
    if ((imp != null && imp < 0) || (clk != null && clk < 0) || (spendCents != null && spendCents < 0)) {
      setValidationMsg('Values cannot be negative');
      setTimeout(() => setValidationMsg(null), 3000);
      return;
    }

    try {
      setSaveStep4Loading(true);
      await fetch(`${apiBase}/api/projects/${projectId}/testrun`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adSpendCents: spendCents,
          impressions: imp,
          clicks: clk
        })
      });
      await loadTestRun();
    } catch (e) {
      setError('Failed to save ad inputs');
      setTimeout(() => setError(null), 3000);
    } finally {
      setSaveStep4Loading(false);
    }
  };

  const pill = (text, color) => (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${color}`}>{text}</span>
  );

  const Section = ({ title, helper, children }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {helper && <p className="text-sm text-gray-600 mb-4">{helper}</p>}
      {children}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Launch & Monitor</h1>
          <p className="text-sm text-gray-600 mt-1">Run a 24-hour paid traffic test to measure demand. We track site engagement and compute a Jetsy score.</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-w-[220px] text-right">
          <div className="text-3xl font-extrabold text-gray-900">{score?.total ?? '—'}/100</div>
          <div className="text-xs text-gray-600 mt-1">{score?.verdict ?? 'Waiting for data...'}</div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>
      )}

      {/* Step 1 */}
      <Section title="Step 1 — Launch Website" helper="Deploy your site so we can run traffic and attribute results with UTMs.">
        {deployment?.status === 'deployed' && (
          <div className="space-y-3">
            <div>{pill(`✅ Website live${deployment.lastDeployedAt ? ` — ${new Date(deployment.lastDeployedAt).toLocaleString()}` : ''}`, 'bg-green-100 text-green-800')}</div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
              <div className="flex gap-2">
                <input readOnly value={displayUrl || ''} className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm" />
                <button onClick={() => displayUrl && copyToClipboard(displayUrl)} className="px-3 py-2 bg-gray-100 border border-gray-300 rounded text-sm">Copy URL</button>
                {displayUrl && (
                  <a href={displayUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-blue-600 text-white rounded text-sm">Open site</a>
                )}
              </div>
            </div>
            {/* UTM helper removed */}
          </div>
        )}
        {(!deployment || deployment?.status === 'not_deployed' || (!deployment.customDomain && !deployment.vercelDomain)) && (
          <div className="space-y-3">
            <div>{pill('⚠️ Not deployed', 'bg-yellow-100 text-yellow-800')}</div>
            <button onClick={() => (window.location.href = `/chat/${projectId}`)} className="px-4 py-2 bg-blue-600 text-white rounded text-sm">Go to builder and deploy my website</button>
          </div>
        )}
        {deployment?.status === 'error' && (
          <div className="space-y-3">
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">We could not determine deployment status. You can still deploy from the builder.</div>
            <button onClick={() => (window.location.href = `/chat/${projectId}`)} className="px-4 py-2 bg-blue-600 text-white rounded text-sm">Go to builder and deploy my website</button>
          </div>
        )}
      </Section>

      {/* Step 2 */}
      <Section title="Step 2 — Create Your Ads" helper="Objective: Traffic. Budget: $25–$100 for 1 day. Audience: Job title/interests. Placements: Auto.">
        <div className="flex flex-wrap gap-3">
          <a href="https://www.linkedin.com/campaignmanager" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-100 border border-gray-300 rounded text-sm">Open LinkedIn Ads</a>
          <a href="https://business.facebook.com/adsmanager" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-100 border border-gray-300 rounded text-sm">Open Meta Ads</a>
          <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-100 border border-gray-300 rounded text-sm">Open Instagram Promotions</a>
        </div>
      </Section>

      {/* Step 3 */}
      <Section title="Step 3 — Launch ads for 24 hours">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <a href="https://www.linkedin.com/campaignmanager" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-100 border border-gray-300 rounded text-sm">LinkedIn Campaign Manager</a>
            <a href="https://business.facebook.com/adsmanager" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-100 border border-gray-300 rounded text-sm">Meta Ads Manager</a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-100 border border-gray-300 rounded text-sm">Instagram Promotions</a>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target audience (temporary — AI-generated soon)</label>
            <textarea value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" placeholder="e.g., B2B marketers in SaaS, 5–200 employees, US, job titles: Demand Gen, Growth" />
            <div className="flex gap-2 mt-2">
              <button onClick={saveAudience} disabled={savingAudience} className={`px-3 py-2 rounded text-sm ${savingAudience ? 'bg-gray-100 text-gray-400 border border-gray-300' : 'bg-gray-100 border border-gray-300'}`}>Save audience</button>
              <button onClick={handleLaunched} disabled={launchSaving} className={`px-3 py-2 rounded text-sm ${launchSaving ? 'bg-blue-300 text-white' : 'bg-blue-600 text-white'}`}>I launched my ads</button>
            </div>
            {testRun?.launched_at && (
              <p className="text-xs text-gray-600 mt-2">Launched at: {new Date(testRun.launched_at).toLocaleString()}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">If CPC &gt; $4 after the first 50 clicks, broaden targeting or pause.</p>
          </div>
        </div>
      </Section>

      {/* Step 4 */}
      <Section title="Step 4 — Monitor Key Metrics">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-2">From Ads (manual)</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Spend (USD)</label>
                <input value={adSpendDollars} onChange={(e) => setAdSpendDollars(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" placeholder="e.g., 50" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Impressions</label>
                <input type="number" value={impressions} onChange={(e) => setImpressions(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" placeholder="e.g., 7500" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Clicks</label>
                <input type="number" value={clicks} onChange={(e) => setClicks(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" placeholder="e.g., 120" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">CPC</span>
                <span className="font-medium text-gray-900">{cpc}</span>
              </div>
              {validationMsg && <div className="text-xs text-red-600">{validationMsg}</div>}
              <button onClick={saveStep4} disabled={saveStep4Loading} className={`px-3 py-2 rounded text-sm ${saveStep4Loading ? 'bg-gray-200 text-gray-500' : 'bg-gray-100 border border-gray-300'}`}>Save</button>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-2">From Jetsy (auto)</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 border border-gray-200 rounded p-3 text-center">
                <div className="text-xs text-gray-600">Visitors (24h)</div>
                <div className="text-xl font-bold text-gray-900">{metrics?.visitors ?? '—'}</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded p-3 text-center">
                <div className="text-xs text-gray-600">Pricing clicks</div>
                <div className="text-xl font-bold text-gray-900">{metrics?.pricingClicksTotal ?? '—'}</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded p-3 text-center">
                <div className="text-xs text-gray-600">Leads</div>
                <div className="text-xl font-bold text-gray-900">{metrics?.leads ?? '—'}</div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Step 5 */}
      <Section title="Step 5 — Jetsy Validation Score">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-stretch">
          <div className="bg-gray-50 border border-gray-200 rounded p-4 text-center">
            <div className="text-xs text-gray-600 mb-1">Total</div>
            <div className="text-3xl font-extrabold text-gray-900">{score?.total ?? '—'}</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded p-4 text-center">
            <div className="text-xs text-gray-600 mb-1">Traffic /30</div>
            <div className="text-2xl font-bold text-gray-900">{score?.breakdown ? score.breakdown.traffic : '—'}</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded p-4 text-center">
            <div className="text-xs text-gray-600 mb-1">Engagement /40</div>
            <div className="text-2xl font-bold text-gray-900">{score?.breakdown ? score.breakdown.engagement : '—'}</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded p-4 text-center">
            <div className="text-xs text-gray-600 mb-1">Intent /30</div>
            <div className="text-2xl font-bold text-gray-900">{score?.breakdown ? score.breakdown.intent : '—'}</div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">Benchmarks: 8% pricing-click rate and 2% lead rate are strong early signals.</p>
      </Section>

      {/* Step 6 */}
      <Section title="Step 6 — Next Actions">
        <div className="flex flex-wrap gap-3">
          <button onClick={() => (window.location.href = `/chat/${projectId}`)} className="px-4 py-2 bg-gray-100 border border-gray-300 rounded text-sm">Regenerate offer</button>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="px-4 py-2 bg-gray-100 border border-gray-300 rounded text-sm">Try new audience</button>
          <a href="https://calendly.com/jetsy/intro-15" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 text-white rounded text-sm">Book 15-min with Jetsy</a>
        </div>
      </Section>

      {/* Overview banner at bottom for context */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-900">Run a 24-hour smoke test to measure demand. Budget: $25–$100. We’ll track visits, pricing clicks, and lead submissions for you.</p>
      </div>
    </div>
  );
};

export default LaunchMonitorPage;


