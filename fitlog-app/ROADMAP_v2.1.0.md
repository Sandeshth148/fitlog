# FitLog v2.1.0 Roadmap - Micro Frontend Architecture

**Target Date:** Week 2-3  
**Type:** Architectural Enhancement  
**Goal:** Extract Streaks to separate Micro Frontend

---

## 🎯 Objective

Transform FitLog from a monolith to a Micro Frontend architecture by extracting the Streaks feature into an independent application that loads dynamically.

---

## 📋 Tasks

### **Phase 1: Setup Streaks MFE** (Day 1-2)

#### **1.1 Create Separate Application**
```bash
cd fitlog/
ng new fitlog-streaks-mfe --standalone --routing --style=scss --skip-git
```

- [ ] Create `fitlog-streaks-mfe` folder
- [ ] Initialize Angular 20 app
- [ ] Configure port 4201
- [ ] Setup basic structure

#### **1.2 Copy Streaks Code**
- [ ] Copy `src/app/features/streaks/` to new app
- [ ] Copy `StreakCalculatorService`
- [ ] Copy models and interfaces
- [ ] Update import paths

#### **1.3 Install Dependencies**
```bash
cd fitlog-streaks-mfe
npm install @angular-architects/native-federation
```

---

### **Phase 2: Configure Native Federation** (Day 3-4)

#### **2.1 Configure Streaks MFE (Remote)**

**File:** `fitlog-streaks-mfe/federation.config.json`
```json
{
  "name": "streaks",
  "exposes": {
    "./Component": "./src/app/streaks/streaks.component.ts"
  },
  "shared": {
    "@angular/core": { "singleton": true },
    "@angular/common": { "singleton": true },
    "@angular/router": { "singleton": true }
  }
}
```

- [ ] Create federation config
- [ ] Expose Streaks component
- [ ] Configure shared dependencies
- [ ] Update angular.json

#### **2.2 Configure FitLog (Host)**

**File:** `fitlog-app/federation.config.json`
```json
{
  "name": "shell",
  "remotes": {
    "streaks": "http://localhost:4201/remoteEntry.js"
  },
  "shared": {
    "@angular/core": { "singleton": true },
    "@angular/common": { "singleton": true },
    "@angular/router": { "singleton": true }
  }
}
```

- [ ] Create federation config
- [ ] Add Streaks as remote
- [ ] Configure shared dependencies
- [ ] Update angular.json

---

### **Phase 3: Integration** (Day 5-6)

#### **3.1 Update FitLog Routes**

**File:** `fitlog-app/src/app/app.routes.ts`
```typescript
{
  path: 'streaks',
  loadComponent: () =>
    import('streaks/Component').then(m => m.StreaksComponent),
  canActivate: [HeightSetupGuard]
}
```

- [ ] Update route to load from remote
- [ ] Keep auth guard
- [ ] Test lazy loading

#### **3.2 Shared Services**

**Expose from Shell:**
- [ ] `StorageService` - For weight entries
- [ ] `ToastService` - For notifications
- [ ] `UserService` - For authentication

**Consume in Streaks MFE:**
- [ ] Import shared services
- [ ] Update dependency injection
- [ ] Test data flow

---

### **Phase 4: Testing** (Day 7)

#### **4.1 Development Testing**
- [ ] Run shell: `cd fitlog-app && npm start` (Port 4200)
- [ ] Run streaks: `cd fitlog-streaks-mfe && npm start` (Port 4201)
- [ ] Test navigation to /streaks
- [ ] Verify dynamic loading
- [ ] Check toast notifications
- [ ] Test badge system

#### **4.2 Production Build**
- [ ] Build shell: `npm run build`
- [ ] Build streaks: `npm run build`
- [ ] Test production bundles
- [ ] Verify code splitting

---

### **Phase 5: Documentation** (Day 8)

- [ ] Update ARCHITECTURE.md
- [ ] Create MFE_SETUP_GUIDE.md
- [ ] Document deployment process
- [ ] Add troubleshooting guide
- [ ] Update README.md

---

## 🏗️ Architecture Diagram

### **Before (v2.0.0 - Monolith)**
```
┌─────────────────────────────────┐
│      FitLog (Port 4200)         │
│  ┌───────────────────────────┐  │
│  │ Weight Tracker            │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │ Streaks (Built-in)        │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### **After (v2.1.0 - Micro Frontend)**
```
┌─────────────────────────────────┐
│   FitLog Shell (Port 4200)      │
│  ┌───────────────────────────┐  │
│  │ Weight Tracker            │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │ Streaks (Remote)          │  │ ← Loaded from Port 4201
│  │ http://localhost:4201     │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
         ↓ Loads dynamically
┌─────────────────────────────────┐
│ Streaks MFE (Port 4201)         │
│  - Separate codebase            │
│  - Independent deployment       │
│  - Own package.json             │
└─────────────────────────────────┘
```

---

## 📊 Success Criteria

- [ ] Streaks loads from separate app (Port 4201)
- [ ] Navigation works seamlessly
- [ ] Shared services work correctly
- [ ] Toast notifications function
- [ ] Badges display properly
- [ ] No console errors
- [ ] Performance is acceptable
- [ ] Can deploy independently

---

## 🎓 Learning Outcomes

By completing v2.1.0, you'll learn:

1. **Native Federation** - Modern MFE solution for Angular
2. **Module Sharing** - Singleton dependencies
3. **Remote Loading** - Dynamic component loading
4. **Service Sharing** - Cross-MFE communication
5. **Independent Deployment** - Deploy MFEs separately
6. **Code Splitting** - Optimized bundle sizes
7. **Polyrepo Management** - Multiple repositories

---

## 🚀 Deployment Strategy

### **Development:**
```bash
# Terminal 1 - Shell
cd fitlog-app
npm start  # Port 4200

# Terminal 2 - Streaks MFE
cd fitlog-streaks-mfe
npm start  # Port 4201
```

### **Production:**
```bash
# Build both apps
cd fitlog-app && npm run build
cd fitlog-streaks-mfe && npm run build

# Deploy to different domains/CDNs
Shell: https://fitlog.com
Streaks: https://streaks.fitlog.com (or CDN)
```

---

## 🔮 Future MFEs (v2.2.0+)

After Streaks, extract more features:

1. **Fasting MFE** (Port 4202)
   - Intermittent fasting timer
   - Fasting history
   - Fasting streaks

2. **AI Insights MFE** (Port 4203)
   - Weight predictions
   - Trend analysis
   - Chatbot assistant

3. **Social MFE** (Port 4204)
   - Share progress
   - Challenges
   - Leaderboards

---

## 📝 Notes

- Keep v2.0.0 working in monolith (fallback)
- Test thoroughly before removing monolith code
- Document every step for learning
- Take screenshots for portfolio
- Commit frequently

---

**Ready to build TRUE Micro Frontends!** 🚀

Next: Start Phase 1 - Create Streaks MFE
