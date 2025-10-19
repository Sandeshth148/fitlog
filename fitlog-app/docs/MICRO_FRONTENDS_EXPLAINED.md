# Micro Frontends Explained - From First Principles

**Last Updated:** October 19, 2025  
**Purpose:** Understand Micro Frontends architecture for FitLog project

---

## 🤔 What Are Micro Frontends?

**Simple Definition:**
Breaking a large frontend application into smaller, independent applications that work together.

**Real-World Analogy:**
Think of a shopping mall:
- **Mall Building** = Shell/Host (FitLog main app)
- **Individual Stores** = Micro Frontends (Streaks, Fasting, etc.)
- Each store operates independently
- But they share common facilities (parking, security, AC)

---

## 🏗️ Traditional vs Micro Frontend Architecture

### **Traditional Monolithic Frontend**
```
┌─────────────────────────────────────┐
│      One Big Angular Application    │
│                                     │
│  ┌──────────┐  ┌──────────┐       │
│  │ Weight   │  │ Streaks  │       │
│  │ Tracker  │  │ Feature  │       │
│  └──────────┘  └──────────┘       │
│                                     │
│  ┌──────────┐  ┌──────────┐       │
│  │ Fasting  │  │ AI Chat  │       │
│  │ Feature  │  │ Feature  │       │
│  └──────────┘  └──────────┘       │
│                                     │
│  All deployed together              │
│  All share same build               │
│  All must use same Angular version  │
└─────────────────────────────────────┘
```

**Problems:**
- ❌ Large bundle size (all features loaded at once)
- ❌ Long build times
- ❌ One team blocks another
- ❌ Hard to scale development
- ❌ Deploy all or nothing

---

### **Micro Frontend Architecture**
```
┌─────────────────────────────────────────────┐
│         Shell/Host (FitLog Main)            │
│  - Navigation                               │
│  - Authentication                           │
│  - Shared Services                          │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │  Weight Tracker (Built-in)           │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
         ↓ Loads dynamically ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Streaks MFE  │  │ Fasting MFE  │  │ AI Chat MFE  │
│ (Port 4201)  │  │ (Port 4202)  │  │ (Port 4203)  │
│              │  │              │  │              │
│ Independent  │  │ Independent  │  │ Independent  │
│ deployment   │  │ deployment   │  │ deployment   │
└──────────────┘  └──────────────┘  └──────────────┘
```

**Benefits:**
- ✅ Small bundle sizes (load only what's needed)
- ✅ Fast builds (build only changed MFE)
- ✅ Independent teams
- ✅ Independent deployments
- ✅ Technology flexibility (can use different versions)

---

## 🔧 How Module Federation Works

**Module Federation** = Webpack 5 feature that enables Micro Frontends

### **Key Concepts:**

#### **1. Host (Shell)**
The main application that loads other micro frontends.

**FitLog is the Host:**
```typescript
// webpack.config.js (FitLog)
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'fitlog',
      remotes: {
        streaks: 'streaksMfe@http://localhost:4201/remoteEntry.js',
        fasting: 'fastingMfe@http://localhost:4202/remoteEntry.js'
      },
      shared: {
        '@angular/core': { singleton: true },
        '@angular/common': { singleton: true }
      }
    })
  ]
};
```

#### **2. Remote (Micro Frontend)**
Independent application that exposes modules to the host.

**Streaks MFE is a Remote:**
```typescript
// webpack.config.js (Streaks MFE)
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'streaksMfe',
      filename: 'remoteEntry.js',
      exposes: {
        './Routes': './src/app/app.routes.ts'
      },
      shared: {
        '@angular/core': { singleton: true },
        '@angular/common': { singleton: true }
      }
    })
  ]
};
```

#### **3. Shared Dependencies**
Common libraries shared between host and remotes to avoid duplication.

```typescript
shared: {
  '@angular/core': { 
    singleton: true,  // Only one instance
    strictVersion: true,  // Must match version
    requiredVersion: '^20.0.0'
  }
}
```

---

## 🔄 How Streaks MFE Gets Loaded in FitLog

### **Step-by-Step Flow:**

#### **1. User Opens FitLog**
```
User → https://fitlog.com
       ↓
FitLog Shell loads (Port 4200)
- Navigation bar appears
- User is authenticated
- Weight tracker is available
```

#### **2. User Clicks "Streaks" in Navigation**
```
User clicks "Streaks" button
       ↓
FitLog router: /streaks
       ↓
Router config says: "Load Streaks MFE"
```

#### **3. FitLog Loads Streaks MFE Dynamically**
```typescript
// app.routes.ts (FitLog)
{
  path: 'streaks',
  loadChildren: () => loadRemoteModule({
    remoteEntry: 'http://localhost:4201/remoteEntry.js',
    remoteName: 'streaksMfe',
    exposedModule: './Routes'
  }).then(m => m.routes)
}
```

**What happens:**
1. FitLog fetches `http://localhost:4201/remoteEntry.js`
2. This file contains metadata about Streaks MFE
3. FitLog loads the Streaks routes
4. Streaks component renders inside FitLog
5. User sees Streaks feature seamlessly

#### **4. Streaks MFE Runs Inside FitLog**
```
┌─────────────────────────────────────┐
│  FitLog Shell (localhost:4200)      │
│  ┌───────────────────────────────┐  │
│  │ Navigation Bar (FitLog)       │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ Streaks Component (MFE)       │  │ ← Loaded from port 4201
│  │ - Streak counter              │  │
│  │ - Badges                      │  │
│  │ - Calendar heatmap            │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## 🔐 Sharing Authentication & Data

### **Problem:**
How does Streaks MFE know who the logged-in user is?

### **Solution: Shared Services**

#### **Option 1: Shared via Module Federation**
```typescript
// FitLog (Host) - Expose services
module.exports = {
  exposes: {
    './UserService': './src/app/core/services/user.service.ts',
    './StorageService': './src/app/core/services/storage.service.ts'
  }
};

// Streaks MFE - Import services
import { UserService } from 'fitlog/UserService';

constructor(private userService: UserService) {
  this.userService.currentUser$.subscribe(user => {
    console.log('Current user:', user);
  });
}
```

#### **Option 2: Browser Events**
```typescript
// FitLog - Emit event when user logs in
window.dispatchEvent(new CustomEvent('user-logged-in', {
  detail: { userId: '123', name: 'Sandesh' }
}));

// Streaks MFE - Listen for event
window.addEventListener('user-logged-in', (event) => {
  this.currentUser = event.detail;
});
```

#### **Option 3: Shared State (NGRX)**
```typescript
// Both FitLog and Streaks use same NGRX store
// Store is shared via Module Federation
import { Store } from '@ngrx/store';

constructor(private store: Store) {
  this.store.select('user').subscribe(user => {
    // Both apps see same user state
  });
}
```

---

## 🚀 Development Workflow

### **Running Multiple Apps Simultaneously**

**Terminal 1: Run FitLog (Host)**
```bash
cd fitlog-app
npm start
# Runs on http://localhost:4200
```

**Terminal 2: Run Streaks MFE (Remote)**
```bash
cd fitlog-streaks-mfe
npm start
# Runs on http://localhost:4201
```

**Terminal 3: Run Fasting MFE (Remote)**
```bash
cd fitlog-fasting-mfe
npm start
# Runs on http://localhost:4202
```

**Now:**
- Open http://localhost:4200 (FitLog)
- Click "Streaks" → Loads from port 4201
- Click "Fasting" → Loads from port 4202
- All work together seamlessly!

---

## 📦 Deployment

### **Development:**
```
FitLog:  http://localhost:4200
Streaks: http://localhost:4201
Fasting: http://localhost:4202
```

### **Production:**
```
FitLog:  https://fitlog.com
Streaks: https://streaks.fitlog.com (or CDN)
Fasting: https://fasting.fitlog.com (or CDN)
```

**FitLog webpack config in production:**
```typescript
remotes: {
  streaks: 'streaksMfe@https://streaks.fitlog.com/remoteEntry.js',
  fasting: 'fastingMfe@https://fasting.fitlog.com/remoteEntry.js'
}
```

---

## 🎯 Industry Standards (What Big Companies Do)

### **1. Spotify**
```
Shell: Main Spotify app
MFEs: 
- Podcasts
- Playlists
- Artist pages
- Search
```

### **2. Microsoft Teams**
```
Shell: Teams main app
MFEs:
- Chat
- Calendar
- Files
- Calls
```

### **3. Zalando (E-commerce)**
```
Shell: Main site
MFEs:
- Product catalog
- Shopping cart
- Checkout
- User profile
```

**Common Pattern:**
- ✅ Main app = Shell + Core feature
- ✅ New features = Separate MFEs
- ✅ Shared authentication
- ✅ Independent deployment

---

## ✅ FitLog Architecture (What We're Building)

```
┌─────────────────────────────────────────────┐
│  FitLog (Shell + Weight Tracker)            │
│  - Port 4200                                │
│  - Authentication                           │
│  - User profile                             │
│  - Theme service                            │
│  - Storage service                          │
│  - Weight tracking (built-in)               │
└─────────────────────────────────────────────┘
              ↓ Loads ↓
┌──────────────────┐  ┌──────────────────┐
│  Streaks MFE     │  │  Fasting MFE     │
│  - Port 4201     │  │  - Port 4202     │
│  - NGRX store    │  │  - Timer logic   │
│  - Badges        │  │  - History       │
│  - Calendar      │  │  - Statistics    │
└──────────────────┘  └──────────────────┘
```

---

## 🎓 Interview Talking Points

**Q: What are Micro Frontends?**
> "Micro Frontends are an architectural pattern where a large frontend application is split into smaller, independently deployable applications. Each micro frontend can be developed, tested, and deployed by separate teams."

**Q: How do they communicate?**
> "There are three main ways: 1) Shared services via Module Federation, 2) Browser custom events, 3) Shared state management like NGRX. In FitLog, I use shared services for authentication and user data."

**Q: What are the benefits?**
> "Independent deployments mean faster releases, smaller bundle sizes improve performance, and teams can work independently without blocking each other. We can also use different technologies or versions in different MFEs."

**Q: What are the challenges?**
> "Shared dependency management, ensuring consistent UX across MFEs, handling authentication across boundaries, and increased complexity in local development setup."

**Q: When should you use Micro Frontends?**
> "When you have multiple teams working on a large application, when you need independent deployment cycles, or when different parts of your app have different scaling needs. For small apps with one team, a monolith is usually better."

---

## 📚 Further Reading

- [Webpack Module Federation Docs](https://webpack.js.org/concepts/module-federation/)
- [Angular Architects MF Tutorial](https://www.angulararchitects.io/en/blog/the-microfrontend-revolution-module-federation-in-webpack-5/)
- [Micro Frontends by Martin Fowler](https://martinfowler.com/articles/micro-frontends.html)

---

**Next:** Read `MICRO_FRONTENDS_SETUP.md` for step-by-step implementation guide.
