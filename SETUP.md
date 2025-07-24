# Jetsy Setup Guide - Light Theme Edition

This guide will help you set up and deploy the Jetsy landing page with the new light theme design.

## 🚀 Quick Start

### 1. Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm or yarn** - Comes with Node.js
- **Cloudflare account** - [Sign up here](https://dash.cloudflare.com/sign-up)
- **Git** - [Download here](https://git-scm.com/)

### 2. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd jetsy

# Install dependencies
npm install
```

### 3. Development Setup

```bash
# Start development server
npm run dev

# In another terminal, start worker development
npm run dev:worker
```

Visit `http://localhost:5173` to see your application.

## 🎨 Design Customization

### Colors and Theme

The application uses a light theme inspired by Lovable.dev. You can customize the design system in:

- **`tailwind.config.js`** - Main design tokens
- **`src/index.css`** - Global styles and component classes
- **Individual components** - Component-specific styling

### Key Design Elements

```css
/* Color Palette */
--background: #F9F9F9
--accent: #111827
--button-primary: #111827
--button-hover: #000000
--text: #111827
--muted-text: #6B7280
```

### Typography

- **Font**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700, 800
- **Responsive**: Mobile-first design

## 🗄️ Database Setup

### 1. Create D1 Database

```bash
# Create the database
wrangler d1 create jetsy-leads

# Note the database ID from the output
```

### 2. Update Configuration

Update `wrangler.toml` with your database ID:

```toml
[[d1_databases]]
binding = "DB"
database_name = "jetsy-leads"
database_id = "your-actual-database-id"
```

### 3. Apply Schema

```bash
# Apply the database schema
wrangler d1 execute jetsy-leads --file=schema.sql
```

### 4. Verify Setup

```bash
# Query the database to verify
wrangler d1 execute jetsy-leads --command="SELECT name FROM sqlite_master WHERE type='table';"
```

## 📊 Analytics Setup

### 1. Google Tag Manager

1. Create a GTM account at [tagmanager.google.com](https://tagmanager.google.com/)
2. Create a new container for your website
3. Get your GTM ID (format: GTM-XXXXXXX)

### 2. Update GTM ID

Replace `GTM-XXXXXXX` in `index.html` with your actual GTM ID:

```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
<!-- End Google Tag Manager -->
```

### 3. Configure Events

The application automatically tracks these events:

- `page_view` - Page views
- `idea_submit` - Startup idea submissions
- `visibility_toggle` - Public/private selection
- `pricing_plan_select` - Plan selections
- `lead_form_submit` - Lead form submissions
- `onboarding_form_submit` - Onboarding form submissions
- `floating_chat_expand` - Chat box interactions
- `floating_chat_submit` - Chat box submissions

## 🖼️ Assets Setup

### 1. Logo

Place your Jetsy logo in the `public/` directory:

```bash
# Add your logo
cp path/to/your/logo.png public/jetsy_logo3.png
```

### 2. Favicon

Update the favicon in `index.html`:

```html
<link rel="icon" type="image/png" href="/public/jetsy_logo3.png">
```

## 🚀 Deployment

### Option 1: Automated Deployment

Use the deployment script:

```bash
# Full deployment
./deploy.sh

# Or specific commands
./deploy.sh build    # Build only
./deploy.sh deploy   # Deploy to Workers
./deploy.sh pages    # Deploy to Pages
./deploy.sh db       # Setup database
```

### Option 2: Manual Deployment

#### Deploy to Cloudflare Workers

```bash
# Build the application
npm run build

# Deploy the worker
wrangler deploy
```

#### Deploy to Cloudflare Pages

```bash
# Build the application
npm run build

# Deploy to Pages
wrangler pages deploy dist --project-name jetsy-landing
```

### Option 3: GitHub Integration

1. Push your code to GitHub
2. Connect your repository to Cloudflare Pages
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Configure environment variables

## 🔧 Configuration

### Environment Variables

Create a `.env` file (or use Cloudflare's environment variables):

```bash
# Database
DB_DATABASE_ID=your-database-id
DB_DATABASE_NAME=jetsy-leads

# Analytics
GTM_ID=GTM-XXXXXXX

# Optional: Custom domain
CUSTOM_DOMAIN=yourdomain.com
```

### Wrangler Configuration

Update `wrangler.toml` for your specific setup:

```toml
name = "jetsy-landing"
main = "src/worker.js"
compatibility_date = "2024-01-01"

[env.production]
name = "jetsy-landing-prod"

[env.staging]
name = "jetsy-landing-staging"

[[d1_databases]]
binding = "DB"
database_name = "jetsy-leads"
database_id = "your-database-id"
```

## 🧪 Testing

### 1. Build Test

```bash
npm run build
```

### 2. Development Test

```bash
# Start dev server
npm run dev

# Test the application flow:
# 1. Enter a startup idea
# 2. Select visibility (public/private)
# 3. Choose a pricing plan
# 4. Fill out lead form
# 5. Complete onboarding
```

### 3. API Test

Test the API endpoints:

```bash
# Test lead submission
curl -X POST http://localhost:8787/api/leads \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","phone":"+1234567890","startupIdea":"Test idea"}'

# Test onboarding submission
curl -X POST http://localhost:8787/api/onboarding \
  -H "Content-Type: application/json" \
  -d '{"ideaTitle":"Test Idea","description":"Test description","audience":"Test audience","validationGoal":"Validate market demand"}'
```

## 📱 User Flow Testing

### Complete Flow Test

1. **Hero Section**
   - Verify headline and subheadline display correctly
   - Test chat input with rotating placeholders
   - Test visibility toggle (public/private)
   - Test "Start Validating Idea" button

2. **Pricing Modal**
   - Verify all three plans display correctly
   - Test plan selection
   - Verify pricing and features are accurate

3. **Lead Capture**
   - Test email validation
   - Test phone validation
   - Verify form submission

4. **Onboarding Form**
   - Test all required fields
   - Verify validation goals dropdown
   - Test form submission

5. **Success State**
   - Verify success message displays
   - Test "Start Another Test" functionality

### Mobile Testing

Test on various screen sizes:
- iPhone (375px)
- iPad (768px)
- Desktop (1024px+)

## 🔍 Troubleshooting

### Common Issues

#### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

#### Database Issues

```bash
# Check database connection
wrangler d1 execute jetsy-leads --command="SELECT 1;"

# Reset database (WARNING: This will delete all data)
wrangler d1 execute jetsy-leads --file=schema.sql
```

#### Deployment Issues

```bash
# Check wrangler configuration
wrangler whoami

# Check database binding
wrangler d1 list
```

### Debug Mode

Enable debug logging:

```bash
# Set debug environment variable
export DEBUG=wrangler:*

# Run with debug
wrangler dev --debug
```

## 📈 Monitoring

### Analytics Dashboard

1. Open Google Tag Manager
2. Go to Preview mode
3. Test your website
4. Verify events are firing correctly

### Database Monitoring

```bash
# Check recent leads
wrangler d1 execute jetsy-leads --command="SELECT * FROM leads ORDER BY created_at DESC LIMIT 10;"

# Check funnel completions
wrangler d1 execute jetsy-leads --command="SELECT * FROM funnel_completions ORDER BY completed_at DESC LIMIT 10;"
```

## 🔄 Updates and Maintenance

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Update to latest versions (use with caution)
npm install package@latest
```

### Database Migrations

When adding new features:

1. Update `schema.sql`
2. Apply migration:
   ```bash
   wrangler d1 execute jetsy-leads --file=schema.sql
   ```

### Backup Database

```bash
# Export database
wrangler d1 execute jetsy-leads --command=".dump" > backup.sql

# Import database
wrangler d1 execute jetsy-leads --file=backup.sql
```

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the logs in Cloudflare dashboard
3. Test with a minimal setup
4. Create an issue in the repository

## 🎉 Success!

Your Jetsy landing page is now ready! The application features:

- ✅ Light theme design inspired by Lovable
- ✅ Complete user flow from idea to onboarding
- ✅ Floating chat interface
- ✅ Three-tier pricing system
- ✅ Comprehensive analytics tracking
- ✅ Mobile-responsive design
- ✅ Cloudflare integration

Happy validating! 🚀 