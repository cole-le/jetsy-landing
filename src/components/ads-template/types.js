/**
 * @typedef {Object} AdCopy
 * @property {string} primaryText - LinkedIn Intro / Meta Primary
 * @property {string} [headline] - LinkedIn Headline / Meta Headline (optional)
 * @property {string} [description] - LinkedIn LAN-only / Meta description (optional)
 * @property {string} [cta] - Call to action button text
 */

/**
 * @typedef {Object} AdVisual
 * @property {string} imageUrl - Single image ad URL
 * @property {string} logoUrl - Company/page avatar URL
 * @property {string} brandName - Company/page name
 * @property {boolean} [verified] - Whether the brand is verified (LinkedIn)
 */

/**
 * @typedef {Object} AdTemplate
 * @property {AdCopy} copy - Ad copy content
 * @property {AdVisual} visual - Visual elements
 */

/**
 * @typedef {'1:1' | '1200×628'} LinkedInAspectRatio
 */

/**
 * @typedef {'1080×1350' | '1080×1080'} MetaAspectRatio
 */

// Export for JSDoc usage
export {};
