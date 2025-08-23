import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { getApiBaseUrl } from '../config/environment';
import { SiLinkedin, SiFacebook, SiInstagram } from 'react-icons/si';
import LinkedInSingleImageAdPreview from './ads-template/LinkedInSingleImageAdPreview';
import MetaFeedSingleImageAdPreview from './ads-template/MetaFeedSingleImageAdPreview';
import InstagramSingleImageAdPreview from './ads-template/InstagramSingleImageAdPreview';
import { useAuth } from './auth/AuthProvider';

const formatCentsToDollars = (cents) => {
  if (cents == null || isNaN(cents)) return '';
  return (Number(cents) / 100).toFixed(2);
};

// Memoized child to isolate Step 4 manual inputs from parent re-renders
const Step4ManualInputs = React.memo(function Step4ManualInputs({
  adSpendDollars,
  impressions,
  clicks,
  cpc,
  validationMsg,
  saveStep4Loading,
  onSpendChange,
  onImpressionsChange,
  onClicksChange,
  onSave,
  spendRef,
  impressionsRef,
  clicksRef,
  onInputFocus,
  onInputBlur,
  containerRef,
}) {
  return (
    <div ref={containerRef}>
      <h4 className="text-sm font-semibold text-gray-800 mb-2">Data from your Ads</h4>
      <div className="space-y-3">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Spend (USD)</label>
          <input 
            ref={spendRef}
            value={adSpendDollars} 
            onChange={onSpendChange}
            onFocus={onInputFocus}
            onBlur={onInputBlur}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" 
            placeholder="e.g., 50" 
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Impressions</label>
          <input 
            ref={impressionsRef}
            type="number" 
            value={impressions} 
            onChange={onImpressionsChange}
            onFocus={onInputFocus}
            onBlur={onInputBlur}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" 
            placeholder="e.g., 7500" 
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Clicks</label>
          <input 
            ref={clicksRef}
            type="number" 
            value={clicks} 
            onChange={onClicksChange}
            onFocus={onInputFocus}
            onBlur={onInputBlur}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" 
            placeholder="e.g., 120" 
          />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-700">CPC</span>
          <span className="font-medium text-gray-900">{cpc}</span>
        </div>
        {validationMsg && <div className="text-xs text-red-600">{validationMsg}</div>}
                <button onClick={onSave} disabled={saveStep4Loading} className={`px-3 py-2 rounded text-sm ${saveStep4Loading ? 'bg-gray-200 text-gray-500' : 'bg-gray-100 border border-gray-300'}`}>Save</button>
      </div>
    </div>
  );
});

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

const copyTargetAudience = async (platform, aiTargetAudience) => {
  const text = aiTargetAudience[platform];
  if (text) {
    const success = await copyToClipboard(text);
    if (success) {
      // Show a brief success message
      const originalText = document.getElementById(`copy-${platform}`).textContent;
      document.getElementById(`copy-${platform}`).textContent = 'Copied!';
      setTimeout(() => {
        document.getElementById(`copy-${platform}`).textContent = originalText;
      }, 2000);
    }
  }
};

const LaunchMonitorPage = ({ projectId, onNavigateToChat, onNavigateToAdCreatives }) => {
  const { session, loading: authLoading, signOut } = useAuth();
  const [project, setProject] = useState(null);
  const [cachedProjectName, setCachedProjectName] = useState('');
  const [deployment, setDeployment] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [score, setScore] = useState(null);
  const [testRun, setTestRun] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mobile responsiveness state
  const [isMobile, setIsMobile] = useState(false);
  const [showWorkflowPanel, setShowWorkflowPanel] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  // Redirect unauthenticated users once auth has finished loading
  useEffect(() => {
    if (authLoading) return;
    if (!session) {
      try { window.location.href = '/'; } catch (_) {}
    }
  }, [authLoading, session]);

  // Workflow status state for navbar progress bar
  const [websiteDeployed, setWebsiteDeployed] = useState(false);
  const [adsExist, setAdsExist] = useState(false);

  // Step 3 inputs
  const [aiTargetAudience, setAiTargetAudience] = useState({
    linkedin: '',
    meta: '',
    instagram: ''
  });
  const [isGeneratingAudience, setIsGeneratingAudience] = useState(false);

  // Step 4 inputs
  const [adSpendDollars, setAdSpendDollars] = useState('');
  const [impressions, setImpressions] = useState('');
  const [clicks, setClicks] = useState('');
  const [saveStep4Loading, setSaveStep4Loading] = useState(false);
  const [validationMsg, setValidationMsg] = useState(null);
  
  // Time range picker for Step 4
  const [timeRange, setTimeRange] = useState('custom');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // Download state
  const [isDownloading, setIsDownloading] = useState(false);

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

  // Persist project ID for navbar and other components on mount
  useEffect(() => {
    try {
      if (projectId) {
        localStorage.setItem('jetsy_current_project_id', String(projectId));
      }
    } catch (_) {}
  }, [projectId]);

  // Read cached project name for immediate UI display
  useEffect(() => {
    try {
      // Prefer per-project cached name when projectId is known
      let name = null;
      try {
        if (projectId) {
          name = localStorage.getItem(`jetsy_project_name_${projectId}`);
        }
      } catch (_) {}
      if (!name) name = localStorage.getItem('jetsy_current_project_name');
      if (name) setCachedProjectName(name);
      const onStorage = () => {
        let newName = null;
        try {
          if (projectId) newName = localStorage.getItem(`jetsy_project_name_${projectId}`);
        } catch (_) {}
        if (!newName) newName = localStorage.getItem('jetsy_current_project_name');
        if (newName) setCachedProjectName(newName);
      };
      window.addEventListener('storage', onStorage);
      return () => window.removeEventListener('storage', onStorage);
    } catch (_) {}
  }, [projectId]);

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
    // Only calculate if both values are present and valid
    if (!adSpendDollars || !clicks) return '—';
    
    const cents = dollarsToCents(adSpendDollars);
    const c = parseInt(clicks || '0', 10) || 0;
    if (!cents || !c || c <= 0) return '—';
    return `$${(cents / 100 / c).toFixed(2)}`;
  }, [adSpendDollars, clicks]);

  // Consider the header state incomplete until user provides key launch+ads inputs
  const isIncomplete = useMemo(() => {
    const noAdsInputs =
      testRun?.ad_spend_cents == null &&
      testRun?.impressions == null &&
      testRun?.clicks == null;
    return noAdsInputs;
  }, [testRun]);

  const displayTotal = useMemo(() => {
    if (isIncomplete && (!score || score.total === 0)) return '?';
    return score?.total ?? '—';
  }, [isIncomplete, score]);

  // Verdict messaging for completed runs
  const verdictCopy = useMemo(() => {
    if (!score || typeof score.total !== 'number') return null;
    if (score.total >= 70) return 'Great business idea — high potential 🚀';
    if (score.total >= 40) return 'Promising business idea — refine and retest 🔧';
    return 'Weak signal — consider a new business idea 🧪';
  }, [score]);





  const loadDeployment = async () => {
    try {
      const headers = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const res = await fetch(`${apiBase}/api/projects/${projectId}/deployment`, {
        headers
      });
      const j = await res.json();
      setDeployment(j);
      
      // Update website deployment status for workflow
      const isDeployed = j.status === 'deployed' && (j.customDomain || j.vercelDomain);
      setWebsiteDeployed(isDeployed);
      
      // Dispatch workflow status update
      try {
        window.dispatchEvent(new CustomEvent('launch-monitor:workflow-status', {
          detail: {
            websiteDeployed: isDeployed,
            adsExist: adsExist
          }
        }));
      } catch (error) {
        console.error('Error dispatching workflow status event:', error);
      }
    } catch (e) {
      setDeployment({ status: 'error', customDomain: null, vercelDomain: null, lastDeployedAt: null, notes: e.message });
    }
  };

  const loadMetrics = async () => {
    try {
      let url = `${apiBase}/api/projects/${projectId}/metrics`;
      
      // Always use custom date range parameters
      if (customStartDate && customEndDate) {
        url += `?startDate=${customStartDate}&endDate=${customEndDate}`;
      }
      
      const headers = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const res = await fetch(url, {
        headers
      });
      if (!res.ok) throw new Error('metrics failed');
      const j = await res.json();
      setMetrics(j);
    } catch (e) {
      // non-blocking
    }
  };

  const loadScore = async () => {
    try {
      const headers = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const res = await fetch(`${apiBase}/api/projects/${projectId}/score`, {
        headers
      });
      if (!res.ok) throw new Error('score failed');
      const j = await res.json();
      setScore(j);
    } catch (e) {
      // non-blocking
    }
  };

  const loadTestRun = async () => {
    try {
      const headers = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const res = await fetch(`${apiBase}/api/projects/${projectId}/testrun`, {
        headers
      });
      const j = await res.json();
      setTestRun(j);
      setAdSpendDollars(j?.ad_spend_cents != null ? formatCentsToDollars(j.ad_spend_cents) : '');
      setImpressions(j?.impressions != null ? String(j.impressions) : '');
      setClicks(j?.clicks != null ? String(j.clicks) : '');
    } catch (e) {
      // ignore
    }
  };

  const loadProjectData = async () => {
    try {
      const headers = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      console.log('Loading project data for:', projectId, 'with session:', !!session?.access_token);
      
      const res = await fetch(`${apiBase}/api/projects/${projectId}`, {
        headers
      });
      
      if (!res.ok) {
        console.error('Failed to load project data:', res.status, res.statusText);
        if (res.status === 401) {
          console.error('Authentication failed - session may be expired');
        }
        return;
      }
      
      const result = await res.json();
      const projectData = result.project;
      setProject(projectData);

      // Cache project name for immediate navbar display on refresh, and notify navbar
      try {
        const projName = projectData?.project_name || 'Project';
        localStorage.setItem('jetsy_current_project_name', projName);
        if (projectId) {
          localStorage.setItem(`jetsy_project_name_${projectId}`, projName);
        }
        window.dispatchEvent(new CustomEvent('project-name-update', { detail: { projectName: projName } }));
      } catch (_) {}
      
      // Check website deployment status
      let isWebsiteDeployed = false;
      if (projectData.template_data) {
        try {
          const templateData = JSON.parse(projectData.template_data);
          // Check if template data exists and has content
          isWebsiteDeployed = !!(templateData && Object.keys(templateData).length > 0);
        } catch (error) {
          console.error('Error parsing template data:', error);
        }
      }
      
      // Also check deployment status from deployment API if available
      try {
        const deploymentRes = await fetch(`${apiBase}/api/projects/${projectId}/deployment`, {
          headers
        });
        if (deploymentRes.ok) {
          const deploymentData = await deploymentRes.json();
          if (deploymentData.status === 'deployed' && (deploymentData.customDomain || deploymentData.vercelDomain)) {
            isWebsiteDeployed = true;
          }
        }
      } catch (error) {
        // Ignore deployment check errors, fall back to template data check
        console.log('Deployment status check failed, using template data:', error);
      }
      
      // Check ads existence
      let hasAds = false;
      if (projectData.ads_data) {
        try {
          const adsData = JSON.parse(projectData.ads_data);
          hasAds = !!(adsData && (adsData.linkedIn || adsData.meta || adsData.instagram));
        } catch (error) {
          console.error('Error parsing ads data:', error);
        }
      }
      
      // Update workflow status state
      setWebsiteDeployed(isWebsiteDeployed);
      setAdsExist(hasAds);
      
      console.log('Workflow status updated:', { websiteDeployed: isWebsiteDeployed, adsExist: hasAds });
      
      // Dispatch custom event to update navbar workflow progress bar
      try {
        window.dispatchEvent(new CustomEvent('launch-monitor:workflow-status', {
          detail: {
            websiteDeployed: isWebsiteDeployed,
            adsExist: hasAds
          }
        }));
      } catch (error) {
        console.error('Error dispatching workflow status event:', error);
      }
    } catch (e) {
      console.error('Error in loadProjectData:', e);
    }
  };

  const loadAdsData = async () => {
    try {
      const headers = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const res = await fetch(`${apiBase}/api/projects/${projectId}`, {
        headers
      });
      if (!res.ok) return;
      
      const result = await res.json();
      const projectData = result.project;
      
      if (projectData.ads_data) {
        try {
          const parsedAdsData = JSON.parse(projectData.ads_data);
          setAdsData(parsedAdsData);
          setAdsCreated(true);
          setAdsExist(true);
        } catch (error) {
          console.error('Error parsing ads data:', error);
          setAdsExist(false);
        }
      } else {
        setAdsData(placeholderAdsData);
        setAdsCreated(false);
        setAdsExist(false);
      }
      
      // Dispatch workflow status update
      try {
        window.dispatchEvent(new CustomEvent('launch-monitor:workflow-status', {
          detail: {
            websiteDeployed: websiteDeployed,
            adsExist: adsExist
          }
        }));
      } catch (error) {
        console.error('Error dispatching workflow status event:', error);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadProjectData(), loadDeployment(), loadMetrics(), loadScore(), loadTestRun(), loadAdsData()]).finally(() => setLoading(false));
  }, [projectId, session?.access_token]);

  // If session becomes available later (after initial 401), refetch project data
  useEffect(() => {
    if (projectId && session?.access_token && !project) {
      (async () => {
        setLoading(true);
        try {
          await Promise.all([loadProjectData(), loadDeployment(), loadMetrics(), loadScore(), loadTestRun(), loadAdsData()]);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [session?.access_token, projectId]);

  // Set default custom dates when component loads
  useEffect(() => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    setCustomEndDate(now.toISOString().split('T')[0]);
    setCustomStartDate(yesterday.toISOString().split('T')[0]);
  }, []);

  // Effect to detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close workflow panel when clicking outside on mobile
  useEffect(() => {
    if (!showWorkflowPanel || !isMobile) return;
    
    const handleClickOutside = (event) => {
      if (showWorkflowPanel && !event.target.closest('.workflow-panel-container')) {
        setShowWorkflowPanel(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showWorkflowPanel, isMobile]);

  // Close account menu when clicking outside
  useEffect(() => {
    if (!showAccountMenu) return;
    const handleClickOutside = (event) => {
      if (showAccountMenu && !event.target.closest('.account-menu-container')) {
        setShowAccountMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAccountMenu]);

  // Reload metrics when time range changes
  useEffect(() => {
    if (projectId) {
      loadMetrics();
    }
  }, [timeRange, customStartDate, customEndDate]);

  const generateTargetAudience = async () => {
    try {
      setIsGeneratingAudience(true);
      const headers = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const response = await fetch(`${apiBase}/api/generate-target-audience`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ projectId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate target audience');
      }
      
      const data = await response.json();
      if (data.success && data.targetAudience) {
        setAiTargetAudience(data.targetAudience);
      }
    } catch (e) {
      setError('Failed to generate target audience');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsGeneratingAudience(false);
    }
  };

  const handleTimeRangeChange = async (newTimeRange) => {
    setTimeRange(newTimeRange);
    
    // Set default custom date range (yesterday to today)
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    setCustomEndDate(now.toISOString().split('T')[0]);
    setCustomStartDate(yesterday.toISOString().split('T')[0]);
    
    // Reload metrics with new time range
    await loadMetrics();
  };

  // Refs to keep focus stable across re-renders
  const spendInputRef = useRef(null);
  const impressionsInputRef = useRef(null);
  const clicksInputRef = useRef(null);
  const manualInputsContainerRef = useRef(null);

  // Memoized input change handlers with focus restore to avoid blur after re-render
  const handleAdSpendChange = useCallback((e) => {
    const el = spendInputRef.current;
    const selStart = el ? el.selectionStart : null;
    const selEnd = el ? el.selectionEnd : null;
    setAdSpendDollars(e.target.value);
    // Restore focus and selection at next paint
    requestAnimationFrame(() => {
      if (spendInputRef.current) {
        spendInputRef.current.focus();
        // Put cursor back where it was if possible
        try {
          if (selStart != null && selEnd != null) {
            spendInputRef.current.setSelectionRange(selStart, selEnd);
          }
        } catch {}
      }
    });
  }, []);

  const handleImpressionsChange = useCallback((e) => {
    const el = impressionsInputRef.current;
    const selStart = el ? el.selectionStart : null;
    const selEnd = el ? el.selectionEnd : null;
    setImpressions(e.target.value);
    requestAnimationFrame(() => {
      if (impressionsInputRef.current) {
        impressionsInputRef.current.focus();
        try {
          if (selStart != null && selEnd != null) {
            impressionsInputRef.current.setSelectionRange(selStart, selEnd);
          }
        } catch {}
      }
    });
  }, []);

  const handleClicksChange = useCallback((e) => {
    const el = clicksInputRef.current;
    const selStart = el ? el.selectionStart : null;
    const selEnd = el ? el.selectionEnd : null;
    setClicks(e.target.value);
    requestAnimationFrame(() => {
      if (clicksInputRef.current) {
        clicksInputRef.current.focus();
        try {
          if (selStart != null && selEnd != null) {
            clicksInputRef.current.setSelectionRange(selStart, selEnd);
          }
        } catch {}
      }
    });
  }, []);

  // Focus guards for Step 4 inputs
  const handleManualInputFocus = useCallback(() => {
    // Focus handler for Step 4 inputs
  }, []);
  const handleManualInputBlur = useCallback(() => {
    // Blur handler for Step 4 inputs
  }, []);

  const handleNavigateToWebsiteCreation = () => {
    setShowWorkflowPanel(false);
    onNavigateToChat(projectId);
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
      const headers = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      await fetch(`${apiBase}/api/projects/${projectId}/testrun`, {
        method: 'PATCH',
        headers,
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" data-step={stepKey}>
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
    <div className={`max-w-6xl mx-auto px-4 py-8 ${isMobile ? 'pt-24' : ''}`}>
      {/* Mobile Header - Only show on mobile screens */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
          <div className="flex items-center h-16 px-4 w-full max-w-full overflow-visible">
            {/* Logo - positioned at far left */}
            <div className="flex items-center flex-shrink-0">
              <img 
                src="/jetsy_colorful_transparent_horizontal.png" 
                alt="Jetsy" 
                className="h-8 w-auto max-w-[80px]"
              />
            </div>

            {/* Centered Project Name Button */}
            <div className="flex-1 flex justify-center min-w-0 px-2">
              <button
                onClick={() => setShowWorkflowPanel(true)}
                className="flex items-center space-x-2 text-center hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors min-w-0 relative max-w-full"
              >
                <span className="text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-[160px]">
                  {project?.project_name || cachedProjectName || 'Loading...'}
                </span>
                <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Right side - Account avatar */}
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              <div className="relative account-menu-container">
                <button
                  onClick={() => setShowAccountMenu((v) => !v)}
                  className="p-2 rounded-full hover:bg-gray-100 border border-gray-200"
                  title={session?.user?.email || 'Account'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-700">
                    <path fillRule="evenodd" d="M12 2a5 5 0 100 10 5 5 0 000-10zm-7 17a7 7 0 1114 0v1H5v-1z" clipRule="evenodd" />
                  </svg>
                </button>
                {showAccountMenu && (
                  <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-[10000]">
                    <button
                      onClick={() => { setShowAccountMenu(false); try { window.location.href = '/profile'; } catch (_) {} }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Profile
                    </button>
                    <button
                      onClick={async () => {
                        setShowAccountMenu(false);
                        try { await signOut?.(); } catch (_) {}
                        window.location.href = '/';
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {project?.project_name || 'Project'} - Launch & Monitor
          </h1>
          <p className="text-sm text-gray-600 mt-1">Run a 24-hour paid ads ($15-20) to gauge demand for your business. We track on-site engagement and your ad campaign inputs to compute a single Jetsy Validation Score.</p>
          
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
              <button onClick={() => onNavigateToChat(projectId)} className="px-4 py-2 bg-gray-100 border border-gray-300 rounded text-sm hover:bg-gray-200 transition-colors">Edit website</button>
            </div>
            {/* UTM helper removed */}
          </div>
        )}
        {(!deployment || deployment?.status === 'not_deployed' || (!deployment.customDomain && !deployment.vercelDomain)) && (
          <div className="space-y-3">
            <div>{pill('⚠️ Not deployed', 'bg-yellow-100 text-yellow-800')}</div>
            <button onClick={() => onNavigateToChat(projectId)} className="px-4 py-2 bg-blue-600 text-white rounded text-sm">Go to builder and deploy my website</button>
          </div>
        )}
        {deployment?.status === 'error' && (
          <div className="space-y-3">
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">We could not determine deployment status. You can still deploy from the builder.</div>
            <button onClick={() => onNavigateToChat(projectId)} className="px-4 py-2 bg-blue-600 text-white rounded text-sm">Go to builder and deploy my website</button>
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
              onClick={() => {
                try {
                  if (typeof onNavigateToAdCreatives === 'function') {
                    onNavigateToAdCreatives(projectId);
                  } else {
                    window.location.href = `/ad-creatives/${projectId}`;
                  }
                } catch (err) {
                  console.error('Failed to navigate to Ad Creatives, falling back:', err);
                  try { window.location.href = `/ad-creatives/${projectId}`; } catch (_) {}
                }
              }}
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
          {/* Smart Testing Strategy moved to top */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Smart Testing Strategy:</strong> You don't need to spend much on ads to test your business idea. Just $17 is enough to get around 380+ impressions on your ads. From this, you can see how many people click on your ads and interact with your website. Based on these metrics, you'll know if your idea has potential or needs refinement.
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-700 mb-3">Click these buttons to go and launch your ad:</p>
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
          </div>

          {/* Download Ads Image and Copy All Text */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Ad Assets & Copy</h4>
            
            {/* Status indicator for ad images */}
            <div className="mb-3">
              {adsData?.linkedIn?.visual?.imageUrl || adsData?.meta?.visual?.imageUrl || adsData?.instagram?.visual?.imageUrl ? (
                <div className="text-xs text-green-600 bg-green-50 border border-green-200 rounded px-2 py-1 inline-block">
                  ✅ Custom ad images available
                </div>
              ) : (
                <div className="text-xs text-yellow-600 bg-yellow-50 border border-yellow-200 rounded px-2 py-1 inline-block">
                  ⚠️ Using placeholder images - create custom ads first
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-3 mb-4">
              <button
                onClick={async () => {
                  if (isDownloading) return; // Prevent multiple clicks
                  
                  try {
                    setIsDownloading(true);
                    
                    // Get the actual ad images from the project data
                    const actualImages = [];
                    
                    if (adsData?.linkedIn?.visual?.imageUrl) {
                      actualImages.push({ url: adsData.linkedIn.visual.imageUrl, name: 'linkedin-ad' });
                    }
                    if (adsData?.meta?.visual?.imageUrl) {
                      actualImages.push({ url: adsData.meta.visual.imageUrl, name: 'meta-ad' });
                    }
                    if (adsData?.instagram?.visual?.imageUrl) {
                      actualImages.push({ url: adsData.instagram.visual.imageUrl, name: 'instagram-ad' });
                    }
                    if (adsData?.linkedIn?.visual?.logoUrl) {
                      actualImages.push({ url: adsData.linkedIn.visual.logoUrl, name: 'logo' });
                    }
                    
                    if (actualImages.length > 0) {
                      // Fetch the image data and create a downloadable blob
                      const imageToDownload = actualImages[0];
                      const response = await fetch(imageToDownload.url);
                      const blob = await response.blob();
                      
                      // Create download link
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `${project?.project_name || 'project'}-${imageToDownload.name}.jpg`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      window.URL.revokeObjectURL(url);
                    } else {
                      // Fallback to placeholder if no actual images
                      const link = document.createElement('a');
                      link.href = fallbackImages.linkedIn;
                      link.download = `${project?.project_name || 'project'}-ad-image.jpg`;
                      link.click();
                    }
                  } catch (error) {
                    console.error('Download failed:', error);
                    // Fallback: open fallback image in new tab
                    window.open(fallbackImages.linkedIn, '_blank');
                  } finally {
                    setIsDownloading(false);
                  }
                }}
                disabled={isDownloading}
                className={`px-4 py-2 rounded text-sm transition-colors flex items-center gap-2 ${
                  isDownloading 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isDownloading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    Downloading...
                  </>
                ) : (
                  `📥 ${adsData?.linkedIn?.visual?.imageUrl || adsData?.meta?.visual?.imageUrl || adsData?.instagram?.visual?.imageUrl ? 'Download Ad Image' : 'Download Placeholder Image'}`
                )}
              </button>
              <button
                onClick={() => {
                  // Open actual ad images if available, otherwise fallback to placeholders
                  const imagesToOpen = [];
                  
                  if (adsData?.linkedIn?.visual?.imageUrl) {
                    imagesToOpen.push(adsData.linkedIn.visual.imageUrl);
                  } else {
                    imagesToOpen.push(fallbackImages.linkedIn);
                  }
                  
                  if (adsData?.meta?.visual?.imageUrl) {
                    imagesToOpen.push(adsData.meta.visual.imageUrl);
                  } else {
                    imagesToOpen.push(fallbackImages.meta);
                  }
                  
                  if (adsData?.instagram?.visual?.imageUrl) {
                    imagesToOpen.push(adsData.instagram.visual.imageUrl);
                  } else {
                    imagesToOpen.push(fallbackImages.instagram);
                  }
                  
                  if (adsData?.linkedIn?.visual?.logoUrl) {
                    imagesToOpen.push(adsData.linkedIn.visual.logoUrl);
                  } else {
                    imagesToOpen.push(fallbackImages.logo);
                  }
                  
                  // Open all images in new tabs
                  imagesToOpen.forEach(imageUrl => {
                    window.open(imageUrl, '_blank');
                  });
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                🔗 Open All Images
              </button>
            </div>
            
            {/* Copy All Ad Copy Texts */}
            <div className="space-y-3">
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <SiLinkedin className="w-4 h-4 text-blue-600" />
                    LinkedIn - All Copy Text
                  </label>
                  <button
                    onClick={() => {
                      const linkedInCopy = getAdsDataWithFallback('linkedIn');
                      const fullText = `Headline: ${linkedInCopy.copy.headline}\n\nPrimary Text: ${linkedInCopy.copy.primaryText}\n\nDescription: ${linkedInCopy.copy.description}\n\nCTA: ${linkedInCopy.copy.cta}\n\nBrand: ${linkedInCopy.visual.brandName}`;
                      copyToClipboard(fullText);
                      // Show success message
                      const button = document.getElementById('copy-all-linkedin');
                      const originalText = button.textContent;
                      button.textContent = 'Copied!';
                      setTimeout(() => {
                        button.textContent = originalText;
                      }, 2000);
                    }}
                    id="copy-all-linkedin"
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Copy All
                  </button>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div><strong>Headline:</strong> {getAdsDataWithFallback('linkedIn').copy.headline}</div>
                  <div><strong>Primary Text:</strong> {getAdsDataWithFallback('linkedIn').copy.primaryText}</div>
                  <div><strong>Description:</strong> {getAdsDataWithFallback('linkedIn').copy.description}</div>
                  <div><strong>CTA:</strong> {getAdsDataWithFallback('linkedIn').copy.cta}</div>
                  <div><strong>Brand:</strong> {getAdsDataWithFallback('linkedIn').visual.brandName}</div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <SiFacebook className="w-4 h-4 text-blue-600" />
                    Meta (Facebook) - All Copy Text
                  </label>
                  <button
                    onClick={() => {
                      const metaCopy = getAdsDataWithFallback('meta');
                      const fullText = `Headline: ${metaCopy.copy.headline}\n\nPrimary Text: ${metaCopy.copy.primaryText}\n\nDescription: ${metaCopy.copy.description}\n\nCTA: ${metaCopy.copy.cta}\n\nBrand: ${metaCopy.visual.brandName}`;
                      copyToClipboard(fullText);
                      // Show success message
                      const button = document.getElementById('copy-all-meta');
                      const originalText = button.textContent;
                      button.textContent = 'Copied!';
                      setTimeout(() => {
                        button.textContent = originalText;
                      }, 2000);
                    }}
                    id="copy-all-meta"
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Copy All
                  </button>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div><strong>Headline:</strong> {getAdsDataWithFallback('meta').copy.headline}</div>
                  <div><strong>Primary Text:</strong> {getAdsDataWithFallback('meta').copy.primaryText}</div>
                  <div><strong>Description:</strong> {getAdsDataWithFallback('meta').copy.description}</div>
                  <div><strong>CTA:</strong> {getAdsDataWithFallback('meta').copy.cta}</div>
                  <div><strong>Brand:</strong> {getAdsDataWithFallback('meta').visual.brandName}</div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <SiInstagram className="w-4 h-4 text-pink-500" />
                    Instagram - All Copy Text
                  </label>
                  <button
                    onClick={() => {
                      const instagramCopy = getAdsDataWithFallback('instagram');
                      const fullText = `Headline: ${instagramCopy.copy.headline}\n\nPrimary Text: ${instagramCopy.copy.primaryText}\n\nDescription: ${instagramCopy.copy.description}\n\nCTA: ${instagramCopy.copy.cta}\n\nBrand: ${instagramCopy.visual.brandName}`;
                      copyToClipboard(fullText);
                      // Show success message
                      const button = document.getElementById('copy-all-instagram');
                      const originalText = button.textContent;
                      button.textContent = 'Copied!';
                      setTimeout(() => {
                        button.textContent = originalText;
                      }, 2000);
                    }}
                    id="copy-all-instagram"
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Copy All
                  </button>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div><strong>Headline:</strong> {getAdsDataWithFallback('instagram').copy.headline}</div>
                  <div><strong>Primary Text:</strong> {getAdsDataWithFallback('instagram').copy.primaryText}</div>
                  <div><strong>Description:</strong> {getAdsDataWithFallback('instagram').copy.description}</div>
                  <div><strong>CTA:</strong> {getAdsDataWithFallback('instagram').copy.cta}</div>
                  <div><strong>Brand:</strong> {getAdsDataWithFallback('instagram').visual.brandName}</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">AI-Generated Target Audience</label>
              <button 
                onClick={generateTargetAudience} 
                disabled={isGeneratingAudience}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  isGeneratingAudience 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isGeneratingAudience ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    Generating...
                  </span>
                ) : (
                  '✨ Generate with AI'
                )}
              </button>
            </div>
            
            {aiTargetAudience.linkedin && (
              <div className="space-y-3">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <SiLinkedin className="w-4 h-4 text-blue-600" />
                      LinkedIn
                    </label>
                    <button
                      id="copy-linkedin"
                      onClick={() => copyTargetAudience('linkedin', aiTargetAudience)}
                      className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="text-sm text-gray-800 bg-white p-2 rounded border">
                    {aiTargetAudience.linkedin}
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <SiFacebook className="w-4 h-4 text-blue-600" />
                      Meta (Facebook)
                    </label>
                    <button
                      id="copy-meta"
                      onClick={() => copyTargetAudience('meta', aiTargetAudience)}
                      className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="text-sm text-gray-800 bg-white p-2 rounded border">
                    {aiTargetAudience.meta}
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <SiInstagram className="w-4 h-4 text-pink-500" />
                      Instagram
                    </label>
                    <button
                      id="copy-instagram"
                      onClick={() => copyTargetAudience('instagram', aiTargetAudience)}
                      className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="text-sm text-gray-800 bg-white p-2 rounded border">
                    {aiTargetAudience.instagram}
                  </div>
                </div>
              </div>
            )}

            {!aiTargetAudience.linkedin && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">Click "Generate with AI" to create optimized target audience descriptions for each platform.</p>
              </div>
            )}
            
          </div>
        </div>
      </Section>

      {/* Step 4 */}
      <Section title="Step 4 — Monitor Key Metrics 📊" stepKey="step4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Step4ManualInputs
              adSpendDollars={adSpendDollars}
              impressions={impressions}
              clicks={clicks}
              cpc={cpc}
              validationMsg={validationMsg}
              saveStep4Loading={saveStep4Loading}
              onSpendChange={handleAdSpendChange}
              onImpressionsChange={handleImpressionsChange}
              onClicksChange={handleClicksChange}
              onSave={saveStep4}
              spendRef={spendInputRef}
              impressionsRef={impressionsInputRef}
              clicksRef={clicksInputRef}
              onInputFocus={handleManualInputFocus}
              onInputBlur={handleManualInputBlur}
              containerRef={manualInputsContainerRef}
            />
            
            {/* Calculate Jetsy Validation Score Button */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button 
                onClick={() => {
                  console.log('Calculate button clicked!');
                  
                  // Ensure Step 5 is open and visible
                  setCollapsedSteps(prev => ({ ...prev, step5: false }));
                  
                  // Multiple fallback methods to find and scroll to Step 5
                  setTimeout(() => {
                    let step5Element = null;
                    
                    // Method 1: Try data-step attribute
                    step5Element = document.querySelector('[data-step="step5"]');
                    console.log('Method 1 - data-step:', step5Element);
                    
                    // Method 2: Try finding by title text
                    if (!step5Element) {
                      const step5ByTitle = Array.from(document.querySelectorAll('h3')).find(h3 => 
                        h3.textContent.includes('Jetsy Validation Score')
                      );
                      if (step5ByTitle) {
                        step5Element = step5ByTitle.closest('.bg-white');
                        console.log('Method 2 - by title:', step5Element);
                      }
                    }
                    
                    // Method 3: Try finding by section content
                    if (!step5Element) {
                      const allSections = document.querySelectorAll('.bg-white.rounded-lg');
                      step5Element = Array.from(allSections).find(section => 
                        section.textContent.includes('Jetsy Validation Score')
                      );
                      console.log('Method 3 - by content:', step5Element);
                    }
                    
                    if (step5Element) {
                      console.log('Step 5 found, scrolling...');
                      
                      // Scroll to the element
                      step5Element.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                      });
                      
                      // Add a dramatic entrance effect with CSS animation
                      step5Element.classList.add('step-entrance');
                      
                      // Remove the animation class after it completes to allow re-triggering
                      setTimeout(() => {
                        step5Element.classList.remove('step-entrance');
                      }, 800);
                      
                      // Also add a subtle highlight effect to the section
                      step5Element.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.3)';
                      setTimeout(() => {
                        step5Element.style.boxShadow = '';
                      }, 2000);
                    } else {
                      console.error('Step 5 element not found with any method!');
                      // Last resort: scroll to bottom of page
                      window.scrollTo({
                        top: document.body.scrollHeight,
                        behavior: 'smooth'
                      });
                    }
                  }, 100);
                }}
                className="w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-lg hover:scale-105 active:scale-95 button-pulse relative z-10"
              >
                🚀 Calculate the Jetsy Validation Score for my business idea
              </button>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-2">Data from Jetsy for your website</h4>
            

            
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 border border-gray-200 rounded p-3 text-center">
                <div className="text-xs text-gray-600">Visitors (custom)</div>
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
          <div className="relative rounded-2xl">
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
            </div>
          </div>

        </div>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Understanding Your Jetsy Validation Score</h4>
          
          {/* Score Range Explanations */}
          <div className="mb-4 p-3 bg-white rounded border border-blue-200">
            <h5 className="text-sm font-semibold text-blue-900 mb-2">What Your Score Means:</h5>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                <div><strong>70 and Above:</strong> Indicates strong validation. Your business idea demonstrates significant potential, with effective audience targeting, compelling messaging, and cost-efficient customer acquisition strategies.</div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                <div><strong>50 to 69:</strong> Suggests moderate validation. While there are positive indicators, certain areas may require refinement. Consider optimizing your marketing strategies, enhancing engagement tactics, or revisiting your pricing model to strengthen your business proposition.</div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                <div><strong>30 to 49:</strong> Reflects weak validation. Key components of your business idea may not be resonating with your target audience. It's advisable to conduct further market research, reassess your value proposition, and test alternative approaches to improve validation.</div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                <div><strong>Below 30:</strong> Indicates poor validation. Fundamental aspects of your business idea are not aligning with market demands. A comprehensive reevaluation of your target audience, messaging, pricing structure, or even the core business concept is recommended.</div>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-blue-800 leading-relaxed">
            The <strong>Jetsy Validation Score</strong> is a comprehensive metric that evaluates your business idea's market potential across three key dimensions. This score helps you determine whether to proceed with your current approach or pivot to a new strategy.
          </p>

          {/* Actual Calculation Data */}
          {score && (
            <div className="mt-4 p-3 bg-white rounded border border-blue-200">
              <h5 className="text-sm font-semibold text-blue-900 mb-2">Your Score Calculation:</h5>
              <div className="space-y-3 text-sm text-blue-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="font-semibold mb-2">Traffic Score (0-30 points):</div>
                    <div className="text-xs space-y-1">
                      <div>• Visitors: {metrics?.visitors || 0}</div>
                      <div>• Formula: min(1, {metrics?.visitors || 0} ÷ 100) × 30</div>
                      <div>• Result: {score?.breakdown?.traffic || 0} points</div>
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold mb-2">Engagement Score (0-40 points):</div>
                    <div className="text-xs space-y-1">
                      <div>• Pricing Clicks: {metrics?.pricingClicksTotal || 0}</div>
                      <div>• Engagement Rate: {metrics?.visitors ? ((metrics.pricingClicksTotal || 0) / metrics.visitors * 100).toFixed(2) : 0}%</div>
                      <div>• Formula: min(1, {metrics?.visitors ? ((metrics.pricingClicksTotal || 0) / metrics.visitors).toFixed(4) : 0} ÷ 0.08) × 40</div>
                      <div>• Result: {score?.breakdown?.engagement || 0} points</div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="font-semibold mb-2">Intent Score (0-30 points):</div>
                  <div className="text-xs space-y-1">
                    <div>• Leads: {metrics?.leads || 0}</div>
                    <div>• Lead Rate: {metrics?.visitors ? ((metrics.leads || 0) / metrics.visitors * 100).toFixed(2) : 0}%</div>
                    <div>• Base Formula: min(1, {metrics?.visitors ? ((metrics.leads || 0) / metrics.visitors).toFixed(4) : 0} ÷ 0.02) × 30</div>
                    <div>• Base Result: {score?.breakdown?.intent || 0} points</div>
                    {testRun?.clicks && testRun?.ad_spend_cents && (
                      <>
                        <div>• CPC: ${(testRun.ad_spend_cents / 100 / testRun.clicks).toFixed(2)}</div>
                        <div>• CPC Bonus: min(1, $2.00 ÷ ${(testRun.ad_spend_cents / 100 / testRun.clicks).toFixed(2)}) × 5</div>
                        <div>• CPC Bonus Points: {Math.min(1, 2.00 / (testRun.ad_spend_cents / 100 / testRun.clicks)) * 5} points</div>
                      </>
                    )}
                  </div>
                </div>
                <div className="pt-2 border-t border-blue-200">
                  <div className="font-semibold text-blue-900">
                    Total Score: {score?.total || 0} / 100
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </Section>

      {/* Step 6 */}
      <Section title="Step 6 — Next Actions 🔮" stepKey="step6">
        <div className="text-center">
          <p className="text-sm text-gray-700 mb-4 leading-relaxed">
            Validated your business idea with Jetsy? Book a free 15-minute consultation with Cole to build your website or app in just 1 week.
          </p>
          <a 
            href="https://calendly.com/colele208/15-minutes-meeting-with-cole-le" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            Book 15-min with Cole Le 🗓️
          </a>
        </div>
      </Section>

      {/* Workflow Panel */}
      {showWorkflowPanel && (
        <div className={`workflow-panel-container ${isMobile ? 'fixed inset-0 bg-black bg-opacity-50 z-50' : 'border-b border-gray-200 bg-gray-50'}`}>
          <div className={`${isMobile ? 'fixed bottom-0 left-0 right-0 bg-white rounded-t-lg shadow-xl max-h-[80vh] overflow-y-auto' : 'p-4'}`}>
            <div className="space-y-4">
              {/* Mobile Header */}
              {isMobile && (
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Project Details</h3>
                  <button
                    onClick={() => setShowWorkflowPanel(false)}
                    className="text-gray-400 hover:text-gray-600 p-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              
              <div className={`${isMobile ? 'p-4' : ''}`}>
                {/* Workflow Progress */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">{isMobile ? 'Launch your business 🚀' : 'Website Creation Progress'}</h3>
                  <div className="space-y-3">
                    {/* Step 1: Website Creation */}
                    <div className="flex items-center space-x-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                        websiteDeployed 
                          ? 'bg-blue-600 text-white shadow-md' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        <span className="text-lg">🌐</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          // Navigate back to website creation
                          handleNavigateToWebsiteCreation();
                        }}
                        className={`text-sm font-medium px-3 py-1 rounded-lg shadow-sm transition-colors border ${
                          websiteDeployed
                            ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                            : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'
                        }`}
                        aria-label="Go to Website creation"
                      >
                        Website creation
                      </button>
                    </div>
                    
                    {/* Step 2: Ads Creation */}
                    <div className="flex items-center space-x-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                        adsExist 
                          ? 'bg-blue-600 text-white shadow-md' 
                          : 'bg-blue-500 text-white shadow-md shadow-blue-300/50'
                        }`}>
                        <span className="text-lg">📢</span>
                      </div>
                      <button
                        onClick={() => {
                          console.log('Ads creation button clicked, navigating to project:', projectId);
                          // Close the workflow panel
                          setShowWorkflowPanel(false);
                          // Navigate to ads creative page
                          try {
                            if (typeof onNavigateToAdCreatives === 'function') {
                              onNavigateToAdCreatives(projectId);
                            } else {
                              // Fallback to direct URL navigation
                              window.location.href = `/ad-creatives/${projectId}`;
                            }
                          } catch (err) {
                            console.error('Failed to navigate via callback, falling back to URL navigation:', err);
                            try {
                              window.location.href = `/ad-creatives/${projectId}`;
                            } catch (_) {}
                          }
                        }}
                        className={`text-sm font-medium px-3 py-1 rounded-lg shadow-sm transition-colors border ${
                          adsExist
                            ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                            : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'
                        }`}
                        aria-label="Go to Ads creation"
                      >
                        Ads creation
                      </button>
                    </div>
                    
                    {/* Connector line between steps (hidden on mobile to avoid stray blue line) */}
                    <div className="flex justify-center">
                      <div className={`hidden w-0.5 h-6 transition-colors duration-200 ${
                        websiteDeployed && adsExist ? 'bg-blue-600' : 'bg-gray-200'
                      }`}></div>
                    </div>
                    
                    {/* Step 3: Launch and Monitor */}
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-md">
                        <span className="text-lg">🚀</span>
                      </div>
                      <span className="text-sm font-semibold px-3 py-1 rounded-lg border bg-blue-50 text-blue-700 border-blue-200">
                        Launch and monitor
                      </span>
                    </div>
                    
                  </div>
                </div>
                
                {/* Data Analytics Button */}
                <button
                  onClick={() => {
                    // Navigate to data analytics page
                    try {
                      const pid = localStorage.getItem('jetsy_current_project_id') || '1';
                      window.location.href = `/data_analytics/project_${pid}`;
                    } catch (_) {
                      window.location.href = `/data_analytics/project_1`;
                    }
                  }}
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 inline-flex items-center gap-2 justify-center mt-4"
                >
                  <span>Data Analytics</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-gray-500">
                    <path d="M5 3a1 1 0 0 1 1 1v14h12a1 1 0 1 1 0 2H5a2 2 0 0 1-2-2V4a1 1 0 0 1 1-1h1Zm4.5 5a1 1 0 0 1 1 1v7h-2v-7a1 1 0 0 1 1-1Zm4 -2a1 1 0 0 1 1 1v9h-2V7a1 1 0 0 1 1-1Zm4 4a1 1 0 0 1 1 1v5h-2v-5a1 1 0 0 1 1-1Z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LaunchMonitorPage;


