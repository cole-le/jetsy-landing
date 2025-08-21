import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getApiBaseUrl } from '../config/environment';
import { SiLinkedin, SiFacebook, SiInstagram } from 'react-icons/si';
import LinkedInSingleImageAdPreview from './ads-template/LinkedInSingleImageAdPreview';
import MetaFeedSingleImageAdPreview from './ads-template/MetaFeedSingleImageAdPreview';
import InstagramSingleImageAdPreview from './ads-template/InstagramSingleImageAdPreview';

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
  const [project, setProject] = useState(null);
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

  // Ads-related state
  const [activePlatform, setActivePlatform] = useState('linkedin');
  const [adsCreated, setAdsCreated] = useState(false);
  const [adsData, setAdsData] = useState(null);

  // Refresh button state
  const [refreshSuccess, setRefreshSuccess] = useState(false);

  // Collapsible steps state - default to only Step 1 open
  const [collapsedSteps, setCollapsedSteps] = useState({
    step1: false,  // Step 1 is open by default
    step2: true,   // Step 2 is collapsed
    step3: true,   // Step 3 is collapsed
    step4: true,   // Step 4 is collapsed
    step5: true,   // Step 5 is collapsed
    step6: true    // Step 6 is collapsed
  });

  const apiBase = getApiBaseUrl();

  // Placeholder ads template data for projects with blank ads data
  const placeholderAdsData = {
    linkedIn: {
      copy: {
        primaryText: "Introductory text - Describe your product or service here",
        headline: "Headline text - Your main message",
        description: "Description text - Additional details about your offering",
        cta: "LEARN_MORE",
        linkUrl: "https://example.com",
      },
      visual: {
        imageUrl: null,
        logoUrl: null,
        brandName: "Your Business Name",
        verified: false,
      },
    },
    meta: {
      copy: {
        primaryText: "Introductory text - Describe your product or service here",
        headline: "Headline text - Your main message",
        description: "Description text - Additional details about your offering",
        cta: "SIGN_UP",
        linkUrl: "https://example.com",
      },
      visual: {
        imageUrl: null,
        logoUrl: null,
        brandName: "Your Business Name",
      },
    },
    instagram: {
      copy: {
        primaryText: "Introductory text - Describe your product or service here",
        headline: "Headline text - Your main message",
        description: "Description text - Additional details about your offering",
        cta: "GET_STARTED",
        linkUrl: "https://example.com",
      },
      visual: {
        imageUrl: null,
        logoUrl: null,
        brandName: "Your Business Name",
      },
    },
  };

  // Fallback image URLs for demo purposes
  const fallbackImages = {
    linkedIn: '/ferrari.jpg',
    meta: '/ferrari.jpg',
    instagram: '/ferrari.jpg',
    logo: '/ferrari_logo.jpg'
  };

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

  // Consider the header state incomplete until user provides key launch+ads inputs
  const isIncomplete = useMemo(() => {
    const noLaunch = !testRun?.launched_at;
    const noAdsInputs =
      testRun?.ad_spend_cents == null &&
      testRun?.impressions == null &&
      testRun?.clicks == null;
    return noLaunch || noAdsInputs;
  }, [testRun]);

  const displayTotal = useMemo(() => {
    if (isIncomplete && (!score || score.total === 0)) return '?';
    return score?.total ?? '—';
  }, [isIncomplete, score]);

  // Verdict messaging for completed runs
  const verdictCopy = useMemo(() => {
    if (!score || typeof score.total !== 'number') return null;
    if (score.total >= 70) return 'Great business idea — high potential 🚀';
    if (score.total >= 40) return 'Promising — refine and retest 🔧';
    return 'Weak signal — consider a new angle 🧪';
  }, [score]);

  // Cycle encouragement/warning copy when incomplete (header card)
  const [cycleIdx, setCycleIdx] = useState(0);
  const cycleMessages = useMemo(
    () => [
      'Awesome business idea — you should build it! 🚀',
      'This could be the next big thing! 💡',
      'Market validation time — let\'s see! 📊',
      'Not good idea — pursue another one! ❌',
      'Maybe pivot the concept? 🔄',
      'Test different angles first! 🎯',
      'Great potential here! ⭐',
      'Needs more validation! 🔍',
    ],
    []
  );

  useEffect(() => {
    const mq = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    const reduce = mq?.matches;
    if (isIncomplete && !reduce) {
      const id = setInterval(() => {
        setCycleIdx((i) => (i + 1) % cycleMessages.length);
      }, 3500);
      return () => clearInterval(id);
    }
  }, [isIncomplete, cycleMessages.length]);

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

  const loadProjectData = async () => {
    try {
      const res = await fetch(`${apiBase}/api/projects/${projectId}`);
      if (!res.ok) return;
      
      const result = await res.json();
      const projectData = result.project;
      setProject(projectData);
    } catch (e) {
      // ignore
    }
  };

  const loadAdsData = async () => {
    try {
      const res = await fetch(`${apiBase}/api/projects/${projectId}`);
      if (!res.ok) return;
      
      const result = await res.json();
      const projectData = result.project;
      
      if (projectData.ads_data) {
        try {
          const parsedAdsData = JSON.parse(projectData.ads_data);
          setAdsData(parsedAdsData);
          setAdsCreated(true);
        } catch (error) {
          console.error('Error parsing ads data:', error);
        }
      } else {
        setAdsData(placeholderAdsData);
        setAdsCreated(false);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadProjectData(), loadDeployment(), loadMetrics(), loadScore(), loadTestRun(), loadAdsData()]).finally(() => setLoading(false));
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

  // Helper function to get ads data with fallbacks
  const getAdsDataWithFallback = (platform) => {
    if (!adsData) return placeholderAdsData[platform];
    
    const platformData = adsData[platform];
    if (!platformData) return placeholderAdsData[platform];
    
    return {
      ...platformData,
      visual: {
        ...platformData.visual,
        imageUrl: platformData.visual?.imageUrl || fallbackImages[platform],
        logoUrl: platformData.visual?.logoUrl || fallbackImages.logo
      }
    };
  };

  const Section = ({ title, helper, children, stepKey }) => {
    const isCollapsed = collapsedSteps[stepKey];
    
    const toggleCollapse = () => {
      setCollapsedSteps(prev => ({
        ...prev,
        [stepKey]: !prev[stepKey]
      }));
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div 
          className="flex items-start justify-between mb-2 cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded transition-colors"
          onClick={toggleCollapse}
        >
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {helper && <p className="text-sm text-gray-600 mt-1">{helper}</p>}
          </div>
          <button
            className="text-black hover:text-gray-700 transition-colors p-1 ml-2 flex-shrink-0"
            aria-label={isCollapsed ? 'Expand section' : 'Collapse section'}
            onClick={(e) => {
              e.stopPropagation();
              toggleCollapse();
            }}
          >
            <svg
              className={`w-5 h-5 transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        {!isCollapsed && children}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {project?.project_name || 'Project'} - Launch & Monitor
          </h1>
          <p className="text-sm text-gray-600 mt-1">Run a 24-hour paid traffic test to gauge demand for your business. We track on-site engagement and your ad campaign inputs to compute a single Jetsy Validation Score.</p>
          
          {/* Refresh Button */}
          <button
            onClick={async () => {
              setLoading(true);
              setRefreshSuccess(false);
                          try {
              await Promise.all([loadProjectData(), loadDeployment(), loadMetrics(), loadScore(), loadTestRun(), loadAdsData()]);
              setRefreshSuccess(true);
              // Reset success state after 2 seconds
              setTimeout(() => setRefreshSuccess(false), 2000);
              
              // Dispatch event to refresh navbar data
              window.dispatchEvent(new CustomEvent('launch-monitor:refresh'));
            } finally {
                setLoading(false);
              }
            }}
            disabled={loading || refreshSuccess}
            className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              refreshSuccess
                ? 'bg-green-600 text-white cursor-default'
                : loading
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {refreshSuccess ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Successfully refreshed!
              </>
            ) : loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refreshing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh and get updates
              </>
            )}
          </button>
        </div>
        <div className="relative rounded-2xl w-[280px]">
          {/* Glow */}
          <div
            aria-hidden
            className="absolute -inset-[6px] rounded-2xl blur-md opacity-70"
            style={{
              background:
                'conic-gradient(from var(--tw-gradient-angle,0deg), #ef4444, #f59e0b, #facc15, #22c55e, #3b82f6, #a855f7, #ef4444)'
            }}
          />
          {/* Rainbow ring via mask */}
          <div
            aria-hidden
            className="absolute inset-0 rounded-2xl p-[3px]"
            style={{
              background:
                'conic-gradient(from var(--tw-gradient-angle,0deg), #ef4444, #f59e0b, #facc15, #22c55e, #3b82f6, #a855f7, #ef4444)',
              WebkitMask:
                'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude'
            }}
          />
          {/* Shine */}
          <div
            aria-hidden
            className="absolute inset-0 rounded-2xl p-[3px] bg-[length:200%_100%] animate-shine motion-reduce:animate-none"
            style={{
              background:
                'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0) 100%)',
              WebkitMask:
                'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude'
            }}
          />
          {/* Content */}
          <div className="relative z-10 bg-white rounded-2xl p-6 shadow-md text-center h-[140px] flex flex-col justify-center">
            <div className="text-xs font-medium text-gray-500 mb-2">Jetsy Validation Score</div>
            <div className="text-3xl font-extrabold text-gray-900">{displayTotal}</div>
            <div className="text-xs text-gray-500 mt-1">/100</div>
            {isIncomplete ? (
              <div className="text-xs text-gray-500 mt-2 animate-pulse min-h-[20px]">{cycleMessages[cycleIdx]}</div>
            ) : (
              <div className="text-xs text-gray-600 mt-2 min-h-[20px]">{verdictCopy || 'Complete your test to see results'}</div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>
      )}

      {/* Step 1 */}
      <Section title="Step 1 — Launch Website 🌐" helper="Deploy your site so we can run traffic and attribute results with UTMs." stepKey="step1">
        {deployment?.status === 'deployed' && (
          <div className="space-y-3">
            <div>{pill(`✅ Website live${deployment.lastDeployedAt ? ` — ${new Date(deployment.lastDeployedAt).toLocaleString()}` : ''}`, 'bg-green-100 text-green-800')}</div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
              <div className="flex gap-2">
                <input readOnly value={displayUrl || ''} className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm" />
                <button onClick={() => displayUrl && copyToClipboard(displayUrl)} className="px-3 py-2 bg-gray-100 border border-gray-300 rounded text-sm">Copy URL 📋</button>
                {displayUrl && (
                  <a href={displayUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-blue-600 text-white rounded text-sm">Visit site ➡️</a>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => (window.location.href = `/chat/${projectId}`)} className="px-4 py-2 bg-gray-100 border border-gray-300 rounded text-sm hover:bg-gray-200 transition-colors">Edit website</button>
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
      <Section title="Step 2 — Create Your Ads 📢" stepKey="step2">
        <div className="space-y-4">
          {/* Status indicator */}
          <div>
            {adsCreated ? (
              pill('✅ Ads created', 'bg-green-100 text-green-800')
            ) : (
              pill('⚠️ No ads created yet', 'bg-yellow-100 text-yellow-800')
            )}
          </div>

          {/* Platform Toggle */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActivePlatform('linkedin')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                activePlatform === 'linkedin'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <SiLinkedin className="w-4 h-4 text-blue-600" />
              <span>LinkedIn Ads</span>
            </button>
            <button
              onClick={() => setActivePlatform('meta')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                activePlatform === 'meta'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <SiFacebook className="w-4 h-4 text-blue-600" />
              <span>Meta Ads</span>
            </button>
            <button
              onClick={() => setActivePlatform('instagram')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                activePlatform === 'instagram'
                  ? 'bg-white text-pink-500 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <SiInstagram className="w-4 h-4 text-pink-500" />
              <span>Instagram Ads</span>
            </button>
          </div>

          {/* Ads Preview */}
          <div className="flex justify-center">
            {activePlatform === 'linkedin' ? (
              <LinkedInSingleImageAdPreview
                copy={getAdsDataWithFallback('linkedIn').copy}
                visual={getAdsDataWithFallback('linkedIn').visual}
                aspectRatio="1200×628"
              />
            ) : activePlatform === 'meta' ? (
              <MetaFeedSingleImageAdPreview
                copy={getAdsDataWithFallback('meta').copy}
                visual={getAdsDataWithFallback('meta').visual}
                aspectRatio="1:1"
              />
            ) : (
              <InstagramSingleImageAdPreview
                copy={getAdsDataWithFallback('instagram').copy}
                visual={getAdsDataWithFallback('instagram').visual}
                aspectRatio="1080×1080"
              />
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => window.location.href = `/ad-creatives/${projectId}`}
              className="px-4 py-2 bg-gray-100 border border-gray-300 rounded text-sm hover:bg-gray-200 transition-colors"
            >
              Edit Ads
            </button>
          </div>
        </div>
      </Section>

      {/* Step 3 */}
      <Section title="Step 3 — Launch ads for 24 hours 🚀" stepKey="step3">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <a href="https://www.linkedin.com/campaignmanager" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-100 border border-gray-300 rounded text-sm flex items-center gap-2 hover:bg-gray-200 transition-colors">
              <SiLinkedin className="w-4 h-4 text-blue-600" />
              <span>LinkedIn Ads Manager</span>
            </a>
            <a href="https://business.facebook.com/adsmanager" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-100 border border-gray-300 rounded text-sm flex items-center gap-2 hover:bg-gray-200 transition-colors">
              <SiFacebook className="w-4 h-4 text-blue-600" />
              <SiInstagram className="w-4 h-4 text-pink-500" />
              <span>Meta and Instagram Ads Manager</span>
            </a>
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
      <Section title="Step 4 — Monitor Key Metrics 📊" stepKey="step4">
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
      <Section title="Step 5 — Jetsy Validation Score ⭐" stepKey="step5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-stretch">
          {/* Total Score with animated rainbow ring, glow, and masked shine */}
          <div className="relative rounded-2xl w-[280px]">
            {/* Glow (soft outer halo) */}
            <div
              aria-hidden
              className="absolute -inset-[6px] rounded-2xl blur-md opacity-70"
              style={{
                background:
                  'conic-gradient(from var(--tw-gradient-angle,0deg), #ef4444, #f59e0b, #facc15, #22c55e, #3b82f6, #a855f7, #ef4444)'
              }}
            />
            {/* Rainbow ring (border only via mask) */}
            <div
              aria-hidden
              className="absolute inset-0 rounded-2xl p-[3px]"
              style={{
                background:
                  'conic-gradient(from var(--tw-gradient-angle,0deg), #ef4444, #f59e0b, #facc15, #22c55e, #3b82f6, #a855f7, #ef4444)',
                WebkitMask:
                  'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude'
              }}
            />
            {/* Moving white shine on the ring (masked the same way) */}
            <div
              aria-hidden
              className="absolute inset-0 rounded-2xl p-[3px] bg-[length:200%_100%] animate-shine motion-reduce:animate-none"
              style={{
                background:
                  'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0) 100%)',
                WebkitMask:
                  'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude'
              }}
            />
            {/* Content */}
            <div className="relative z-10 bg-white rounded-2xl p-6 shadow-md text-center h-[140px] flex flex-col justify-center">
              <div className="text-xs font-medium text-gray-500 mb-2">Jetsy Validation Score</div>
              <div className="text-3xl font-extrabold text-gray-900">{displayTotal}</div>
              <div className="text-xs text-gray-500 mt-1">/100</div>
              <div className="text-xs text-gray-600 mt-2 min-h-[20px]">
                {isIncomplete ? (
                  <span className="animate-pulse">{cycleMessages[cycleIdx]}</span>
                ) : (
                  verdictCopy || 'Complete your test to see results'
                )}
              </div>
            </div>
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
      <Section title="Step 6 — Next Actions 🔮" stepKey="step6">
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


