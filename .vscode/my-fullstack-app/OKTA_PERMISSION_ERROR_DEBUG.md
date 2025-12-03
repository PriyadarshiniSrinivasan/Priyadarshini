# 🚨 TROUBLESHOOTING: "No Permission" Error - Detailed Steps

## Current Configuration
- **Okta Domain**: `integrator-4261294.okta.com`
- **Client ID**: `0oax7w7xgcVezcTC2697`
- **Redirect URI**: `http://localhost:3001/login/callback`

---

## Step-by-Step Verification

### 1️⃣ **FIRST: Verify Your Application in Okta Admin Console**

1. **Log into Okta Admin Console**:
   - Go to: https://integrator-4261294-admin.okta.com
   - Or: https://integrator-4261294.okta.com/admin

2. **Find Your Application**:
   - Click **Applications** → **Applications** in left sidebar
   - Look for the app with Client ID: `0oax7w7xgcVezcTC2697`
   - Click on it to open

3. **Check Application Type** (Most Common Issue):
   ```
   General Tab → App integration type
   
   ❌ WRONG: "OIDC - OpenID Connect: Web Application"
   ✅ CORRECT: "OIDC - OpenID Connect: Single-Page Application"
   ```

   **If it shows "Web Application":**
   - You CANNOT change the type of an existing app
   - You MUST create a NEW application (see Step 2 below)

### 2️⃣ **CREATE NEW SINGLE-PAGE APPLICATION** (If current app is wrong type)

1. **Start New App Creation**:
   - Applications → **Create App Integration**

2. **Select Options**:
   ```
   Sign-in method: ✅ OIDC - OpenID Connect
   Application type: ✅ Single-Page Application
   ```
   - Click **Next**

3. **Configure Application Settings**:
   ```
   App integration name: RestaurantPOS-SPA
   
   Grant type:
   ✅ Authorization Code (MUST be checked)
   ✅ Refresh Token (optional)
   ❌ Implicit (hybrid) - UNCHECK this
   ❌ Client Credentials - UNCHECK this
   
   Sign-in redirect URIs:
   http://localhost:3001/login/callback
   
   Sign-out redirect URIs:
   http://localhost:3001/login
   http://localhost:3001
   
   Controlled access:
   ✅ Allow everyone in your organization to access
   ```

4. **IMPORTANT - Verify PKCE**:
   - Scroll down and make sure you see:
   ```
   Client authentication: None (Use PKCE)
   ```
   - This confirms it's correctly set up as SPA

5. **Save Application**

6. **Copy the NEW Client ID**:
   - You'll see it in the "Client Credentials" section
   - Example: `0oaXXXXXXXXXXXXXX` (20 characters)

### 3️⃣ **ASSIGN YOURSELF TO THE APPLICATION**

1. **In your new application**:
   - Go to **Assignments** tab
   - Click **Assign** → **Assign to People**
   - Find your username
   - Click **Assign** button next to your name
   - Click **Save and Go Back**
   - Click **Done**

### 4️⃣ **UPDATE YOUR .env.local FILE**

Open: `apps/next-frontend/next-frontend-app/.env.local`

Replace with the NEW Client ID:
```bash
NEXT_PUBLIC_OKTA_ISSUER=https://integrator-4261294.okta.com/oauth2/default
NEXT_PUBLIC_OKTA_CLIENT_ID=YOUR-NEW-CLIENT-ID-HERE
NEXT_PUBLIC_OKTA_REDIRECT_URI=http://localhost:3001/login/callback
```

### 5️⃣ **RESTART YOUR DEVELOPMENT SERVER**

**CRITICAL: You MUST restart after changing .env files**

```powershell
# In your terminal where the app is running:
# 1. Press Ctrl+C to stop the server
# 2. Then run:
npm run dev
```

### 6️⃣ **CLEAR BROWSER CACHE**

1. Open browser (where you're testing)
2. Press **F12** to open Developer Tools
3. Go to **Application** tab (or Storage in Firefox)
4. Click **Local Storage** → **http://localhost:3001**
5. Right-click and select **Clear**
6. Close Developer Tools
7. Press **Ctrl+Shift+R** (hard refresh)

### 7️⃣ **TEST AGAIN WITH DEBUG INFO**

1. Go to: http://localhost:3001/login
2. Press **F12** to open Console
3. Click "Sign In with Okta"
4. **Look at the console output** - you should see:
   ```
   🚀 Starting Okta login flow...
   🔧 Full Config: {
     "issuer": "https://integrator-4261294.okta.com/oauth2/default",
     "clientId": "0oaXXXXXXXXXXXXXX",
     "redirectUri": "http://localhost:3001/login/callback",
     "pkce": true,
     ...
   }
   🌍 Environment Variables:
     NEXT_PUBLIC_OKTA_ISSUER: https://integrator-4261294.okta.com/oauth2/default
     NEXT_PUBLIC_OKTA_CLIENT_ID: 0oaXXXXXXXXXXXXXX
     NEXT_PUBLIC_OKTA_REDIRECT_URI: http://localhost:3001/login/callback
   ```

5. **If you get an error, note the error code** and look below:

---

## 🔍 Common Error Codes and Solutions

### Error: "You do not have permission to access the feature you are requesting"
**Cause**: Application is configured as "Web Application" not "Single-Page Application"
**Solution**: Create a new SPA application (Step 2 above)

### Error: "invalid_client"
**Cause**: Client ID is wrong or from wrong app type
**Solution**: Double-check you're using the Client ID from the SPA app, not Web app

### Error: "redirect_uri_mismatch"
**Cause**: Redirect URI in code doesn't match Okta settings
**Solution**: 
- Verify in Okta: exactly `http://localhost:3001/login/callback`
- No trailing slash, no https

### Error: "invalid_request: PKCE required"
**Cause**: Okta app requires PKCE but it's not enabled in code
**Solution**: Check that `pkce: true` in config (already set in our code)

---

## 🎯 Verification Checklist

After completing all steps, verify:

- [ ] Okta application type is **"Single-Page Application"** (not Web)
- [ ] Client authentication shows **"None (Use PKCE)"**
- [ ] Grant type **"Authorization Code"** is checked
- [ ] Redirect URI is **exactly**: `http://localhost:3001/login/callback`
- [ ] You are assigned to the application
- [ ] `.env.local` has the NEW Client ID from SPA app
- [ ] Development server has been **restarted**
- [ ] Browser cache and localStorage have been **cleared**
- [ ] No other tabs have the app open with old cache

---

## 📸 What You Should See in Okta

When you open your application in Okta Admin Console, the General tab should show:

```
App integration name: RestaurantPOS-SPA (or your chosen name)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

App integration type: OIDC - OpenID Connect
Client ID: 0oaXXXXXXXXXXXXXX

General Settings:
  Application type: Single-Page Application ✅
  Grant type: Authorization Code ✅
  Sign-in redirect URIs: http://localhost:3001/login/callback
  Sign-out redirect URIs: http://localhost:3001/login
  Client authentication: None (Use PKCE) ✅
```

---

## 🆘 Still Not Working?

If you still get the error after following ALL steps above:

1. **Take a screenshot** of:
   - Your Okta application's General tab (hide the Client Secret if visible)
   - The browser console error message

2. **Verify these exact values match**:
   - Okta Client ID (from Admin Console)
   - .env.local Client ID
   - Make sure there are no extra spaces or quotes

3. **Try in Incognito/Private Window**:
   - Open a new private/incognito window
   - Go to http://localhost:3001/login
   - This ensures no cached data

4. **Check Okta System Logs**:
   - Okta Admin Console → **Reports** → **System Log**
   - Look for authentication attempts
   - Click on any errors to see detailed messages

---

## 💡 Pro Tip: The Client ID is the Key

The most common issue is using a Client ID from a **Web Application** in code designed for a **Single-Page Application**. They are NOT interchangeable!

- Web App Client ID ❌ → Will give "no permission" error with PKCE code
- SPA Client ID ✅ → Works correctly with PKCE code

Make absolutely sure you're using the Client ID from your **Single-Page Application**!
