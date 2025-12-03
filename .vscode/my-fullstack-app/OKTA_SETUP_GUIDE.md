# Step-by-Step Guide: Setting Up Okta Authentication After Account Creation

## 📋 Overview
This guide walks you through the complete setup process after creating your Okta developer account.

---

## 🎯 STEP 1: Create Your Okta Application

### 1.1 Access Your Okta Admin Dashboard
1. Log into your Okta developer account at: **https://developer.okta.com**
2. You'll see your Okta domain (e.g., `dev-12345678.okta.com`) - **Write this down!**
3. Click on **"Admin"** button in the top right to access the Admin Console

### 1.2 Create a New Application
1. In the left sidebar, click **Applications** → **Applications**
2. Click the **"Create App Integration"** button
3. You'll see a modal with options:
   - Select: **"OIDC - OpenID Connect"**
   - Select: **"Single-Page Application"** (SPA)
4. Click **"Next"**

### 1.3 Configure Application Settings
Fill out the form with these settings:

**General Settings:**
- **App integration name**: `RestaurantPOS` (or your preferred name)
- **Logo**: Optional - you can upload your app logo

**Sign-in redirect URIs:**
```
http://localhost:3001/login/callback
http://localhost:3001/implicit/callback
```

**Sign-out redirect URIs:**
```
http://localhost:3001
http://localhost:3001/login
```

**Controlled access:**
- Select: **"Allow everyone in your organization to access"**
- Or choose specific groups if you prefer

**Grant types:**
- ✅ Authorization Code
- ✅ Refresh Token (optional)
- ✅ Implicit (hybrid) - optional

Click **"Save"** button at the bottom.

---

## 🔑 STEP 2: Get Your Okta Configuration Values

### 2.1 Get Client ID
After creating the app, you'll be on the application page:
1. Look for the **"General"** tab (should be selected by default)
2. Find the **"Client Credentials"** section
3. Copy the **"Client ID"** value
   - It looks like: `0oaxisgknhpVfZfAP697`
   - **Save this - you'll need it soon!**

### 2.2 Get Issuer URL
1. In the left sidebar, click **Security** → **API**
2. You'll see a list of Authorization Servers
3. Find the **"default"** authorization server
4. Copy the **"Issuer URI"** value
   - It looks like: `https://dev-12345678.okta.com/oauth2/default`
   - **Save this - you'll need it soon!**

### 2.3 Summary of Values You Need
Write these down:
```
OKTA_DOMAIN: https://dev-12345678.okta.com
OKTA_ISSUER: https://dev-12345678.okta.com/oauth2/default
OKTA_CLIENT_ID: 0oaxisgknhpVfZfAP697
```

---

## 🔧 STEP 3: Configure Frontend Environment Variables

### 3.1 Create Frontend .env.local File
1. Navigate to: `apps/next-frontend/next-frontend-app/`
2. Create a new file named: `.env.local`
3. Add the following content (replace with YOUR actual values):

```bash
# Okta Configuration - Frontend
NEXT_PUBLIC_OKTA_ISSUER=https://dev-12345678.okta.com/oauth2/default
NEXT_PUBLIC_OKTA_CLIENT_ID=0oaxisgknhpVfZfAP697
NEXT_PUBLIC_OKTA_REDIRECT_URI=http://localhost:3001/login/callback

# Legacy API (if still using)
NEXT_PUBLIC_API_BASE=http://localhost:3001
```

**Important Notes:**
- Replace `dev-12345678.okta.com` with YOUR actual Okta domain
- Replace `0oaxisgknhpVfZfAP697` with YOUR actual Client ID
- All frontend variables MUST start with `NEXT_PUBLIC_`

---

## 🔧 STEP 4: Configure Backend Environment Variables

### 4.1 Update Backend .env File
1. Navigate to: `apps/nest-backend/`
2. Open or create the file: `.env`
3. Add the following content (replace with YOUR actual values):

```bash
# Okta Configuration - Backend
OKTA_ISSUER=https://dev-12345678.okta.com/oauth2/default
OKTA_CLIENT_ID=0oaxisgknhpVfZfAP697

# Database Configuration (keep existing)
DATABASE_URL="postgresql://restaurant_user:restaurant_pass@localhost:5432/restaurant_db?schema=public"

# Legacy JWT (keep for backward compatibility)
JWT_SECRET=your-super-secret-jwt-key
```

**Important Notes:**
- Backend variables do NOT need `NEXT_PUBLIC_` prefix
- Keep your existing DATABASE_URL unchanged
- Keep JWT_SECRET for backward compatibility

---

## 👥 STEP 5: Create Test Users in Okta

### 5.1 Add Your First User
1. In Okta Admin Console, go to **Directory** → **People**
2. Click **"Add Person"** button
3. Fill in the form:
   - **First name**: Your first name
   - **Last name**: Your last name
   - **Username**: Your email (e.g., `admin@example.com`)
   - **Primary email**: Same as username
   - **Password**: Choose one of:
     - **Set by admin**: Enter a password you'll remember
     - **Send activation email**: User will set their own password
4. Check: ✅ **"User must change password on first login"** (optional)
5. Click **"Save"**

### 5.2 Assign User to Your Application
1. Go to **Applications** → **Applications**
2. Click on your **"RestaurantPOS"** application
3. Click the **"Assignments"** tab
4. Click **"Assign"** → **"Assign to People"**
5. Find your user and click **"Assign"** next to their name
6. Click **"Save and Go Back"**
7. Click **"Done"**

---

## 🚀 STEP 6: Test Your Setup

### 6.1 Start Your Servers
Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd apps/nest-backend
npm install  # If not done already
npm run start:dev
```
Wait for: `Application is running on: http://[::1]:3001`

**Terminal 2 - Frontend:**
```bash
cd apps/next-frontend/next-frontend-app
npm install  # If not done already
npm run dev
```
Wait for: `- Local: http://localhost:3001`

### 6.2 Test Okta Login Flow
1. Open browser to: **http://localhost:3001/login**
2. You should see the new Okta login page with "Sign In with Okta" button
3. Click **"Sign In with Okta"**
4. You'll be redirected to Okta's login page
5. Enter your Okta username and password
6. If MFA is enabled, complete the MFA challenge
7. You'll be redirected back to: **http://localhost:3001/login/callback**
8. After processing, you'll be redirected to: **http://localhost:3001/dashboard**

### 6.3 Verify Authentication Worked
Check your browser's Developer Console (F12):
- Look for: ✅ `User already authenticated: your-email@example.com`
- Look for: ✅ `Okta authentication successful`

Check localStorage (in Developer Console → Application → Local Storage):
- Should see: `oktaUser` with your user information
- Should see: `oktaAccessToken` with your access token

---

## 🔍 STEP 7: Test API Protection

### 7.1 Get Your Access Token
1. Open browser Developer Console (F12)
2. Go to **Application** → **Local Storage** → **http://localhost:3001**
3. Find the `oktaAccessToken` key
4. Copy its value (long string starting with `eyJ...`)

### 7.2 Test Protected API Endpoint
Open a new terminal and test with curl (or use Postman):

```bash
# Replace YOUR_TOKEN_HERE with the actual token from localStorage
curl -X GET http://localhost:3001/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "name": "Admin User"
  }
}
```

### 7.3 Test Token Verification Endpoint
```bash
curl -X POST http://localhost:3001/auth/verify-okta-token \
  -H "Content-Type: application/json" \
  -d '{"accessToken":"YOUR_TOKEN_HERE"}'
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "name": "Admin User",
    "oktaId": "00u1a2b3c4d5e6f7g8h9"
  },
  "message": "Okta token verified successfully"
}
```

---

## 🔐 STEP 8: Enable Multi-Factor Authentication (Optional)

### 8.1 Configure MFA in Okta
1. Go to **Security** → **Authenticators**
2. You'll see available authenticators:
   - **Okta Verify**: Mobile app (recommended)
   - **Google Authenticator**: TOTP app
   - **SMS Authentication**: Text message codes
   - **Email Authentication**: Email codes
3. Click **"Add Authenticator"** to enable more options
4. Click **"Edit"** on each authenticator to configure enrollment

### 8.2 Set MFA Policy
1. Go to **Security** → **Authentication Policies**
2. Click on the **"Default Policy"** or create a new one
3. Click **"Add Rule"**
4. Configure:
   - **Rule name**: "Require MFA"
   - **Prompt for factor**: Every sign in
   - **Require MFA**: Yes
   - Click **"Save"**

### 8.3 Test MFA
1. Log out from your application
2. Try logging in again
3. After entering password, you'll be prompted to set up MFA
4. Follow the on-screen instructions to enroll
5. Complete the MFA challenge

---

## 🌐 STEP 9: Update for Production (When Ready)

### 9.1 Add Production Redirect URIs
1. Go to **Applications** → **Your App** → **General**
2. Add your production URLs to redirect URIs:
```
https://yourdomain.com/login/callback
https://yourdomain.com/implicit/callback
```
3. Add to sign-out redirect URIs:
```
https://yourdomain.com
https://yourdomain.com/login
```

### 9.2 Update Environment Variables
Update your production environment variables:
```bash
# Production Frontend
NEXT_PUBLIC_OKTA_ISSUER=https://dev-12345678.okta.com/oauth2/default
NEXT_PUBLIC_OKTA_CLIENT_ID=0oaxisgknhpVfZfAP697
NEXT_PUBLIC_OKTA_REDIRECT_URI=https://yourdomain.com/login/callback

# Production Backend
OKTA_ISSUER=https://dev-12345678.okta.com/oauth2/default
OKTA_CLIENT_ID=0oaxisgknhpVfZfAP697
```

---

## 🐛 Troubleshooting Common Issues

### Issue 1: "Redirect URI mismatch" Error
**Problem**: Okta rejects the redirect after login
**Solution**:
1. Check that redirect URI in Okta matches exactly: `http://localhost:3001/login/callback`
2. No trailing slashes
3. Protocol must match (http vs https)

### Issue 2: "Invalid Client ID" Error
**Problem**: Okta doesn't recognize your application
**Solution**:
1. Double-check Client ID in environment variables
2. Ensure no extra spaces or quotes
3. Restart your development servers after changing .env files

### Issue 3: "CORS Error" in Browser
**Problem**: Backend rejects requests from frontend
**Solution**:
1. Check that backend CORS is configured to allow localhost:3001
2. Verify backend is running on port 3001
3. Check browser console for actual error message

### Issue 4: Token Verification Fails
**Problem**: Backend can't verify Okta token
**Solution**:
1. Verify OKTA_ISSUER in backend .env matches exactly
2. Check that issuer includes `/oauth2/default`
3. Ensure @okta/jwt-verifier package is installed

### Issue 5: User Not Found After Login
**Problem**: Authentication works but user not in database
**Solution**:
1. Check backend logs for user creation messages
2. Verify database connection is working
3. Check Prisma schema allows user creation

---

## ✅ Verification Checklist

Use this checklist to ensure everything is configured correctly:

- [ ] Okta developer account created
- [ ] Okta application created (Single-Page App type)
- [ ] Client ID copied and saved
- [ ] Issuer URL copied and saved
- [ ] Frontend .env.local file created with correct values
- [ ] Backend .env file updated with correct values
- [ ] Test user created in Okta
- [ ] Test user assigned to application
- [ ] Both servers (frontend + backend) running
- [ ] Can access login page at http://localhost:3001/login
- [ ] "Sign In with Okta" button visible
- [ ] Clicking button redirects to Okta
- [ ] Can log in with test user credentials
- [ ] Redirected back to application after login
- [ ] Dashboard loads successfully
- [ ] oktaUser in localStorage contains user info
- [ ] oktaAccessToken in localStorage contains token
- [ ] Protected API endpoints work with token
- [ ] Token verification endpoint returns user data

---

## 📞 Getting Help

If you encounter issues:

1. **Check Backend Logs**: Look for error messages in your backend terminal
2. **Check Browser Console**: Look for errors in developer console (F12)
3. **Review Okta Logs**: 
   - Okta Admin Console → Reports → System Log
   - Shows all authentication attempts and errors
4. **Test Components Individually**:
   - Test Okta login separately
   - Test backend token verification separately
   - Test frontend-backend connection separately

---

## 🎉 Success!

Once you complete all these steps, you'll have:
- ✅ Professional Okta SSO authentication
- ✅ Enterprise-grade security
- ✅ Multi-Factor Authentication capability
- ✅ Centralized user management
- ✅ Single Sign-On across applications
- ✅ Full backward compatibility with legacy system

**Your RestaurantPOS application is now secured with enterprise authentication!**