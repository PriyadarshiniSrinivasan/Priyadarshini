# CREATE NEW OKTA SPA APPLICATION - STEP BY STEP

Since all troubleshooting failed, let's create a completely new application with minimal configuration.

## Step 1: Create New SPA Application

1. Go to: **Applications → Applications**
2. Click **"Create App Integration"**
3. Select:
   ```
   Sign-in method: OIDC - OpenID Connect
   Application type: Single-Page Application
   ```
4. Click **"Next"**

---

## Step 2: Configure Basic Settings

Fill in these EXACT settings:

```
App integration name: RestaurantPOS-Fresh

Grant type:
  ✅ Authorization Code
  ❌ UNCHECK everything else (especially Interaction Code!)

Sign-in redirect URIs:
  http://localhost:3001/login/callback

Sign-out redirect URIs:
  http://localhost:3001/login

Controlled access:
  ⚪ Allow everyone in your organization to access
  (Select this option!)
```

Click **"Save"**

---

## Step 3: Copy the New Client ID

After saving, you'll see:
```
Client ID: 0oaXXXXXXXXXXXXXXXXX
```

**Copy this Client ID**

---

## Step 4: Configure Additional Settings

1. Click **"Edit"** in General Settings
2. Scroll down and verify:

```
User consent: Not required

Application visibility:
  ✅ Display application icon to users
  ✅ Display application icon in the Okta Mobile app

Login:
  Login initiated by: Either Okta or App
  Application visibility: Display application icon to users
  Login flow: Redirect to app to initiate login flow
```

3. Click **"Save"**

---

## Step 5: Set Authentication Policy

1. Click **"Sign On"** tab
2. Under **"Sign On Policy"**, select your password-only policy
3. Click **"Edit"** if needed and save

---

## Step 6: Verify User Assignment

1. Go to **"Assignments"** tab
2. Should already show "Everyone" or your user (from "Allow everyone" setting)
3. If not, click **"Assign"** → **"Assign to People"** → Select your user → **"Assign"** → **"Done"**

---

## Step 7: Update Your .env.local

Open: `apps/next-frontend/next-frontend-app/.env.local`

Update the Client ID:
```bash
NEXT_PUBLIC_OKTA_ISSUER=https://integrator-4261294.okta.com/oauth2/default
NEXT_PUBLIC_OKTA_CLIENT_ID=<NEW_CLIENT_ID_HERE>
NEXT_PUBLIC_OKTA_REDIRECT_URI=http://localhost:3001/login/callback
```

---

## Step 8: Update Backend .env

Open: `apps/nest-backend/.env`

Update the Client ID:
```bash
OKTA_ISSUER=https://integrator-4261294.okta.com/oauth2/default
OKTA_CLIENT_ID=<NEW_CLIENT_ID_HERE>
```

---

## Step 9: Restart Everything

```powershell
# Stop all running servers (Ctrl+C in all terminals)

# Clear browser completely
# In browser console: localStorage.clear(); sessionStorage.clear();

# Restart backend
cd apps/nest-backend
npm run start:dev

# In another terminal, restart frontend
cd apps/next-frontend/next-frontend-app
npm run dev
```

---

## Step 10: Test the New App

1. **Close browser completely**
2. **Open in Incognito mode**
3. **Go to:** `http://localhost:3001/login`
4. **Click "Sign In with Okta"**
5. **Enter your credentials**

---

## Why This Should Work:

The new app will have:
- ✅ Clean configuration (no accumulated settings issues)
- ✅ "Allow everyone" access (no assignment problems)
- ✅ Simplest possible grant type (Authorization Code only)
- ✅ No interaction code (avoids IDX issues)
- ✅ No leftover policies or rules

---

## If This STILL Doesn't Work:

Then the issue is either:

1. **Your Okta org has global restrictions** that prevent ANY app from working
   - Contact your Okta admin
   - Check if there are org-level policies blocking access

2. **Your user account has specific restrictions**
   - Try creating a test user (as mentioned in DEBUG_PASSWORD_ISSUE.md)
   - See if the test user can log in

3. **Network/proxy issues**
   - Check if you're behind a corporate firewall
   - Try from a different network

---

## Alternative: Use Okta Developer Account

If your current Okta org has restrictions, create a FREE developer account:

1. Go to: https://developer.okta.com/signup/
2. Sign up for free developer account
3. You'll get a fresh Okta org: `dev-XXXXX.okta.com`
4. Create app there with same settings above
5. Update your .env files with the new dev org details

This will have NO enterprise restrictions and should work immediately.

---

After creating the new app, share:
- ✅ New Client ID (so I can verify it's different)
- ✅ What happens when you try to log in
- ✅ Any error messages

This fresh start should eliminate all the accumulated configuration issues.
