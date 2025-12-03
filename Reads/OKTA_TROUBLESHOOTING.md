# Okta Authentication Troubleshooting Guide

## Current Issue: Empty Console - Callback Not Loading

If your browser console is completely empty, it means the Okta redirect isn't working properly.

## Step-by-Step Diagnosis

### 1. Verify Your Okta Application Configuration

Go to your Okta Admin Console: `https://integrator-4261294.okta.com/admin`

**Check Application Type:**
1. Applications → Applications
2. Find app with Client ID: `0oax7zvo6vVJM1KMx697`
3. **CRITICAL: Application type MUST be "Single-Page App" (SPA)**
   - If it says "Web" → This is your problem!
   - You need to create a NEW SPA application

**Required Settings for SPA:**
```
Application Type: Single-Page App
Grant Types: 
  ✅ Authorization Code
  ✅ Implicit (Hybrid) - for access token
Login redirect URIs:
  ✅ http://localhost:3001/login/callback
Logout redirect URIs:
  ✅ http://localhost:3001/login
Assignments:
  ✅ Your user must be assigned to THIS app
```

### 2. Check Your Environment Variables

**Frontend (.env.local):**
```bash
NEXT_PUBLIC_OKTA_ISSUER=https://integrator-4261294.okta.com/oauth2/default
NEXT_PUBLIC_OKTA_CLIENT_ID=0oax7zvo6vVJM1KMx697
NEXT_PUBLIC_OKTA_REDIRECT_URI=http://localhost:3001/login/callback
```

**Backend (.env):**
```bash
OKTA_ISSUER=https://integrator-4261294.okta.com/oauth2/default
OKTA_CLIENT_ID=0oax7zvo6vVJM1KMx697
```

### 3. Test the Login Flow

1. **Clear Everything:**
   ```
   Press F12 → Application → Local Storage → Clear All
   Press F12 → Console → Clear console
   ```

2. **Go to login page:**
   ```
   http://localhost:3001/login
   ```

3. **Open Console (F12) BEFORE clicking login**

4. **Click "Sign In with Okta"**

5. **Check Console Output:**
   - You should see: `🚀 Starting Okta login flow...`
   - You should see: `🔧 Full Config: {...}`
   - You should see: `🔄 About to call signInWithRedirect...`
   - Then browser should redirect to Okta

### 4. What Should Happen

**Normal Flow:**
```
1. localhost:3001/login
   ↓ (click login button)
2. Redirect to: integrator-4261294.okta.com/oauth2/.../authorize?...
   ↓ (enter credentials)
3. Redirect to: localhost:3001/login/callback?code=...
   ↓ (process callback)
4. Redirect to: localhost:3001/dashboard
```

### 5. Common Issues & Solutions

#### Issue: "Not allowed to access this app" AFTER entering credentials
**Cause:** User not assigned to the application in Okta
**Solution:** 
1. Okta Admin → Applications → Your App → Assignments
2. Assign → Assign to People → Select your user → Assign → Done

#### Issue: Console stays empty, no redirect happens
**Cause 1:** Application is "Web" type, not "SPA"
**Solution:** Create new SPA application in Okta

**Cause 2:** Redirect URI mismatch
**Solution:** Verify `http://localhost:3001/login/callback` is EXACTLY in Okta app settings

**Cause 3:** Environment variables not loaded
**Solution:** 
- Restart Next.js dev server: `npm run dev`
- Check .env.local file exists in `apps/next-frontend/next-frontend-app/`

#### Issue: Error "invalid_client"
**Cause:** Wrong Client ID
**Solution:** Double-check you copied the Client ID from the SPA app (not Web app)

#### Issue: Error about PKCE
**Cause:** Application not configured for PKCE
**Solution:** Your app must be type "Single-Page App" which enables PKCE automatically

### 6. Verify Your Setup

Run these checks:

**A. Check Frontend Server is Running:**
```powershell
# Should be running on port 3001
# If not, run:
cd apps/next-frontend/next-frontend-app
npm run dev
```

**B. Check Backend Server is Running:**
```powershell
# Should be running on port 3001
# If not, run:
cd apps/nest-backend
npm run start:dev
```

**C. Check .env.local exists:**
```powershell
ls apps/next-frontend/next-frontend-app/.env.local
```

**D. Verify environment variables are loaded:**
Open browser console on login page:
```javascript
console.log(process.env.NEXT_PUBLIC_OKTA_CLIENT_ID)
// Should show: 0oax7zvo6vVJM1KMx697
```

### 7. Create New SPA Application (If Needed)

If your current app is "Web" type, create a new one:

1. Okta Admin → Applications → Create App Integration
2. Sign-in method: **OIDC - OpenID Connect**
3. Application type: **Single-Page Application**
4. App name: `RestaurantPOS-SPA`
5. Grant type: 
   - ✅ Authorization Code
   - ✅ Refresh Token (optional)
6. Sign-in redirect URIs: `http://localhost:3001/login/callback`
7. Sign-out redirect URIs: `http://localhost:3001/login`
8. Controlled access: Choose as needed
9. **Save**
10. Copy the new Client ID
11. Update both .env files with new Client ID
12. Assign users to this new application

### 8. Current Configuration Summary

**Your Okta Domain:** integrator-4261294.okta.com
**Frontend Client ID:** 0oax7zvo6vVJM1KMx697
**Backend Client ID:** 0oax7zvo6vVJM1KMx697 (now unified)
**Redirect URI:** http://localhost:3001/login/callback

---

## Next Steps After Reading This Guide

1. Follow Step 1 to verify your app type
2. If it's not SPA, follow Step 7 to create new SPA app
3. Clear browser data (Step 3.1)
4. Restart both servers
5. Try login with console open (Step 3)
6. Share console output if still having issues
