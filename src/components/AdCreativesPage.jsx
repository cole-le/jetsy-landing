import React, { useState, useEffect } from 'react';
import { getApiBaseUrl } from '../config/environment';
import WorkflowProgressBar from './WorkflowProgressBar';

const AdCreativesPage = ({ projectId, onNavigateToChat }) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adData, setAdData] = useState({
    businessName: '',
    businessDescription: '',
    targetAudience: '',
    mainHeadline: '',
    punchline: '',
    callToAction: '',
    selectedSize: 'square' // square, landscape, portrait
  });
  const [generatedAds, setGeneratedAds] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Creative sizes configuration
  const creativeSizes = {
    square: { name: 'Square', dimensions: '1080x1080', width: 1080, height: 1080 },
    landscape: { name: 'Landscape', dimensions: '1200x628', width: 1200, height: 628 },
    portrait: { name: 'Portrait', dimensions: '1080x1350', width: 1080, height: 1350 }
  };

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getApiBaseUrl()}/api/projects/${projectId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load project data');
      }

      const result = await response.json();
      const projectData = result.project;
      
      setProject(projectData);
      
      // Check if we have business information in the database
      if (projectData.business_name && projectData.business_description && projectData.target_audience) {
        // Use database values
        setAdData(prev => ({
          ...prev,
          businessName: projectData.business_name,
          businessDescription: projectData.business_description,
          targetAudience: projectData.target_audience
        }));
      } else {
        // Try to extract from template data as fallback
        const templateData = projectData.template_data ? JSON.parse(projectData.template_data) : {};
        
        setAdData(prev => ({
          ...prev,
          businessName: templateData.businessName || templateData.companyName || projectData.project_name || '',
          businessDescription: templateData.businessDescription || templateData.description || '',
          targetAudience: templateData.targetAudience || templateData.targetMarket || ''
        }));

        // Auto-fill business information using AI if fields are empty
        if (!projectData.business_name || !projectData.business_description || !projectData.target_audience) {
          await autoFillBusinessInfo();
        }
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const autoFillBusinessInfo = async () => {
    try {
      setIsGenerating(true);
      
      const response = await fetch(`${getApiBaseUrl()}/api/auto-fill-business-info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.businessInfo) {
          setAdData(prev => ({
            ...prev,
            businessName: result.businessInfo.businessName || '',
            businessDescription: result.businessInfo.businessDescription || '',
            targetAudience: result.businessInfo.targetAudience || ''
          }));
        }
      }
    } catch (error) {
      console.error('Error auto-filling business info:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveBusinessInfo = async () => {
    try {
      setIsGenerating(true);
      
      const response = await fetch(`${getApiBaseUrl()}/api/save-business-info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          businessName: adData.businessName,
          businessDescription: adData.businessDescription,
          targetAudience: adData.targetAudience
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('Business information saved successfully!');
        }
      } else {
        throw new Error('Failed to save business information');
      }
    } catch (error) {
      console.error('Error saving business info:', error);
      alert('Failed to save business information. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNavigateToWebsiteCreation = () => {
    onNavigateToChat(projectId);
  };

  const handleInputChange = (field, value) => {
    setAdData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateAdCopy = async () => {
    try {
      setIsGenerating(true);
      
      // Use AI to generate ad copy based on business data
      const response = await fetch(`${getApiBaseUrl()}/api/generate-ad-copy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: adData.businessName,
          businessDescription: adData.businessDescription,
          targetAudience: adData.targetAudience,
          projectId: projectId
        })
      });

      if (response.ok) {
        const result = await response.json();
        setAdData(prev => ({
          ...prev,
          mainHeadline: result.mainHeadline || '',
          punchline: result.punchline || '',
          callToAction: result.callToAction || ''
        }));
      }
    } catch (err) {
      console.error('Error generating ad copy:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAds = async () => {
    if (!adData.businessName || !adData.mainHeadline || !adData.punchline || !adData.callToAction) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setIsGenerating(true);
      
      const response = await fetch(`${getApiBaseUrl()}/api/generate-ads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: projectId,
          adData: adData,
          size: creativeSizes[adData.selectedSize]
        })
      });

      if (response.ok) {
        const result = await response.json();
        setGeneratedAds(result.ads || []);
      } else {
        throw new Error('Failed to generate ads');
      }
    } catch (err) {
      console.error('Error generating ads:', err);
      alert('Failed to generate ads. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Project</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Jetsy branding and workflow progress */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <img 
              src="/jetsy_logo2.png" 
              alt="Jetsy" 
              className="h-8 w-auto"
            />
            <div className="text-sm text-gray-600">
              <span className="font-medium">{project?.project_name}</span>
            </div>
          </div>
          
          {/* Workflow Progress Bar */}
          <WorkflowProgressBar 
            currentStage={2} 
            onStageClick={(stageId) => {
              if (stageId === 1) {
                handleNavigateToWebsiteCreation();
              }
            }}
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI-Powered Ads Creation</h1>
          <p className="text-gray-600">Generate high-converting ad creatives for your business</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="space-y-6">
            {/* Business Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Business Information</h2>
                <button
                  onClick={autoFillBusinessInfo}
                  disabled={isGenerating}
                  className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isGenerating ? 'Filling...' : 'Auto-fill with AI'}
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    value={adData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your business name"
                    maxLength={50}
                  />
                  <div className="text-xs text-gray-500 text-right mt-1">
                    {adData.businessName.length}/50 characters
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Description *
                  </label>
                  <textarea
                    value={adData.businessDescription}
                    onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe what your business does"
                    maxLength={200}
                  />
                  <div className="text-xs text-gray-500 text-right mt-1">
                    {adData.businessDescription.length}/200 characters
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Audience *
                  </label>
                  <input
                    type="text"
                    value={adData.targetAudience}
                    onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Who is your target audience?"
                    maxLength={100}
                  />
                  <div className="text-xs text-gray-500 text-right mt-1">
                    {adData.targetAudience.length}/100 characters
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={saveBusinessInfo}
                    disabled={isGenerating || !adData.businessName || !adData.businessDescription || !adData.targetAudience}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    {isGenerating ? 'Saving...' : 'Save Business Info'}
                  </button>
                </div>
              </div>
            </div>

            {/* Ad Copy Generation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Ad Copy</h2>
                <button
                  onClick={generateAdCopy}
                  disabled={isGenerating || !adData.businessName || !adData.businessDescription}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isGenerating ? 'Generating...' : 'Generate with AI'}
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Main Headline * <span className="text-xs text-gray-500">(40 chars max)</span>
                  </label>
                  <input
                    type="text"
                    value={adData.mainHeadline}
                    onChange={(e) => handleInputChange('mainHeadline', e.target.value.slice(0, 40))}
                    maxLength={40}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Want to start a business?"
                  />
                  <div className="text-xs text-gray-500 mt-1">{adData.mainHeadline.length}/40 characters</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Punchline * <span className="text-xs text-gray-500">(40 chars max)</span>
                  </label>
                  <input
                    type="text"
                    value={adData.punchline}
                    onChange={(e) => handleInputChange('punchline', e.target.value.slice(0, 40))}
                    maxLength={40}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Will people pay money for it?"
                  />
                  <div className="text-xs text-gray-500 mt-1">{adData.punchline.length}/40 characters</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Call to Action * <span className="text-xs text-gray-500">(25 chars max)</span>
                  </label>
                  <input
                    type="text"
                    value={adData.callToAction}
                    onChange={(e) => handleInputChange('callToAction', e.target.value.slice(0, 25))}
                    maxLength={25}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Find out with Jetsy"
                  />
                  <div className="text-xs text-gray-500 mt-1">{adData.callToAction.length}/25 characters</div>
                </div>
              </div>
            </div>

            {/* Creative Size Selection */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Creative Size</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Object.entries(creativeSizes).map(([key, size]) => (
                  <button
                    key={key}
                    onClick={() => handleInputChange('selectedSize', key)}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      adData.selectedSize === key
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{size.name}</div>
                    <div className="text-sm text-gray-500">{size.dimensions}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateAds}
              disabled={isGenerating || !adData.businessName || !adData.mainHeadline || !adData.punchline || !adData.callToAction}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isGenerating ? 'Generating Ads...' : 'Generate Ad Creatives'}
            </button>
          </div>

          {/* Right Column - Preview & Results */}
          <div className="space-y-6">
            {/* Preview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Preview</h2>
              
              {adData.mainHeadline || adData.punchline || adData.callToAction ? (
                <div className="bg-gray-100 rounded-lg p-6 text-center">
                  <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg p-8 text-white relative overflow-hidden">
                    <div className="relative z-10">
                      {adData.mainHeadline && (
                        <h3 className="text-xl font-bold mb-2">{adData.mainHeadline}</h3>
                      )}
                      {adData.punchline && (
                        <p className="text-lg mb-4">{adData.punchline}</p>
                      )}
                      {adData.callToAction && (
                        <button className="bg-white text-purple-600 px-6 py-2 rounded-full font-semibold">
                          {adData.callToAction}
                        </button>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Size: {creativeSizes[adData.selectedSize].dimensions}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-500">
                  Fill in the ad copy to see preview
                </div>
              )}
            </div>

            {/* Generated Ads Results */}
            {generatedAds.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Generated Ads</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {generatedAds.map((ad, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                      <img 
                        src={ad.imageUrl} 
                        alt={`Generated Ad ${index + 1}`}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Conversion Score: {ad.conversionScore}/100</span>
                          <button
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = ad.downloadUrl;
                              link.download = `ad-creative-${index + 1}.png`;
                              link.click();
                            }}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdCreativesPage;
