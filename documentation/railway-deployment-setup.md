# Railway.app Deployment Setup

## Overview
This document describes the setup process for deploying the Diary Books application to Railway.app using GitHub Actions.

## Prerequisites

### 1. Railway Account and Project
1. Create an account at [Railway.app](https://railway.app)
2. Create a new project in Railway
3. Note your project ID from the Railway dashboard

### 2. Railway Token
1. Go to Railway Dashboard → Account Settings → Tokens
2. Create a new token with deployment permissions
3. Copy the token (you'll need it for GitHub secrets)

## GitHub Secrets Configuration

Add the following secrets to your GitHub repository:

1. **RAILWAY_TOKEN** (Required)
   - Go to Repository → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `RAILWAY_TOKEN`
   - Value: Your Railway token from above

2. **SONAR_TOKEN** (Already configured)
   - This should already be set up for SonarCloud analysis

## Environment Variables for Railway

Configure these environment variables in your Railway project:

```bash
# Application Settings
NODE_ENV=production
PORT=3000

# Session Configuration
SESSION_SECRET=your-strong-session-secret-here

# Database Configuration (if using external DB)
# For SQLite, the local file will be used by default

# Security Settings
JWT_SECRET=your-jwt-secret-here

# Any other application-specific variables
```

## Railway Configuration

Create a `railway.json` file in your project root (optional):

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## Deployment Workflow

The CI/CD pipeline (`ci-cd-pipeline.yml`) runs in this sequence:

1. **Lint** - Checks code quality with ESLint
2. **Test** - Runs Jest tests with coverage
3. **SonarCloud** - Performs code analysis
4. **Deploy** - Deploys to Railway (only on main branch)

### Workflow Triggers
- **Pull Requests**: Runs lint, test, and SonarCloud analysis
- **Push to main**: Runs full pipeline including deployment

### Manual Workflows
The individual workflows (lint.yml, test.yml, sonarcloud.yml) are now set to manual trigger only:
- Use these for debugging or running specific checks
- Trigger via Actions tab → Select workflow → Run workflow

## Database Considerations

### SQLite in Production
The application uses SQLite by default. For Railway deployment:

1. **Persistent Volume** (Recommended for SQLite):
   - Add a persistent volume in Railway
   - Mount it to `/app/database`
   - Update database path in your app configuration

2. **Alternative: PostgreSQL** (Recommended for production):
   - Add PostgreSQL service in Railway
   - Update application to support PostgreSQL
   - Configure DATABASE_URL environment variable

## Monitoring Deployment

1. **GitHub Actions**:
   - Check Actions tab for pipeline status
   - Each job shows detailed logs
   - Failed deployments will show error messages

2. **Railway Dashboard**:
   - View deployment logs
   - Monitor application metrics
   - Check environment variables

## Troubleshooting

### Common Issues

1. **Deployment fails with "RAILWAY_TOKEN not found"**
   - Ensure the secret is properly set in GitHub
   - Check token hasn't expired in Railway

2. **Application crashes on Railway**
   - Check Railway logs for error messages
   - Ensure all environment variables are set
   - Verify `npm start` command works locally

3. **Database issues**
   - For SQLite: Ensure persistent volume is configured
   - Check file permissions in container
   - Consider switching to PostgreSQL for production

### Rollback Procedure
1. Go to Railway dashboard
2. Navigate to your project → Deployments
3. Select a previous successful deployment
4. Click "Redeploy"

## Security Best Practices

1. **Never commit secrets** to the repository
2. **Use strong values** for SESSION_SECRET and JWT_SECRET
3. **Regularly rotate** your Railway token
4. **Enable 2FA** on both GitHub and Railway accounts
5. **Review deployment logs** regularly for security issues

## Next Steps

1. Set up monitoring and alerts in Railway
2. Configure custom domain (if needed)
3. Set up database backups
4. Implement health checks
5. Configure auto-scaling (if needed)