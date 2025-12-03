# Complete CI/CD Pipeline Guide

## ✅ What We've Set Up

Your CI/CD pipeline is now **LIVE** on GitHub! Here's what happens automatically now:

### Triggers (When the pipeline runs)
- ✅ Every time you push code to the `main` branch
- ✅ Every time someone creates a Pull Request
- ✅ Manually from GitHub Actions tab

---

## 📊 Understanding Each Component

### 1. **`.gitignore` File**
**Location**: Project root

**Purpose**: Tells Git which files to ignore (not track)

**Why Important**: 
- Prevents uploading `node_modules` (thousands of files!)
- Keeps environment secrets (.env files) private
- Reduces repository size
- Speeds up commits

**Example**: Without `.gitignore`, you'd commit 100,000+ files from `node_modules`. With it, you only commit your actual code (~100 files).

---

### 2. **`.github/workflows/ci-cd.yml` File**
**Location**: `.github/workflows/ci-cd.yml`

**Purpose**: The "recipe" that tells GitHub Actions what to do

**How it works**:
```yaml
name: CI/CD Pipeline  # Name shown in GitHub UI

on:  # WHEN to run
  push:
    branches: [ main ]  # Run when code is pushed to main
  pull_request:
    branches: [ main ]  # Run when PR is created

jobs:  # WHAT to do
  backend-build:  # Job 1: Build backend
    runs-on: ubuntu-latest  # Use Ubuntu server
    steps:
      - uses: actions/checkout@v4  # Download code
      - uses: actions/setup-node@v4  # Install Node.js
      - run: npm ci  # Install dependencies
      - run: npm run build  # Build the app
```

**Breakdown of Each Step**:

#### Step 1: `actions/checkout@v4`
- **What**: Downloads your code from GitHub to a virtual computer
- **Why**: The virtual computer starts empty - needs your code first
- **Analogy**: Like downloading a zip file before you can work on it

#### Step 2: `actions/setup-node@v4`
- **What**: Installs Node.js version 20
- **Why**: Your TypeScript/JavaScript code needs Node.js to run
- **Analogy**: Installing the engine before starting the car

#### Step 3: `npm ci`
- **What**: Installs all dependencies from `package-lock.json`
- **Why**: Your app needs libraries (like NestJS, React, Prisma)
- **Difference from `npm install`**: 
  - `npm ci` = faster, uses exact versions (CI = Continuous Integration)
  - `npm install` = slower, might update versions

#### Step 4: `npm run lint`
- **What**: Checks code style and finds potential bugs
- **Why**: Catches issues like:
  - Unused variables
  - Missing semicolons
  - Potential runtime errors
- **Analogy**: Spell-check for code

#### Step 5: `npm run build`
- **What**: Compiles TypeScript → JavaScript, optimizes code
- **Why**: 
  - Ensures no syntax errors
  - Creates production-ready code
  - TypeScript must be compiled before it can run
- **Output**: Creates a `dist/` folder with compiled code

#### Step 6: `npm test`
- **What**: Runs automated tests (if you have any)
- **Why**: Verifies your code works as expected
- **Example**: Tests that login works, database connections succeed, etc.

---

### 3. **Jobs Explained**

Your pipeline has 3 jobs that run in parallel:

#### Job 1: `backend-build`
- **Purpose**: Build and test the NestJS backend
- **Working Directory**: `./apps/nest-backend`
- **Key Steps**:
  1. Install dependencies
  2. Lint TypeScript code
  3. Build (compile TypeScript)
  4. Run tests

#### Job 2: `frontend-build`
- **Purpose**: Build and test the Next.js frontend
- **Working Directory**: `./apps/next-frontend/next-frontend-app`
- **Key Steps**:
  1. Install dependencies
  2. Lint React/TypeScript code
  3. Build Next.js app (creates optimized production bundle)
  4. Run tests

#### Job 3: `docker-build`
- **Purpose**: Build Docker images
- **Dependency**: Only runs if jobs 1 & 2 succeed (`needs: [backend-build, frontend-build]`)
- **Why Docker**:
  - Packages your app + dependencies into a container
  - Ensures it runs the same everywhere (dev, staging, production)
  - Makes deployment easy

---

## 🎯 How to Use Your Pipeline

### Step 1: Make Changes Locally
```bash
# Edit your code in VS Code
# Example: modify apps/nest-backend/src/app.service.ts
```

### Step 2: Commit Your Changes
```bash
git add .
git commit -m "Add new feature: user authentication"
```

### Step 3: Push to GitHub
```bash
git push origin main
```

### Step 4: Watch the Pipeline Run
1. Go to: https://github.com/PriyadarshiniSrinivasan/Priyadarshini
2. Click "Actions" tab
3. See your workflow running in real-time!

**What You'll See**:
- ✅ Green checkmark = Success
- ❌ Red X = Failure
- 🟡 Yellow dot = Running

---

## 🔍 Reading Pipeline Results

### Success (✅)
All jobs completed without errors:
```
✅ backend-build (2m 34s)
✅ frontend-build (3m 12s)
✅ docker-build (4m 56s)
```
**Meaning**: Your code is good! Safe to deploy.

### Failure (❌)
One or more jobs failed:
```
❌ backend-build (1m 23s)
   └─ Error: npm run build failed
   └─ src/app.service.ts:23:5 - error TS2304: Cannot find name 'foo'
```
**Meaning**: Fix the error in your code and push again.

---

## 🚀 Next Steps: Adding Deployment

Currently, your pipeline **builds and tests** but doesn't **deploy**. Here's how to add deployment:

### Option 1: Deploy to Heroku
```yaml
deploy:
  needs: [backend-build, frontend-build, docker-build]
  runs-on: ubuntu-latest
  if: github.ref == 'refs/heads/main'
  steps:
    - uses: actions/checkout@v4
    - uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
        heroku_app_name: "my-fullstack-app"
        heroku_email: "your-email@example.com"
```

### Option 2: Deploy to AWS ECS (Docker)
```yaml
deploy:
  needs: [docker-build]
  runs-on: ubuntu-latest
  steps:
    - name: Deploy to AWS ECS
      uses: aws-actions/amazon-ecs-deploy-task-definition@v1
      with:
        task-definition: task-definition.json
        service: my-service
        cluster: my-cluster
```

### Option 3: Deploy to Vercel (Frontend) + Railway (Backend)
```yaml
deploy-frontend:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 🔐 Setting Up GitHub Secrets

Secrets are environment variables stored securely in GitHub.

### How to Add Secrets:
1. Go to your repository on GitHub
2. Click **Settings** tab
3. Click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add secrets like:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `OKTA_CLIENT_ID`
   - `OKTA_ISSUER`

### Use in Workflow:
```yaml
- name: Build frontend
  run: npm run build
  env:
    NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}
```

---

## 📈 Advanced Pipeline Features

### 1. **Caching Dependencies**
Speeds up builds by reusing `node_modules`:
```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'  # Automatically caches node_modules
```

### 2. **Matrix Builds** (Test Multiple Node Versions)
```yaml
strategy:
  matrix:
    node-version: [18, 20, 22]
steps:
  - uses: actions/setup-node@v4
    with:
      node-version: ${{ matrix.node-version }}
```

### 3. **Conditional Steps**
```yaml
- name: Deploy to production
  if: github.ref == 'refs/heads/main'
  run: npm run deploy
```

### 4. **Slack Notifications**
```yaml
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Build completed!'
  if: always()
```

---

## 🐛 Troubleshooting Common Issues

### Issue 1: "npm ci" fails
**Error**: `The package-lock.json was not found`
**Solution**: 
```bash
npm install  # Generates package-lock.json
git add package-lock.json
git commit -m "Add package-lock.json"
git push
```

### Issue 2: Build succeeds locally but fails in CI
**Reason**: Environment differences (Windows vs Linux)
**Solution**: 
- Check line endings (CRLF vs LF)
- Verify all dependencies are in package.json
- Test in Docker locally: `docker build -t test .`

### Issue 3: Tests fail in CI
**Reason**: Missing environment variables
**Solution**: Add them to GitHub Secrets

### Issue 4: Out of disk space
**Reason**: Docker images too large
**Solution**: Use multi-stage builds, clean up layers

---

## 📚 Learning Resources

### GitHub Actions Documentation
- Official Docs: https://docs.github.com/en/actions
- Marketplace: https://github.com/marketplace?type=actions

### CI/CD Best Practices
1. **Keep builds fast** (under 10 minutes)
2. **Fail fast** (run tests before building)
3. **Parallelize** jobs when possible
4. **Use caching** for dependencies
5. **Test in production-like environment** (Docker)

---

## ✅ Checklist for Your Pipeline

- [x] `.gitignore` created
- [x] CI/CD workflow file created (`.github/workflows/ci-cd.yml`)
- [x] Pipeline tests backend build
- [x] Pipeline tests frontend build
- [x] Pipeline builds Docker images
- [x] Code pushed to GitHub
- [ ] Add GitHub Secrets for environment variables
- [ ] Add deployment step
- [ ] Configure production environment
- [ ] Set up monitoring/logging

---

## 🎓 Key Concepts Summary

| Concept | Explanation | Example |
|---------|-------------|---------|
| **CI** | Continuous Integration - automatically test every code change | Every push triggers tests |
| **CD** | Continuous Deployment - automatically deploy passing builds | Deploy to production after tests pass |
| **Workflow** | A YAML file defining what to automate | `.github/workflows/ci-cd.yml` |
| **Job** | A set of steps that run on the same virtual machine | `backend-build`, `frontend-build` |
| **Step** | Individual task in a job | `npm install`, `npm run build` |
| **Runner** | Virtual machine that runs jobs | `ubuntu-latest` |
| **Action** | Reusable unit of code | `actions/checkout@v4` |
| **Secret** | Encrypted environment variable | `${{ secrets.DATABASE_URL }}` |

---

## 🎉 Congratulations!

You now have a professional CI/CD pipeline that:
- ✅ Automatically tests your code
- ✅ Builds both frontend and backend
- ✅ Validates Docker images
- ✅ Runs on every commit
- ✅ Shows status badges in README

Your next commits will automatically trigger this pipeline!

---

## 📞 Quick Reference Commands

```bash
# View your current branch
git branch

# Stage all changes
git add .

# Commit changes
git commit -m "Your message here"

# Push to GitHub (triggers pipeline)
git push origin main

# Check pipeline status
# Visit: https://github.com/PriyadarshiniSrinivasan/Priyadarshini/actions

# Pull latest changes from GitHub
git pull origin main

# View Git status
git status

# View commit history
git log --oneline
```

---

**Pipeline Status**: 🟢 ACTIVE

**Repository**: https://github.com/PriyadarshiniSrinivasan/Priyadarshini

**Actions Dashboard**: https://github.com/PriyadarshiniSrinivasan/Priyadarshini/actions
