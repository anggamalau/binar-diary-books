# SonarCloud Setup Guide

This guide explains how to set up SonarCloud code analysis for the Diary Books project.

## Prerequisites

1. GitHub account with repository access
2. SonarCloud account (free for open-source projects)

## Setup Steps

### 1. Create SonarCloud Account

1. Go to [SonarCloud](https://sonarcloud.io/)
2. Click "Log in" and choose "Log in with GitHub"
3. Authorize SonarCloud to access your GitHub account

### 2. Import Your Project

1. Once logged in, click the "+" button and select "Analyze new project"
2. Choose your GitHub organization/account
3. Select the `diary-books` repository
4. Click "Set up"

### 3. Configure Project Settings

1. Choose "GitHub Actions" as your CI method
2. SonarCloud will provide you with:
   - Your organization key
   - Your project key
   - A SONAR_TOKEN

### 4. Update Configuration Files

1. Update `sonar-project.properties` with your actual values:
   ```properties
   sonar.projectKey=YOUR-GITHUB-USERNAME_diary-books
   sonar.organization=YOUR-SONARCLOUD-ORGANIZATION
   ```

### 5. Add GitHub Secret

1. Go to your GitHub repository settings
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add the following secret:
   - Name: `SONAR_TOKEN`
   - Value: (paste the token from SonarCloud)

### 6. Configure Quality Gate (Optional)

1. In SonarCloud project settings, go to "Quality Gates"
2. You can use the default "Sonar way" quality gate or create custom rules
3. Common quality gate conditions:
   - Coverage on new code > 80%
   - Duplicated lines on new code < 3%
   - Maintainability rating on new code = A
   - Reliability rating on new code = A
   - Security rating on new code = A

## How It Works

The GitHub Actions workflow (`sonarcloud.yml`) will:

1. Trigger on every push to `main` branch
2. Trigger on every pull request to `main` branch
3. Run the following steps:
   - Check out code with full history
   - Set up Node.js environment
   - Install dependencies
   - Run tests with coverage
   - Perform SonarCloud analysis

## Viewing Results

After the workflow runs:

1. Check the Actions tab in GitHub to see workflow status
2. Visit your project on SonarCloud to see:
   - Code quality metrics
   - Code coverage
   - Code smells
   - Security vulnerabilities
   - Technical debt
   - Duplications

## Troubleshooting

### Common Issues

1. **"SONAR_TOKEN is not set"**
   - Ensure the GitHub secret is added correctly
   - Check the secret name matches exactly: `SONAR_TOKEN`

2. **"Project not found"**
   - Verify the project key in `sonar-project.properties`
   - Ensure the project is imported in SonarCloud

3. **"Organization not found"**
   - Check the organization key in `sonar-project.properties`
   - Verify you're using the correct SonarCloud organization

### Badge Integration

You can add a SonarCloud badge to your README.md:

```markdown
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=YOUR-PROJECT-KEY&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=YOUR-PROJECT-KEY)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=YOUR-PROJECT-KEY&metric=coverage)](https://sonarcloud.io/summary/new_code?id=YOUR-PROJECT-KEY)
```

Replace `YOUR-PROJECT-KEY` with your actual project key from `sonar-project.properties`.

## Best Practices

1. **Fix issues incrementally**: Focus on new code quality first
2. **Set realistic quality gates**: Start with achievable goals
3. **Review security hotspots**: Pay special attention to security findings
4. **Monitor trends**: Track improvement over time
5. **Integrate with PRs**: Use SonarCloud PR decoration for immediate feedback

## Additional Resources

- [SonarCloud Documentation](https://docs.sonarcloud.io/)
- [SonarCloud GitHub Action](https://github.com/SonarSource/sonarcloud-github-action)
- [JavaScript/TypeScript Analysis](https://docs.sonarcloud.io/enriching/test-coverage/javascript-typescript-test-coverage/)