# CI/CD Pipeline Error Troubleshooting Guide

## 🔍 How to View Pipeline Errors

### Step 1: Go to GitHub Actions
Visit: https://github.com/PriyadarshiniSrinivasan/Priyadarshini/actions

### Step 2: Identify Failed Workflow
- ✅ Green checkmark = Success
- ❌ Red X = Failed
- 🟡 Yellow circle = Running
- ⚪ Gray circle = Queued/Pending

Click on the workflow run with ❌

### Step 3: View Failed Job
You'll see the jobs list:
```
❌ backend-build (1m 23s)
✅ frontend-build (2m 45s)
⚪ docker-build (skipped - dependency failed)
```

Click on the failed job (red ❌)

### Step 4: Expand Failed Step
Click on the step that failed. Common failing steps:
- "Install dependencies"
- "Build backend"
- "Lint code"
- "Run tests"

### Step 5: Read the Error Log
Scroll to the bottom of the log to see the actual error message (usually in red text)

---

## 🛠️ Common Errors & Solutions

### Error 1: npm ci Failed - Package Lock Issues

**Error Message:**
```
npm ERR! The package-lock.json lockfile is missing
```

**Solution:**
```powershell
# For backend
cd apps/nest-backend
npm install
git add package-lock.json
git commit -m "Add package-lock.json"
git push origin main

# For frontend
cd apps/next-frontend/next-frontend-app
npm install
git add package-lock.json
git commit -m "Add package-lock.json"
git push origin main
```

---

### Error 2: Dependency Resolution Errors

**Error Message:**
```
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solution A: Use legacy peer deps**
```powershell
cd apps/nest-backend
npm install --legacy-peer-deps
npm run build  # Test locally first
git add package*.json
git commit -m "Fix dependency conflicts"
git push origin main
```

**Solution B: Update conflicting packages**
```powershell
npm update
npm install
git add package*.json
git commit -m "Update dependencies"
git push origin main
```

---

### Error 3: Build Errors (TypeScript/ESLint)

**Error Message:**
```
src/app.service.ts:23:5 - error TS2304: Cannot find name 'variable'
```

**Solution:**
```powershell
# Test the build locally first
cd apps/nest-backend
npm run build

# Fix the errors in your code
# Then commit and push
git add .
git commit -m "Fix TypeScript errors"
git push origin main
```

---

### Error 4: Lint Errors

**Error Message:**
```
error: Unexpected console statement (no-console)
```

**Solution:**

**Option 1: Fix the lint issues**
```powershell
cd apps/nest-backend
npm run lint -- --fix  # Auto-fix what can be fixed
git add .
git commit -m "Fix linting issues"
git push origin main
```

**Option 2: Make lint non-blocking (temporary)**
Edit `.github/workflows/ci-cd.yml`:
```yaml
- name: Lint code
  run: npm run lint --if-present
  continue-on-error: true  # Add this line
```

---

### Error 5: Cache Path Issues (JUST FIXED!)

**Error Message:**
```
Error: Dependencies lock file is not found in /home/runner/work/...
```

**Solution:** ✅ Already fixed! The cache paths are now correct:
- Backend: `apps/nest-backend/package-lock.json`
- Frontend: `apps/next-frontend/next-frontend-app/package-lock.json`

---

### Error 6: Docker Build Fails

**Error Message:**
```
ERROR: failed to solve: failed to compute cache key
```

**Solution:**
```powershell
# Test Docker build locally first
docker build -t test-backend -f apps/nest-backend/Dockerfile apps/nest-backend
docker build -t test-frontend -f apps/next-frontend/next-frontend-app/Dockerfile apps/next-frontend/next-frontend-app

# If it fails locally, fix the Dockerfile
# Then push
git add .
git commit -m "Fix Dockerfile"
git push origin main
```

---

### Error 7: Tests Fail

**Error Message:**
```
FAIL src/app.service.spec.ts
  ● Test suite failed to run
```

**Solution:**
```powershell
# Run tests locally
cd apps/nest-backend
npm test

# Fix the failing tests
# Then commit
git add .
git commit -m "Fix failing tests"
git push origin main
```

---

## 🔄 How to Re-run a Failed Workflow

If the error was temporary (network issue, GitHub glitch):

1. Go to the failed workflow run
2. Click **"Re-run jobs"** button (top right)
3. Select **"Re-run failed jobs"** or **"Re-run all jobs"**

---

## 🐛 Debug Mode

To get more detailed logs, add this to your workflow:

```yaml
env:
  ACTIONS_STEP_DEBUG: true
  ACTIONS_RUNNER_DEBUG: true
```

Example:
```yaml
jobs:
  backend-build:
    runs-on: ubuntu-latest
    env:
      ACTIONS_STEP_DEBUG: true
    steps:
      # ... rest of steps
```

---

## 📊 Understanding Exit Codes

When a step fails, you'll see an exit code:

| Exit Code | Meaning |
|-----------|---------|
| 0 | Success |
| 1 | General error (most common) |
| 2 | Misuse of shell command |
| 126 | Command cannot execute |
| 127 | Command not found |
| 130 | Terminated by Ctrl+C |

---

## 🎯 Testing Before Pushing

**Best Practice:** Test everything locally before pushing to avoid pipeline failures

```powershell
# Test backend
cd apps/nest-backend
npm install
npm run lint
npm run build
npm test

# Test frontend
cd apps/next-frontend/next-frontend-app
npm install
npm run lint
npm run build
npm test

# Test Docker builds
docker build -t test-backend -f apps/nest-backend/Dockerfile apps/nest-backend
docker build -t test-frontend -f apps/next-frontend/next-frontend-app/Dockerfile apps/next-frontend/next-frontend-app

# If all pass, commit and push
git add .
git commit -m "Your message"
git push origin main
```

---

## 📧 Notifications

### Enable Email Notifications
GitHub automatically emails you when workflows fail. Check:
1. GitHub Settings → Notifications
2. Enable "Actions" notifications

### Add Slack Notifications
Add this step to your workflow:
```yaml
- name: Notify on failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 📝 Quick Checklist When Pipeline Fails

- [ ] Check which job failed (backend/frontend/docker)
- [ ] Read the error message completely
- [ ] Try to reproduce the error locally
- [ ] Fix the issue in your code
- [ ] Test the fix locally
- [ ] Commit and push
- [ ] Monitor the new workflow run

---

## 🆘 Can't Figure It Out?

If you're stuck:

1. **Copy the exact error message** from GitHub Actions logs
2. **Check if it works locally** - run the same commands on your machine
3. **Compare environments**:
   - Local: Windows, your Node version
   - CI: Ubuntu Linux, Node 20
4. **Search for the error** - paste the error into Google/Stack Overflow
5. **Check the step that failed** - the problem is usually in that specific command

---

## 🎓 Learning from Failures

Every failed pipeline is a learning opportunity:
- ✅ Caught the error before production
- ✅ Learned what can break
- ✅ Improved code quality
- ✅ Better understanding of dependencies

**Remember**: Even experienced developers have failing pipelines. The key is fixing them quickly!

---

## 📞 Common Commands

```powershell
# View recent workflow runs (requires GitHub CLI)
gh run list

# View specific run details
gh run view <run-id>

# Download logs
gh run download <run-id>

# Re-run failed jobs
gh run rerun <run-id> --failed
```

---

## ✅ Current Status

**Last Fix Applied**: Updated cache-dependency-path to remove leading `./`
- ✅ Backend: `apps/nest-backend/package-lock.json`
- ✅ Frontend: `apps/next-frontend/next-frontend-app/package-lock.json`

**Next Workflow**: Should succeed! Check at:
https://github.com/PriyadarshiniSrinivasan/Priyadarshini/actions

---

**Pro Tip**: Always check the workflow run triggered by your latest commit to ensure it passes!
