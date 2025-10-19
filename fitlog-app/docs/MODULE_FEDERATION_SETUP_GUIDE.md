# Module Federation Setup Guide - FitLog as Host

**Date:** October 19, 2025  
**Purpose:** Step-by-step guide for configuring FitLog as Module Federation host

---

## 🎯 What We're Doing

Converting FitLog from a standalone app to a **Module Federation Host** that can load remote micro frontends (like Streaks, Fasting, etc.)

---

## 📦 Step 1: Install Module Federation

```bash
npm install @angular-architects/module-federation --save
```

**What this does:**
- Installs the Module Federation library for Angular
- Provides webpack configuration helpers
- Enables dynamic remote loading

**Package added to `package.json`:**
```json
"@angular-architects/module-federation": "^20.0.0"
```

---

## ⚙️ Step 2: Create webpack.config.js

**File:** `webpack.config.js` (root of fitlog-app)

```javascript
const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({
  name: 'fitlog',  // Name of this app
  
  remotes: {
    // Remote MFEs will be added here
    // "streaks": "http://localhost:4201/remoteEntry.js",
  },

  shared: {
    ...shareAll({ 
      singleton: true,      // Only one instance of each library
      strictVersion: true,  // Enforce version matching
      requiredVersion: 'auto' 
    }),
  },

  // Expose services for remotes to use
  exposes: {
    './UserService': './src/app/core/services/user.service.ts',
    './StorageService': './src/app/core/services/storage.service.ts',
    './ThemeService': './src/app/core/services/theme.service.ts',
  },
});
```

**What each part does:**

### **`name: 'fitlog'`**
- Identifies this app in the Module Federation network
- Other MFEs can reference it by this name

### **`remotes: {}`**
- Lists all remote MFEs this host can load
- Currently empty - we'll add Streaks MFE here later
- Format: `"remoteName": "url/to/remoteEntry.js"`

### **`shared: {}`**
- Defines which libraries are shared between host and remotes
- `shareAll()` shares all dependencies from package.json
- `singleton: true` means only ONE instance of Angular, RxJS, etc.
- Prevents duplicate libraries in browser

### **`exposes: {}`**
- Makes FitLog services available to remote MFEs
- Streaks MFE can import UserService from FitLog
- Enables shared authentication and data

---

## 🔧 Step 3: Update angular.json

Changed the builder from `browser-esbuild` to Module Federation builder:

### **Before:**
```json
"build": {
  "builder": "@angular-devkit/build-angular:browser-esbuild",
  "options": {
    ...
  }
}
```

### **After:**
```json
"build": {
  "builder": "@angular-architects/module-federation:browser",
  "options": {
    "extraWebpackConfig": "webpack.config.js",  // ← Use our webpack config
    ...
  }
}
```

**Why this change?**
- Angular 20 uses esbuild by default (faster, but no Module Federation support)
- Module Federation requires webpack
- We switch to webpack builder with our custom config

### **Serve Configuration:**
```json
"serve": {
  "builder": "@angular-architects/module-federation:dev-server",
  "options": {
    "buildTarget": "fitlog-app:build:development",
    "port": 4200"  // ← FitLog runs on port 4200
  }
}
```

---

## 🚀 Step 4: Test the Setup

```bash
cd fitlog-app
npm start
```

**Expected output:**
```
✔ Browser application bundle generation complete.
✔ Compiled successfully.
** Angular Live Development Server is listening on localhost:4200 **
```

**What to verify:**
- ✅ App builds without errors
- ✅ App runs on http://localhost:4200
- ✅ Existing features still work (weight tracker, charts, profile)
- ✅ No console errors

---

## 📋 What Changed in FitLog?

### **Files Added:**
- ✅ `webpack.config.js` - Module Federation configuration

### **Files Modified:**
- ✅ `angular.json` - Changed builders to support webpack
- ✅ `package.json` - Added Module Federation dependency

### **Files Unchanged:**
- ✅ All source code (`src/` directory)
- ✅ All components, services, models
- ✅ All existing features

**Result:** FitLog works exactly the same, but now it can load remote MFEs!

---

## 🎯 Next Steps

### **Step 5: Create Streaks MFE (Next)**
```bash
cd ..
ng new fitlog-streaks-mfe --standalone --routing --style=scss
cd fitlog-streaks-mfe
npm install @angular-architects/module-federation
```

### **Step 6: Configure Streaks as Remote**
- Create webpack.config.js in Streaks MFE
- Configure as "remote" (not "host")
- Expose Streaks routes

### **Step 7: Connect Streaks to FitLog**
- Add Streaks to FitLog's `remotes` config
- Add route in FitLog to load Streaks
- Test navigation between apps

---

## 🤔 Common Issues & Solutions

### **Issue 1: Build fails with "Cannot find module 'webpack'"**
**Solution:**
```bash
npm install webpack webpack-cli --save-dev
```

### **Issue 2: "Module Federation plugin not found"**
**Solution:**
```bash
npm install @angular-architects/module-federation --save
```

### **Issue 3: App doesn't load remotes**
**Solution:**
- Check remote URL in webpack.config.js
- Ensure remote MFE is running on correct port
- Check browser console for errors

---

## 📚 Key Concepts Explained

### **What is a Host?**
The main application that loads other micro frontends. FitLog is the host.

### **What is a Remote?**
A micro frontend that is loaded by the host. Streaks will be a remote.

### **What is remoteEntry.js?**
A special file generated by each remote MFE that contains:
- Metadata about the remote
- List of exposed modules
- How to load the remote

### **What is Shared?**
Libraries that both host and remotes use. Instead of loading twice, they share one instance.

### **What is Exposed?**
Modules/services that the host makes available to remotes. Like UserService.

---

## 🎓 Interview Questions

**Q: What is Module Federation?**
> "Module Federation is a Webpack 5 feature that allows multiple separate builds to form a single application. It enables micro frontend architecture where independent applications can share code and load each other dynamically at runtime."

**Q: Why use Module Federation instead of npm packages?**
> "Module Federation allows runtime integration, not build-time. With npm packages, you need to rebuild and redeploy the entire app for changes. With Module Federation, you can deploy micro frontends independently and they load dynamically."

**Q: What's the difference between host and remote?**
> "A host is the main application that loads other micro frontends. A remote is a micro frontend that exposes modules to be consumed by the host. One app can be both - FitLog is a host but could also be a remote for another shell."

**Q: How do you handle shared dependencies?**
> "We use the 'shared' configuration in webpack to define which libraries should be shared. Setting singleton: true ensures only one instance loads. This prevents duplicate Angular, RxJS, etc. in the browser."

---

## ✅ Checklist

Before moving to next step, verify:
- [ ] `@angular-architects/module-federation` installed
- [ ] `webpack.config.js` created with correct configuration
- [ ] `angular.json` updated with Module Federation builders
- [ ] App builds successfully (`npm start`)
- [ ] App runs on http://localhost:4200
- [ ] Existing features work (weight tracker, charts)
- [ ] No console errors

---

**Next:** Create Streaks MFE and configure as remote
**Documentation:** See `MICRO_FRONTENDS_EXPLAINED.md` for architecture overview
