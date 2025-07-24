# Jetsy - AI-Powered Startup Idea Validation Platform

Jetsy auto-generates landing pages and ad tests to measure real interest — before you write a single line of code.

## 🚀 Features

- **AI-Powered Landing Page Generation**: Describe your startup idea and get a professional landing page
- **Real User Testing**: Track actual user behavior and interest metrics
- **Multiple Visibility Options**: Public or private projects
- **Three Pricing Tiers**: Free ($0), Pro ($15/month), and Business ($29/month)
- **Complete Funnel Tracking**: From idea submission to onboarding completion
- **Floating Chat Interface**: Cursor-style chat box for easy idea input
- **Cloudflare Integration**: Built on Cloudflare Workers, D1, and Pages

## 🛠️ Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS (Light theme inspired by Lovable)
- **Backend**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Deployment**: Cloudflare Pages
- **Analytics**: Google Tag Manager

## 🎨 Design System

### Visual Design
- **Light theme** with soft radial gradient background
- **Inter font** for modern typography
- **Lovable.dev inspired** clean, product-led design
- **Mobile-responsive** layout with smooth scaling
- **Floating chat box** with cursor-style interface

### Color Palette
- Background: `#F9F9F9`
- Accent: `#111827`
- Button Primary: `#111827`
- Button Hover: `#000000`
- Text: `#111827`
- Muted Text: `#6B7280`

## 📦 Installation & Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Cloudflare account
- Wrangler CLI

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Cloudflare D1 Database

```bash
# Create D1 database
npm run db:create

# Apply database schema
npm run db:migrate
```

### 3. Configure Environment

Update `wrangler.toml` with your database IDs:

```toml
[[d1_databases]]
binding = "DB"
database_name = "jetsy-leads"
database_id = "your-actual-database-id"
```

### 4. Add Jetsy Logo

Place your `jetsy_logo3.png` file in the `public/` directory.

### 5. Configure Google Tag Manager

Update the GTM ID in `index.html`:

```html
<!-- Replace GTM-XXXXXXX with your actual GTM ID -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
```

## 🚀 Development

### Local Development

```bash
# Start development server
npm run dev

# Start worker development server
npm run dev:worker

# Build for production
npm run build

# Preview production build
npm run preview
```

### Database Operations

```bash
# Query database
npm run db:query

# Apply migrations
npm run db:migrate
```

## 📊 Database Schema

The application uses the following tables:

- **leads**: Store email and phone information
- **ideas**: Store startup idea descriptions
- **plan_selections**: Track which plans users selected
- **onboarding_data**: Store audience and validation goals
- **funnel_completions**: Track successful conversions
- **tracking_events**: Store user interaction data

## 🎯 User Flow

### 1. Hero Section
- **Headline**: "Find out if anyone wants your startup idea — before you build it"
- **Subheadline**: "Jetsy auto-generates landing pages and ad tests to measure real interest."
- **Chat Input**: With rotating placeholders and visibility toggle
- **Primary CTA**: "Start Validating Idea"

### 2. Pricing Modal
- **Free Plan ($0/month)**: Launch to Cloudflare subdomain, limited templates
- **Pro Plan ($15/month)**: Custom domain, click metrics, fake checkout
- **Business Plan ($29/month)**: Advanced validation, heatmaps, form tracking

### 3. Lead Capture
- Email and phone number collection
- Form validation and error handling

### 4. Onboarding Form
- Idea title and description
- Target audience definition
- Validation goal selection

### 5. Success State
- Confirmation with next steps
- Option to start another test

## 📈 Analytics Events

The application tracks the following events:

- `page_view`: Page views
- `idea_submit`: Startup idea submissions
- `visibility_toggle`: Public/private selection
- `pricing_plan_select`: Plan selections
- `lead_form_submit`: Lead form submissions
- `onboarding_form_submit`: Onboarding form submissions
- `floating_chat_expand`: Chat box interactions
- `floating_chat_submit`: Chat box submissions

## 🚀 Deployment

### Cloudflare Pages

1. Connect your repository to Cloudflare Pages
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Configure environment variables for D1 database

### Cloudflare Workers

1. Deploy worker with `wrangler deploy`
2. Configure D1 database binding
3. Set up custom domain (optional)

### Environment Variables

```bash
# Required
DB_DATABASE_ID=your-database-id
DB_DATABASE_NAME=jetsy-leads

# Optional
GTM_ID=GTM-XXXXXXX
```

## 🔧 Customization

### Styling
- Modify `src/index.css` for global styles
- Update `tailwind.config.js` for design system changes
- Component-specific styles in individual component files

### Functionality
- Add new API endpoints in `src/worker.js`
- Extend database schema in `schema.sql`
- Modify components in `src/components/`

### Pricing Plans
- Update plan details in `src/components/PricingModal.jsx`
- Modify features and pricing in the plans array
- Add new plan types as needed

## 📱 Components

### Core Components
- **HeroSection**: Main landing page with chat input
- **ChatInputWithToggle**: Idea input with visibility toggle
- **FloatingChatBox**: Cursor-style floating chat interface
- **PricingModal**: Plan selection modal
- **LeadCaptureForm**: Email and phone capture
- **OnboardingForm**: Detailed idea information collection

### Features
- **Rotating Placeholders**: Chat input placeholders rotate every 3 seconds
- **Visibility Control**: Public/private project toggle
- **Form Validation**: Client-side validation with error handling
- **Analytics Integration**: Comprehensive event tracking
- **Responsive Design**: Mobile-first approach

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support, email support@jetsy.com or create an issue in this repository.

---

Built with ❤️ by the Jetsy team 