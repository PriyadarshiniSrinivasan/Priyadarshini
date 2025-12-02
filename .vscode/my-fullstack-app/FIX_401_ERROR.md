# CRITICAL: Fix Okta 401 Error - Grant Type Configuration

## The Problem
You're getting a **401 Unauthorized** error because your Okta SPA application doesn't have the correct grant types enabled.

## Solution: Update Okta Application Settings

### Step 1: Go to Your Okta Application
1. Open Okta Admin Console: https://integrator-4261294.okta.com/admin
2. Click **Applications** → **Applications**
3. Find and click your SPA app with Client ID: `0oax7zvo6vVJM1KMx697`

### Step 2: Edit General Settings
1. Scroll down to **General Settings**
2. Click **Edit** button

### Step 3: Configure Grant Types (CRITICAL!)
Under **Grant type**, make sure these are CHECKED:

```
✅ Authorization Code
✅ Refresh Token (optional, but recommended)
```

**DO NOT check:**
```
❌ Implicit (Hybrid) - Not needed for modern SPAs with PKCE
❌ Client Credentials - Only for server apps
❌ Resource Owner Password - Deprecated
```

### Step 4: Verify Login Redirect URIs
Under **Sign-in redirect URIs**, ensure you have:
```
http://localhost:3001/login/callback
```

**IMPORTANT:** 
- Must be EXACT match (case-sensitive)
- No trailing slash
- Must use `http://` for localhost (not `https://`)

### Step 5: Verify Sign-out Redirect URIs
Under **Sign-out redirect URIs**, add:
```
http://localhost:3001/login
```

### Step 6: Save Changes
Click **Save** at the bottom

### Step 7: Verify Assignments Tab
1. Click the **Assignments** tab
2. Ensure your user is listed
3. If not, click **Assign** → **Assign to People** → Select your user → **Assign** → **Done**

---

## Verify Your Configuration

After making the above changes, verify everything:

### Check 1: Application Type
```
Application type: Single-Page Application (SPA)
```
✅ If it says "Web" → You need to create a NEW app as SPA

### Check 2: Grant Types
```
Grant type allowed: 
  ✅ Authorization Code
  ✅ Refresh Token (optional)
```

### Check 3: Redirect URIs
```
Sign-in redirect URIs:
  ✅ http://localhost:3001/login/callback

Sign-out redirect URIs:
  ✅ http://localhost:3001/login
```

### Check 4: Trusted Origins (Optional but recommended)
1. Go to **Security** → **API** → **Trusted Origins**
2. Click **Add Origin**
3. Fill in:
   - Name: `Localhost Development`
   - Origin URL: `http://localhost:3001`
   - Type: Check both ✅ CORS and ✅ Redirect
4. Click **Save**

---

## After Configuration Changes

### 1. Clear Browser Data
```
Press F12 → Application tab → Local Storage → Right-click → Clear
```

### 2. Restart Frontend Server
```powershell
# Stop current server (Ctrl+C)
cd apps\next-frontend\next-frontend-app
npm run dev
```

### 3. Test Login Flow
1. Open browser in **Incognito/Private mode** (fresh session)
2. Go to: http://localhost:3001/login
3. Open Console (F12)
4. Click "Sign In with Okta"
5. Check console for logs starting with 🚀, 🔧, 🔄

### 4. Expected Console Output
You should see:
```
🚀 Starting Okta login flow...
🔧 Full Config: { issuer: "...", clientId: "...", ... }
🌍 Environment Variables: ...
🔄 About to call signInWithRedirect...
✅ signInWithRedirect called (you should be redirecting now...)
```

Then browser redirects to Okta login page.

---

## If Still Getting 401 Error

### Check Browser Network Tab:
1. Open DevTools (F12)
2. Go to **Network** tab
3. Click "Sign In with Okta"
4. Look for failed request (red, status 401)
5. Click on it
6. Check **Response** tab for error details

### Common 401 Error Reasons:

**Error: "invalid_client"**
- ✅ Wrong Client ID
- ✅ App is not SPA type
- ✅ PKCE not enabled

**Error: "invalid_grant"**
- ✅ Grant type not enabled
- ✅ Authorization Code grant not checked

**Error: "invalid_scope"**
- ✅ Scopes not configured in Okta app
- ✅ Try removing 'email' scope, use only: ['openid', 'profile']

**Error: "redirect_uri_mismatch"**
- ✅ URL in .env.local doesn't match Okta settings
- ✅ Check for typos, trailing slashes, http vs https

---

## Environment Variables Check

Make sure your `.env.local` file has EXACTLY:
```bash
NEXT_PUBLIC_OKTA_ISSUER=https://integrator-4261294.okta.com/oauth2/default
NEXT_PUBLIC_OKTA_CLIENT_ID=0oax7zvo6vVJM1KMx697
NEXT_PUBLIC_OKTA_REDIRECT_URI=http://localhost:3001/login/callback
```

**Location:** `apps/next-frontend/next-frontend-app/.env.local`

---

## Debug: Check if Environment Variables are Loaded

Open browser console on login page and type:
```javascript
console.log('ISSUER:', process.env.NEXT_PUBLIC_OKTA_ISSUER)
console.log('CLIENT_ID:', process.env.NEXT_PUBLIC_OKTA_CLIENT_ID)
console.log('REDIRECT:', process.env.NEXT_PUBLIC_OKTA_REDIRECT_URI)
```

Should output:
```
ISSUER: https://integrator-4261294.okta.com/oauth2/default
CLIENT_ID: 0oax7zvo6vVJM1KMx697
REDIRECT: http://localhost:3001/login/callback
```

If it shows `undefined`, your .env.local file is not being loaded!

---

## Summary Checklist

- [ ] App type is Single-Page Application (SPA)
- [ ] Grant type: Authorization Code is CHECKED
- [ ] Sign-in redirect URI: `http://localhost:3001/login/callback` is added
- [ ] User is assigned to the application
- [ ] .env.local exists in `apps/next-frontend/next-frontend-app/`
- [ ] Environment variables have correct values
- [ ] Frontend server restarted after .env changes
- [ ] Browser data cleared
- [ ] Testing in incognito/private window

After completing this checklist, the 401 error should be resolved.
