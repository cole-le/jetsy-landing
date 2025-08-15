# Jetsy Vercel Integration

Complete Vercel integration for Jetsy SaaS platform to solve custom domain hosting issues and provide better deployment options for user-generated websites.

## 🎯 Overview

This integration allows Jetsy users to:
- Deploy their AI-generated websites to Vercel's global CDN
- Add custom domains with automatic SSL and DNS management
- Maintain form submissions processing through Cloudflare Workers
- Get better performance and reliability than the previous custom hostname approach

## 🏗️ Architecture

```
Main Jetsy App (Cloudflare Workers)
        ↓
User creates website → Deploy to Vercel API
        ↓
Generated Website (Vercel CDN)
        ↓
Lead forms → POST to Cloudflare Workers (CORS)
```

### Components

1. **Static Site Generator** (`src/utils/staticSiteGenerator.js`)
   - Converts React template data to static HTML/CSS/JS
   - Includes cross-origin form handling
   - Optimized for performance and SEO

2. **Vercel Deployment Utilities** (`src/utils/vercelDeployment.js`)
   - Handles Vercel API interactions
   - Manages deployments and custom domains
   - Error handling and status monitoring

3. **Cloudflare Worker Integration** (`src/worker.js`)
   - New API endpoints for Vercel operations
   - Database integration for tracking deployments
   - CORS handling for cross-origin forms

4. **Frontend Components** (`src/components/VercelDeploymentManager.jsx`)
   - User interface for deployment management
   - Real-time status updates
   - Custom domain configuration

5. **Database Schema** (`migrate-vercel-integration.sql`)
   - Tracks Vercel deployments and status
   - Manages custom domain configurations
   - Links projects to live deployments

## 🚀 Setup Instructions

### 1. Environment Configuration

Add to your `.dev.vars` file:
```bash
# Vercel API Configuration
VERCEL_API_TOKEN=your-vercel-token-here
```

### 2. Get Vercel API Token

1. Go to [Vercel Dashboard](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Name it "Jetsy Integration"
4. Select appropriate scope (deployments, domains)
5. Copy the token to your environment variables

### 3. Database Migration

Run the database migration to add Vercel tables:
```bash
npx wrangler d1 execute jetsy-leads --file=./migrate-vercel-integration.sql
```

### 4. Deploy Worker

Deploy the updated worker with new API endpoints:
```bash
npm run deploy
```

## 📋 API Endpoints

### Deployment Management

- `POST /api/vercel/deploy/{projectId}` - Deploy project to Vercel
- `GET /api/vercel/status/{projectId}` - Get deployment status
- `POST /api/vercel/domain/{projectId}` - Add custom domain
- `GET /api/vercel/domain/{projectId}` - Get domain status

### Request/Response Examples

#### Deploy Project
```javascript
POST /api/vercel/deploy/123
{
  "templateData": { /* project template data */ }
}

// Response:
{
  "success": true,
  "deployment": {
    "id": "dpl_abc123",
    "url": "https://jetsy-project-123.vercel.app",
    "status": "BUILDING",
    "vercelProjectName": "jetsy-project-123"
  }
}
```

#### Add Custom Domain
```javascript
POST /api/vercel/domain/123
{
  "domain": "mycompany.com"
}

// Response:
{
  "success": true,
  "domain": {
    "name": "mycompany.com",
    "verificationStatus": "pending",
    "dnsInstructions": {
      "type": "CNAME",
      "name": "mycompany.com",
      "value": "jetsy-project-123.vercel.app"
    }
  }
}
```

## 🎨 Frontend Integration

The `VercelDeploymentManager` component is automatically integrated into the template editor. It provides:

- One-click deployment to Vercel
- Real-time deployment status monitoring
- Custom domain management with DNS instructions
- Error handling and user feedback

### Usage in Templates

```jsx
import VercelDeploymentManager from './VercelDeploymentManager';

<VercelDeploymentManager 
  projectId={currentProject?.id}
  templateData={templateData}
/>
```

## 🧪 Testing

### Run Integration Tests

```bash
node test-vercel-integration.js
```

This will test:
- Static site generation
- Project creation
- Vercel deployment
- Status monitoring
- Custom domain management

### Manual Testing Steps

1. **Create a Project**: Use the Jetsy interface to create a new project
2. **Edit Template**: Customize your website using the template editor
3. **Deploy to Vercel**: Click the "Deploy to Vercel" button
4. **Monitor Status**: Watch the deployment progress in real-time
5. **Add Custom Domain**: Enter your domain and follow DNS instructions
6. **Test Live Site**: Visit your deployed website and test form submissions

## 🔧 Technical Details

### Static Site Generation

The static site generator creates:
- SEO-optimized HTML with proper meta tags
- Responsive CSS using Tailwind CDN
- JavaScript for form handling and analytics
- Cross-origin API calls to Cloudflare Workers

### Form Handling

Forms on deployed sites POST to Jetsy's API:
```javascript
fetch('https://jetsy.dev/api/leads', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    project_id: '123',
    source: 'vercel_deployment'
  })
});
```

### Database Schema

**vercel_deployments** table:
- Tracks all deployments with status and metadata
- Links to projects table
- Stores Vercel deployment IDs and URLs

**vercel_custom_domains** table:
- Manages custom domain configurations
- Tracks verification and SSL status
- Stores DNS configuration details

## 🚦 Deployment Status Values

- `BUILDING` - Deployment is being built
- `READY` - Deployment is live and accessible
- `ERROR` - Deployment failed (check error_message)
- `CANCELED` - Deployment was canceled

## 🌐 Domain Verification Status

- `pending` - Domain added, DNS configuration needed
- `verified` - Domain verified and SSL active
- `failed` - Domain verification failed

## 🔒 Security Considerations

1. **CORS Configuration**: Properly configured for cross-origin form submissions
2. **API Token Storage**: Store Vercel token as environment variable, not in code
3. **Input Validation**: All user inputs are validated and sanitized
4. **Rate Limiting**: Consider implementing rate limiting for deployment endpoints
5. **Domain Verification**: Only allow legitimate domains to be added

## 🐛 Troubleshooting

### Common Issues

**Deployment fails with "Invalid token"**
- Verify VERCEL_API_TOKEN is set correctly
- Check token permissions include deployments and domains

**Forms not submitting from deployed site**
- Verify CORS headers are configured
- Check API base URL in static site
- Ensure project_id is passed correctly

**Custom domain not verifying**
- Confirm DNS record is added correctly
- Allow 24-48 hours for DNS propagation
- Check domain doesn't have conflicting records

### Debug Mode

Enable verbose logging by setting:
```bash
DEBUG=true
```

## 📊 Monitoring

Track deployment metrics through:
1. Vercel Dashboard - deployment status and performance
2. Jetsy Analytics - form submissions and user interactions
3. Cloudflare Analytics - API usage and response times

## 🔄 Maintenance

### Regular Tasks

1. **Monitor API Usage**: Check Vercel API rate limits
2. **Database Cleanup**: Clean up old deployment records
3. **SSL Renewal**: Verify SSL certificates are auto-renewing
4. **Performance Monitoring**: Check deployment build times

### Updates

When updating the integration:
1. Test in development environment first
2. Run integration tests
3. Deploy incrementally
4. Monitor for errors in production

## 📈 Future Enhancements

Potential improvements:
- Automatic redeployment on template changes
- Advanced analytics integration
- Multi-region deployments
- Custom build configurations
- Staging/production environment management

## 📞 Support

For issues with the Vercel integration:
1. Check this documentation first
2. Run the integration tests
3. Review Cloudflare Worker logs
4. Check Vercel deployment logs
5. Contact the development team

---

**Note**: This integration requires a Vercel account and API token. Free tier limits apply for deployments and custom domains.
