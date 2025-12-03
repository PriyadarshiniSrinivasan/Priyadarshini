# FINAL SOLUTION: IDX Error with Correct Grant Types

Since your grant types are already correct but you're still getting `/idp/idx/` errors, the issue is Okta's **Sign-On Policy** or **Authentication Policy**.

## Solution: Check Authentication Authenticator Settings

### Step 1: Go to Your Application in Okta
https://integrator-4261294.okta.com/admin/apps/active

### Step 2: Click on Your App (0oax7zvo6vVJM1KMx697)

### Step 3: Go to "Sign On" Tab (Not "General")

### Step 4: Look for "User authentication"

You should see one of these:

**Option A: "Use Okta Fastpass, password, or second factor"**
```
If you see this → Your app is using Identity Engine
```

**Option B: "Password only" or "Password / IDP / No Password"**  
```
This is classic auth (what we want)
```

### Step 5: If Using Identity Engine, Check This Setting

Look for: **"Authentication policy"**

It might say:
- Default Policy
- Passwordless Policy  
- Something with "Identity Engine"

### Step 6: Change to Simpler Policy

If available, select: **"Password only"** or **"Any one factor"**

---

## Alternative: Disable Okta Verify Requirement

The IDX error often happens when **Okta Verify** or other authenticators are required.

### Check Your App's Sign-On Policy:

1. In your app, click **"Sign On"** tab
2. Under **"Sign On Policy"**, click the policy name
3. Click **"Edit"** on the rule
4. Under **"Actions"**, look for **"Authenticator requirements"**
5. Change from **"Okta Verify"** to **"Password"** or **"Any factor"**
6. Save

---

## Check Global Authenticator Settings

### Go to: Security → Authenticators

1. Click **"Authenticators"**
2. Look at **"Enrollment"** tab
3. See if **Okta Verify** is set to **"Required"**
4. If yes, this might be forcing IDX flow

You can't change this globally, but you can configure your app policy to not require it.

---

## Create New App with Classic Experience

If nothing above works, your Okta org is forcing Identity Engine. Create a workaround:

### Step 1: Contact Okta Support or Admin

Ask them to create a **Classic Engine application** for you, or check if your org can be switched to **Classic Engine mode** for this specific app.

### Step 2: Or Create New Integration Type

Instead of using the Okta widget/hosted page:

1. Use **"API Services"** application type instead of SPA
2. Then manually implement OAuth flow
3. This bypasses the hosted login page completely

---

## Try This: Add Trusted Origin FIRST

Before creating new apps, try this:

### Security → API → Trusted Origins → Add Origin

```
Name: Localhost Dev
Origin URL: http://localhost:3001
Type: ✅ CORS  ✅ Redirect
```

Then **restart your test**.

---

## Test with the Simple OAuth Page

I created a test page for you. Try this:

1. Restart your frontend:
```powershell
cd apps\next-frontend\next-frontend-app
npm run dev
```

2. Go to:
```
http://localhost:3001/okta-test
```

3. Click the test button

4. **Watch what Okta page loads:**
   - If you see a SIMPLE username/password form → Good!
   - If you see a complex widget with multiple options → IDX is forced

5. Try logging in from that simple form

This will tell us if the issue is in the Okta SDK or in Okta's configuration.

---

## If Simple Form Works But SDK Doesn't

Then the issue is in `@okta/okta-auth-js` version. Try downgrading:

```powershell
cd apps\next-frontend\next-frontend-app
npm uninstall @okta/okta-auth-js
npm install @okta/okta-auth-js@6.7.0
```

Older versions don't use IDX by default.

---

## Last Resort: Skip Okta Hosted Page Entirely

Use **Okta Sign-In Widget** in your app instead of redirect:

```powershell
npm install @okta/okta-signin-widget
```

Then you control the authentication UI in your React app, not Okta's page.

But this is more complex and not recommended for beginners.

---

## Action Plan

1. ✅ Check "Sign On" tab authentication policy
2. ✅ Add Trusted Origin (if not already there)  
3. ✅ Test with `/okta-test` page to see which login form appears
4. ✅ If still failing, try downgrading okta-auth-js to v6.7.0
5. ✅ Share screenshot of what login page you see on Okta's side

The test page will help us determine if this is a configuration or SDK issue.
