import React, { useEffect, useState } from 'react';
import ExceptionalTemplate from './ExceptionalTemplate';
import { DEFAULT_TEMPLATE_DATA } from './TemplateBasedChat';
import { getApiBaseUrl } from '../config/environment';

const PublicRouteView = ({ userId, projectId }) => {
  const [templateData, setTemplateData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProject = async () => {
      try {
        setIsLoading(true);
        // For public project routes, we can fetch by project ID directly
        const res = await fetch(`${getApiBaseUrl()}/api/projects/${projectId}`);
        if (!res.ok) {
          throw new Error('Project not found');
        }
        const result = await res.json();
        const project = result.project;
        let data = null;
        if (project && project.template_data) {
          try {
            data = typeof project.template_data === 'string' 
              ? JSON.parse(project.template_data) 
              : project.template_data;
          } catch (e) {
            data = null;
          }
        }
        setTemplateData({ ...DEFAULT_TEMPLATE_DATA, ...(data || {}) });
        setError(null);
      } catch (e) {
        setError(e.message || 'Failed to load');
      } finally {
        setIsLoading(false);
      }
    };
    if (projectId) loadProject();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
          <div className="text-gray-600">Loading website...</div>
        </div>
      </div>
    );
  }

  if (error || !templateData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-red-600">{error || 'No website available'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <ExceptionalTemplate
        businessName={templateData.businessName || ''}
        seoTitle={templateData.seoTitle || null}
        businessLogoUrl={templateData.businessLogoUrl || null}
        tagline={templateData.tagline || ''}
        isLiveWebsite={true}
        heroDescription={templateData.heroDescription || ''}
        ctaButtonText={templateData.ctaButtonText || ''}
        sectionType={templateData.sectionType || 'features'}
        sectionTitle={templateData.sectionTitle || ''}
        sectionSubtitle={templateData.sectionSubtitle || ''}
        features={templateData.features || []}
        aboutContent={templateData.aboutContent || ''}
        pricing={templateData.pricing || []}
        contactInfo={templateData.contactInfo || {}}
        trustIndicator1={templateData.trustIndicator1 || ''}
        trustIndicator2={'4.8/5 customer satisfaction rating'}
        heroBadge={templateData.heroBadge || ''}
        aboutSectionTitle={templateData.aboutSectionTitle || ''}
        aboutSectionSubtitle={templateData.aboutSectionSubtitle || ''}
        aboutBenefits={templateData.aboutBenefits || []}
        pricingSectionTitle={templateData.pricingSectionTitle || ''}
        pricingSectionSubtitle={templateData.pricingSectionSubtitle || ''}
        contactSectionTitle={templateData.contactSectionTitle || ''}
        contactSectionSubtitle={templateData.contactSectionSubtitle || ''}
        contactFormPlaceholders={templateData.contactFormPlaceholders || {}}
        footerDescription={templateData.footerDescription || ''}
        footerProductLinks={templateData.footerProductLinks || []}
        footerCompanyLinks={templateData.footerCompanyLinks || []}
        landingPagesCreated={templateData.landingPagesCreated || ''}
        heroBackgroundImage={templateData.heroBackgroundImage || null}
        aboutBackgroundImage={templateData.aboutBackgroundImage || null}
        showLeadPhoneField={templateData.showLeadPhoneField}
        projectId={projectId}
        showHeroSection={templateData.showHeroSection}
        showHeroBadge={templateData.showHeroBadge}
        showHeroCTA={templateData.showHeroCTA}
        showHeroSocialProof={templateData.showHeroSocialProof}
        showDynamicSection={templateData.showDynamicSection}
        showSectionTitle={templateData.showSectionTitle}
        showSectionSubtitle={templateData.showSectionSubtitle}
        showAboutSection={templateData.showAboutSection}
        showAboutTitle={templateData.showAboutTitle}
        showAboutSubtitle={templateData.showAboutSubtitle}
        showAboutBenefits={templateData.showAboutBenefits}
        showPricingSection={templateData.showPricingSection}
        showPricingTitle={templateData.showPricingTitle}
        showPricingSubtitle={templateData.showPricingSubtitle}
        showContactSection={templateData.showContactSection}
        showContactTitle={templateData.showContactTitle}
        showContactSubtitle={templateData.showContactSubtitle}
        showContactInfoList={templateData.showContactInfoList}
        showContactForm={templateData.showContactForm}
        showFooter={templateData.showFooter}
      />
    </div>
  );
};

export default PublicRouteView;


