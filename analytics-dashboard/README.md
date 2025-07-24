# Jetsy Analytics Dashboard

A comprehensive analytics dashboard for tracking user interactions and conversion metrics on the Jetsy landing page.

## 🚀 Features

### 📊 Overview Dashboard
- **Key Metrics**: Total leads, events, priority access attempts, conversion rates
- **Daily Activity Chart**: 7-day trend of leads and events
- **Event Breakdown**: Pie chart showing distribution of tracked events

### 🔄 Funnel Analysis
- **Conversion Funnel**: Visual representation of user journey
- **Step-by-step Metrics**: Conversion rates and drop-off analysis
- **Performance Insights**: Identify bottlenecks in the user flow

### 📈 Event Tracking
- **Real-time Event Logs**: Detailed tracking of all user interactions
- **Event Filtering**: Filter by event type for focused analysis
- **Event Data**: View JSON payloads and metadata for each event

### 💰 Priority Access Metrics
- **Attempt Tracking**: Monitor priority access purchase attempts
- **Time-based Analysis**: Daily and weekly attempt statistics
- **User Details**: Email and phone numbers of users who attempted priority access

### ⚡ Real-time Metrics
- **Live Activity**: 24-hour rolling metrics
- **Auto-refresh**: Configurable real-time updates
- **System Status**: Monitor database and API health

## 🛠️ Tech Stack

- **Frontend**: React 18 with Vite
- **Charts**: Recharts for data visualization
- **Styling**: Tailwind CSS
- **Backend**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Date Handling**: date-fns

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+
- Cloudflare account with D1 database
- Wrangler CLI

### Step 1: Clear Database (One-time only)
If you want to start fresh, run this once:
```bash
chmod +x clear-database-once.sh
./clear-database-once.sh
```

### Step 2: Deploy API Worker
```bash
cd analytics-dashboard

# Update your database ID in wrangler.toml
# Replace "your-database-id-here" with your actual D1 database ID

# Deploy the API worker
wrangler deploy
```

### Step 3: Run Dashboard Locally
```bash
# Install dependencies
npm install

# Start the local development server
npm run dev
```

The dashboard will be available at: **http://localhost:3001**

## 🔧 Configuration

### Update Database Connection
Edit `analytics-dashboard/wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "jetsy-leads"
database_id = "your-actual-database-id"
```

### Update API Proxy (if needed)
If your worker URL is different, update `analytics-dashboard/vite.config.js`:
```javascript
proxy: {
  '/api': {
    target: 'https://your-worker-url.workers.dev',
    changeOrigin: true,
    secure: true
  }
}
```

## 📊 Dashboard Sections

### 1. Overview
- **Total Leads**: Number of email/phone captures
- **Total Events**: All tracked user interactions
- **Priority Access Attempts**: Queue skipping attempts
- **Conversion Rate**: Percentage of leads who completed the funnel
- **Daily Activity**: Line chart showing trends over 7 days
- **Event Breakdown**: Pie chart of event distribution

### 2. Funnel Analysis
- **Page Views**: Initial landing page visits
- **Idea Submissions**: Startup idea inputs
- **Plan Selections**: Pricing plan choices
- **Lead Captures**: Email/phone form submissions
- **Queue Views**: Users who saw the queue page
- **Priority Access Attempts**: Users who clicked the $25 button

### 3. Event Tracking
- **Event Name**: Type of user interaction
- **Event Category**: Classification (user_interaction, conversion, etc.)
- **Event Data**: JSON payload with additional context
- **Timestamp**: When the event occurred
- **URL**: Page where event happened
- **User Agent**: Browser/device information

### 4. Priority Access Metrics
- **Total Attempts**: All priority access clicks
- **Today's Attempts**: Attempts in the last 24 hours
- **This Week's Attempts**: Attempts in the last 7 days
- **User Details**: Email and phone of users who attempted

### 5. Real-time Metrics
- **24-hour Activity**: Rolling window of recent activity
- **Auto-refresh**: Updates every 30 seconds
- **System Status**: Database and API health indicators

## 🔧 API Endpoints

The dashboard uses these API endpoints from your Cloudflare Worker:

- `GET /api/analytics/overview` - Key metrics and statistics
- `GET /api/analytics/daily` - Daily activity data for charts
- `GET /api/analytics/events-breakdown` - Event distribution data
- `GET /api/analytics/funnel` - Conversion funnel metrics
- `GET /api/analytics/events` - Detailed event logs
- `GET /api/analytics/priority-access` - Priority access attempts
- `GET /api/analytics/realtime` - Real-time activity metrics

## 📈 Tracking Events

The dashboard tracks these events from the main Jetsy site:

### User Interactions
- `page_view` - Page visits
- `idea_submit` - Startup idea submissions
- `visibility_toggle` - Public/private selection
- `floating_chat_expand` - Chat box interactions
- `floating_chat_submit` - Chat submissions

### Conversion Events
- `plan_select` - Pricing plan selections
- `lead_capture` - Email/phone submissions
- `onboarding_form_submit` - Onboarding completions
- `priority_access_click` - Priority access button clicks
- `priority_access_attempt` - Priority access attempts

### System Events
- `lead_saved_success` - Successful lead storage
- `lead_save_error` - Lead storage failures
- `queue_view` - Queue page views
- `priority_access_error` - Priority access errors

## 🎯 Use Cases

### Marketing Analysis
- Track conversion rates through the funnel
- Identify drop-off points in user journey
- Monitor priority access conversion attempts
- Analyze user behavior patterns

### Product Optimization
- Understand which features users engage with
- Identify friction points in the user experience
- Monitor queue system effectiveness
- Track pricing plan preferences

### Business Intelligence
- Real-time monitoring of user activity
- Lead generation performance metrics
- Revenue potential from priority access
- User engagement trends

## 🚀 Development

### Local Development
```bash
npm run dev
```
Access at: http://localhost:3001

### Build for Production
```bash
npm run build
```

### Deploy Worker (API)
```bash
wrangler deploy
```

## 🔒 Security & Privacy

- **Database Access**: Read-only access to analytics data
- **No PII Storage**: Sensitive data is not displayed in charts
- **CORS Protection**: Proper CORS headers for API access
- **Rate Limiting**: Built-in protection against abuse

## 📝 Customization

### Adding New Metrics
1. Create new API endpoint in `src/worker.js`
2. Add corresponding component in `src/components/`
3. Update the main App.jsx to include the new tab

### Styling
- Modify `src/index.css` for global styles
- Update `tailwind.config.js` for design system changes
- Component-specific styles in individual component files

### Charts
- Use Recharts library for data visualization
- Available chart types: LineChart, BarChart, PieChart, AreaChart
- Customize colors, tooltips, and interactions

## 🐛 Troubleshooting

### Common Issues

**Dashboard not loading data**:
- Check database ID in wrangler.toml
- Verify D1 database is accessible
- Check Cloudflare Worker logs
- Ensure worker is deployed and accessible

**Charts not rendering**:
- Ensure data format matches chart expectations
- Check browser console for JavaScript errors
- Verify Recharts dependencies are installed

**API endpoints returning errors**:
- Check CORS headers in worker.js
- Verify database queries are correct
- Check Cloudflare Worker deployment status
- Test API endpoints directly in browser

**Local development issues**:
- Ensure you're running `npm run dev` from the analytics-dashboard directory
- Check that the worker URL in vite.config.js is correct
- Verify the worker is deployed and accessible

### Debug Mode

Enable debug logging in the worker:
```javascript
// Add to worker.js
console.log('Debug:', data);
```

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Cloudflare Worker logs
3. Verify database connectivity
4. Test API endpoints directly

---

**Jetsy Analytics Dashboard** - Track, analyze, and optimize your startup validation funnel! 📊 