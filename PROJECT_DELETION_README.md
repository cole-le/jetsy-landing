# 🗑️ Project Deletion Scripts

This directory contains scripts to delete projects from your Cloudflare D1 database.

## 📁 Available Scripts

### 1. `delete-project` (Recommended)
A simple bash script that allows you to delete a project by name.

**Usage:**
```bash
./delete-project "Project Name"
```

**Examples:**
```bash
./delete-project "LaundroCafé"
./delete-project "My Test Project"
./delete-project "Business Website"
```

### 2. `delete-project.js`
The Node.js script that performs the actual deletion. You can run this directly if you prefer:

**Usage:**
```bash
node delete-project.js "Project Name"
```

### 3. `delete-test-projects.cjs`
A script to delete all projects with names starting with "test" (batch deletion).

**Usage:**
```bash
node delete-test-projects.cjs
```

## ⚠️ Safety Features

All scripts include:
- **Confirmation prompts** - You must type "DELETE" to confirm
- **Project verification** - Shows project details before deletion
- **Foreign key handling** - Deletes related data (chat messages, images, etc.)
- **Verification** - Confirms the project was actually deleted

## 🔧 What Gets Deleted

When you delete a project, the following data is also removed:
- ✅ Project files and configuration
- ✅ All chat messages for the project
- ✅ All generated images for the project
- ✅ All image placements and metadata
- ✅ Vercel deployments and related data
- ✅ Project settings and metadata

## 🚀 Quick Start

1. **Make sure scripts are executable:**
   ```bash
   chmod +x delete-project
   chmod +x delete-project.js
   ```

2. **Delete a project by name:**
   ```bash
   ./delete-project "LaundroCafé"
   ```

3. **Follow the prompts:**
   - Review project details
   - Type "DELETE" to confirm
   - Wait for completion

## 📊 Database Connection

- **Database**: `jetsy-leads` (Cloudflare D1)
- **Connection**: Remote (production) database
- **Required**: Wrangler CLI with proper authentication

## 🆘 Troubleshooting

### "Command not found" error
```bash
npm install -g wrangler
```

### Database connection issues
Check your `wrangler.toml` file and ensure you're authenticated:
```bash
npx wrangler login
```

### Permission denied
```bash
chmod +x delete-project
chmod +x delete-project.js
```

## 💡 Tips

- **Use quotes** around project names with spaces: `./delete-project "My Project"`
- **Double-check** the project name before confirming deletion
- **Keep backups** of important projects before deletion
- **Use the test script** first if you want to see how it works

## 🔒 Security Note

These scripts connect to your **production** Cloudflare D1 database. Always double-check project names and confirm deletions carefully.
