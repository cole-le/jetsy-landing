# Changelog

All notable changes to the Jetsy landing page project will be documented in this file.

## [2.0.0] - 2024-01-XX - Light Theme Redesign

### 🎨 Design Changes
- **Complete theme overhaul**: Transitioned from dark theme to light theme inspired by Lovable.dev
- **New color palette**: 
  - Background: `#F9F9F9` (light gray)
  - Accent: `#111827` (dark gray)
  - Button Primary: `#111827`
  - Button Hover: `#000000`
  - Text: `#111827`
  - Muted Text: `#6B7280`
- **Radial gradient background**: Soft white to light gray gradient
- **Updated typography**: Cleaner Inter font implementation
- **Enhanced shadows and borders**: Subtle shadows for depth

### 🚀 New Features
- **Floating Chat Box**: Cursor-style floating chat interface on hero section
- **Enhanced UX Flow**: Complete user journey from idea to onboarding
- **Onboarding Form**: New section for collecting detailed idea information
- **Success State**: Improved completion flow with next steps
- **Rotating Placeholders**: Chat input placeholders rotate every 3 seconds

### 📊 Updated Pricing Structure
- **Free Plan ($0/month)**: Launch to Cloudflare subdomain, limited templates
- **Pro Plan ($15/month)**: Custom domain, click metrics, fake checkout
- **Business Plan ($29/month)**: Advanced validation, heatmaps, form tracking

### 🗄️ Database Enhancements
- **New onboarding_data table**: Store audience and validation goals
- **Enhanced schema**: Better data structure for user information
- **Improved tracking**: More comprehensive event tracking

### 🔧 Technical Improvements
- **Updated Tailwind config**: New design tokens and animations
- **Enhanced CSS**: Better component styling and animations
- **Improved form validation**: Client-side validation with error handling
- **Better responsive design**: Mobile-first approach with smooth scaling

### 📱 Component Updates
- **HeroSection**: Updated with new headline and subheadline
- **ChatInputWithToggle**: Enhanced with rotating placeholders
- **PricingModal**: Updated pricing and features
- **LeadCaptureForm**: Improved validation and styling
- **OnboardingForm**: New component for detailed information collection
- **FloatingChatBox**: New cursor-style chat interface

### 🚀 Deployment & Setup
- **Enhanced deployment script**: More robust deployment with error handling
- **Updated setup guide**: Comprehensive setup instructions
- **Better documentation**: Detailed README and setup guides

### 📈 Analytics
- **Enhanced event tracking**: More comprehensive user interaction tracking
- **New events**: Floating chat interactions, onboarding completions
- **Better GTM integration**: Improved Google Tag Manager setup

## [1.0.0] - 2024-01-XX - Initial Release

### 🎨 Design
- **Dark theme**: Gradient background with modern typography
- **Lovable.dev inspired**: Clean, product-led design
- **Mobile responsive**: Mobile-first approach

### 🚀 Features
- **Hero section**: Startup idea input with visibility toggle
- **Pricing modal**: Three-tier pricing system
- **Lead capture**: Email and phone collection
- **Analytics integration**: Google Tag Manager tracking

### 🗄️ Database
- **D1 integration**: Cloudflare D1 database
- **Basic schema**: Leads, ideas, plan selections, tracking events

### 🔧 Technical
- **React 18**: Modern React with hooks
- **Tailwind CSS**: Utility-first styling
- **Vite**: Fast build tool
- **Cloudflare Workers**: Serverless backend

---

## Migration Guide

### From v1.0.0 to v2.0.0

1. **Update dependencies**:
   ```bash
   npm install
   ```

2. **Apply database migrations**:
   ```bash
   wrangler d1 execute jetsy-leads --file=schema.sql
   ```

3. **Update configuration**:
   - Review `tailwind.config.js` for new design tokens
   - Update `wrangler.toml` if needed
   - Verify GTM configuration

4. **Test the application**:
   ```bash
   npm run dev
   npm run build
   ```

5. **Deploy**:
   ```bash
   ./deploy.sh
   ```

### Breaking Changes

- **Theme**: Complete visual overhaul from dark to light theme
- **Pricing**: Updated pricing structure and features
- **Database**: New onboarding_data table added
- **Components**: New FloatingChatBox and OnboardingForm components

### Deprecated Features

- Dark theme styling (replaced with light theme)
- Old pricing structure (updated with new tiers)
- Basic lead capture (enhanced with onboarding flow)

---

## Future Roadmap

### Planned Features
- **A/B Testing**: Built-in A/B testing capabilities
- **Advanced Analytics**: Heatmaps and user behavior tracking
- **Team Collaboration**: Multi-user support
- **API Integration**: Third-party integrations
- **Custom Templates**: User-defined landing page templates

### Technical Improvements
- **Performance**: Further optimization and caching
- **Security**: Enhanced security measures
- **Scalability**: Improved database performance
- **Monitoring**: Better error tracking and monitoring

---

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 