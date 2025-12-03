# IMMEDIATE FIX: IDX 401/400 Error

## The Exact Problem
When you go to Okta's login page, it's using Identity Engine's IDX flow which is failing.

## The Fix (Do This Right Now)

### 1. Go to Okta Admin
https://integrator-4261294.okta.com/admin/apps/active

### 2. Find Your Application
Client ID: `0oax7zvo6vVJM1KMx697`

### 3. Click on the Application Name

### 4. Click "General" Tab

### 5. Scroll to "Grant types" Section

### 6. Click "Edit" Button

### 7. CHECK ONLY THESE:
```
✅ Authorization Code
✅ Refresh Token (optional)
```

### 8. UNCHECK THESE IF CHECKED:
```
❌ Interaction Code  <-- THIS IS CAUSING YOUR ERROR!
❌ Implicit (Hybrid)
❌ Device Authorization
❌ Client Credentials
```

### 9. Click "Save"

### 10. Test Again
1. Clear browser data: `localStorage.clear()` in console
2. Close browser
3. Open in Incognito mode
4. Go to http://localhost:3001/login
5. Click "Sign In with Okta"

---

## What to Expect After Fix

**BEFORE (Current - Broken):**
- Click login → Redirect to Okta
- See complex embedded widget
- Enter credentials → 401/400 error on `/idp/idx/challenge/answer`

**AFTER (Fixed):**
- Click login → Redirect to Okta  
- See simple classic login form
- Enter credentials → Success → Redirect back to your app

---

## Alternative: Check "Interaction Code" Setting

If you don't see "Interaction Code" in Grant types, check this:

### Security → API → Authorization Servers
1. Click "default"
2. Check if "Interaction Code" is globally enabled
3. If yes, it might be forcing IDX flow

---

## If Still Not Working: Create Brand New SPA App

The safest approach:

1. Applications → Create App Integration
2. OIDC - OpenID Connect
3. Single-Page Application
4. Name: `RestaurantPOS-Simple`
5. Grant type: **ONLY Authorization Code** (uncheck everything else!)
6. Redirect: `http://localhost:3001/login/callback`
7. Save
8. Copy new Client ID
9. Update .env.local with new Client ID
10. Assign your user to new app
11. Test

This ensures no IDX/Identity Engine complications.
