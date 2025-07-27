# Image Generation Setup Guide

This guide will help you set up the image generation feature using Google Gemini's Imagen 4 Preview model for your AI website builder.

## 🎯 Overview

The image generation feature allows your AI to:
- Generate custom images for landing pages using text prompts
- Plan appropriate images based on website content
- Store images in Cloudflare R2 for fast delivery
- Track image usage and metadata in D1 database

## 📋 Prerequisites

1. **Google Gemini API Key**: Get access to Gemini Imagen 4 Preview
2. **Cloudflare R2 Bucket**: For image storage
3. **Updated D1 Database**: With new image tables

## 🚀 Setup Steps

### Step 1: Get Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Navigate to the API section
4. Create a new API key
5. Copy the key (starts with `AIza`)

### Step 2: Configure Environment Variables

#### Local Development
```bash
# Add Gemini API key as a Wrangler secret
npx wrangler secret put GEMINI_API_KEY

# When prompted, enter your Gemini API key
```

#### Production
```bash
# Add to production environment
npx wrangler secret put GEMINI_API_KEY --env production
```

### Step 3: Set Up Cloudflare R2 Bucket

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to R2 Object Storage
3. Create a new bucket called `jetsy-images-dev` (or your preferred name)
4. Update the bucket name in `wrangler.toml` if different

### Step 4: Update Database Schema

```bash
# Apply the new database schema with image tables
npm run db:migrate
```

### Step 5: Test the Setup

```bash
# Start the development server
npm run dev

# In another terminal, start the worker
npm run dev:worker

# Test image generation
npm run test:image
```

## 🔧 Configuration

### Aspect Ratios Supported

The system supports the following aspect ratios:
- `1:1` - Square (logos, icons, profile pictures)
- `16:9` - Widescreen (hero images, banners)
- `4:3` - Standard (feature images, product photos)
- `3:2` - Photo (gallery images)
- `2:1` - Panoramic (wide hero images)

### Image Storage

Images are stored in:
- **Cloudflare R2**: For fast global delivery
- **D1 Database**: Metadata and tracking information
- **File naming**: `img_{timestamp}_{random}.jpg`

### Cost Considerations

- **Gemini Imagen 4 Preview**: ~$0.05-0.10 per image
- **R2 Storage**: ~$0.015 per GB per month
- **R2 Requests**: ~$0.36 per million requests

## 🎨 Usage Examples

### Direct Image Generation

```javascript
const response = await fetch('/api/generate-image', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    project_id: 1,
    prompt: "Modern SaaS dashboard with analytics charts, blue theme, professional lighting",
    aspect_ratio: "16:9",
    number_of_images: 1
  })
});
```

### LLM Orchestration with Images

The LLM will automatically:
1. Analyze the user's request
2. Plan appropriate images
3. Generate image prompts
4. Call the image generation API
5. Update the code with image references

Example user prompt:
> "Create a landing page for a fitness app with hero image and feature images"

## 🔍 API Endpoints

### Generate Image
```
POST /api/generate-image
{
  "project_id": 1,
  "prompt": "description",
  "aspect_ratio": "16:9",
  "number_of_images": 1
}
```

### Get Project Images
```
GET /api/images?project_id=1
```

### Get Specific Image
```
GET /api/images/{image_id}
```

### Delete Image
```
DELETE /api/images/{image_id}
```

## 🧪 Testing

### Test Image Generation
```bash
npm run test:image
```

### Test LLM with Images
```bash
npm run test:llm
```

### Manual Testing
1. Go to `/chat` in your browser
2. Ask: "Create a landing page for a fitness app with images"
3. Watch the AI generate both code and images

## 🐛 Troubleshooting

### Common Issues

1. **"Gemini API key not found"**
   - Ensure you've added the secret: `npx wrangler secret put GEMINI_API_KEY`

2. **"R2 bucket not found"**
   - Check your R2 bucket name in `wrangler.toml`
   - Ensure the bucket exists in your Cloudflare account

3. **"Database error"**
   - Run `npm run db:migrate` to apply schema updates

4. **"Image generation failed"**
   - Check your Gemini API key is valid
   - Ensure you have access to Imagen 4 Preview
   - Check the prompt doesn't violate content policies

### Debug Mode

Enable detailed logging by checking the worker console:
```bash
npm run dev:worker
```

## 📊 Monitoring

### Track Image Usage

Monitor your image generation usage:
- Check R2 bucket usage in Cloudflare dashboard
- Review Gemini API usage in Google AI Studio
- Monitor database for image metadata

### Performance Metrics

- Image generation time: ~10-30 seconds
- R2 upload time: ~1-3 seconds
- Database operations: ~100-500ms

## 🔒 Security Considerations

1. **API Key Security**: Never commit API keys to version control
2. **Content Filtering**: Gemini has built-in content safety filters
3. **Rate Limiting**: Implement rate limiting for image generation
4. **Access Control**: Consider user-based image quotas

## 🚀 Deployment

### Production Deployment

1. **Update wrangler.toml** with production R2 bucket
2. **Add production secrets**:
   ```bash
   npx wrangler secret put GEMINI_API_KEY --env production
   ```
3. **Deploy to production**:
   ```bash
   npm run deploy:production
   ```

### Environment Variables

Ensure these are set in production:
- `GEMINI_API_KEY`: Your Gemini API key
- `IMAGES_BUCKET`: R2 bucket binding
- `DB`: D1 database binding

## 📚 Additional Resources

- [Google Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [Imagen 4 Preview Guide](https://ai.google.dev/gemini-api/docs/imagen)

## 🤝 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the worker logs for error details
3. Test with the provided test scripts
4. Verify your API keys and permissions 