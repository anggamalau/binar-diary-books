# Railway Deployment Setup for GitHub Actions

## Required GitHub Secrets

You need to add the following secrets to your GitHub repository:

1. **RAILWAY_TOKEN** (you already have this)
2. **RAILWAY_PROJECT_ID** 
3. **RAILWAY_SERVICE_ID** (this will be used with the --service flag)

## How to Get Your Railway Project and Service IDs

### Option 1: From Railway Dashboard
1. Go to your Railway project dashboard
2. Check the URL: `https://railway.app/project/{PROJECT_ID}/service/{SERVICE_ID}`
3. Copy the PROJECT_ID and SERVICE_ID from the URL

### Option 2: Using Railway CLI (locally)
1. Make sure you're in your project directory
2. Run: `railway status`
3. The output will show your project and service information

### Option 3: Using Railway CLI Commands
```bash
# Get project ID
railway project

# Get service ID
railway service
```

## Adding Secrets to GitHub

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret:
   - Name: `RAILWAY_PROJECT_ID`
   - Value: Your project ID (e.g., `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
   
   - Name: `RAILWAY_SERVICE_ID`  
   - Value: Your service ID (e.g., `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

## Verify Your Setup

After adding the secrets, your next push to the main branch should successfully deploy to Railway.

The workflow will now have access to:
- `RAILWAY_TOKEN` - Your authentication token
- `RAILWAY_PROJECT_ID` - The specific project to deploy to
- `RAILWAY_SERVICE_ID` - The specific service within that project

This resolves the "Project Token not found" error.