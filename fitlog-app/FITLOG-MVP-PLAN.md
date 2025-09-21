# FitLog MVP Plan & Migration Guide

## 🚀 Minimal Demoable MVP for FitLog

**Feature:**  
**Offline-first Weight Entry CRUD + PWA shell**

### Why this is the best first step
- **Minimal scope** — a single form + list UI but touches the important verticals: forms, storage, UI, accessibility.
- **Demoable** — show add → persists → reload → offline add. Convincing to stakeholders.
- **Foundational** — storage abstraction (Repository pattern) prepares you for server sync later.
- **PWA-ready** — adding service worker and manifest is a one-time step and gives visible product polish (installable app).
- **Easily extendable** — once done, add charts, sync, user profile, etc.

## What we'll deliver (MVP)
1. **WeightEntry model/interface**
2. **EntryFormComponent (standalone)** — Reactive Form with validation (date required, positive number for weight).
3. **StorageService (core)** — small IndexedDB wrapper (Repository pattern): add, getAll, update, delete. Use idb or native indexedDB.
4. **HomeComponent** shows list of entries and an "Add Entry" FAB that opens the form (modal or slide-up).
5. **PWA shell**: manifest.json, icons, and service worker (Angular PWA).
6. **Tiny acceptance tests/manual QA steps** and instructions to demo offline behavior.

### Design principles
- Single Responsibility (form vs storage vs UI)
- Repository Pattern for persistence
- Progressive Enhancement (works without network)
- Accessible by default (aria labels, focus management)

## Concrete step-by-step plan

### Branch
Create a focused branch:
```
feature/day2-mvp-offline-entry
```

### Commands to run (prep)
```bash
# from fitlog/fitlog-app
npm install idb         # optional: lightweight IndexedDB wrapper
ng add @angular/pwa --project fitlog
```
(If ng add warns about standalone, still okay; it will add manifest, icons and service worker config.)

### File list & small snippets (what to implement)

#### Model
`src/app/features/weight-tracker/models/weight-entry.model.ts`
```typescript
export interface WeightEntry {
  id: string;          // uuid
  date: string;        // ISO 'YYYY-MM-DD'
  weightKg: number;    // canonical unit
  notes?: string;
}
```

#### StorageService (Repository pattern)
`src/app/core/services/storage.service.ts`
Methods: init(), add(entry), getAll(), update(entry), delete(id)
Persists to IndexedDB using idb or plain indexedDB, returns Promises.

Small pseudo:
```typescript
// example using idb (recommended)
import { openDB } from 'idb';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private dbPromise = openDB('fitlog-db', 1, {
    upgrade(db) {
      db.createObjectStore('weight-entries', { keyPath: 'id' });
    }
  });

  async add(entry: WeightEntry) {
    const db = await this.dbPromise;
    await db.put('weight-entries', entry);
    return entry;
  }
  async getAll() {
    const db = await this.dbPromise;
    return (await db.getAll('weight-entries')).sort(...);
  }
  // update/delete similarly
}
```

#### EntryFormComponent (standalone + Reactive Form)
`src/app/features/weight-tracker/components/entry-form/entry-form.component.ts`
Form controls: date (required), weight (required, >0), notes (optional).
Emits submitted event with WeightEntry.
Accessibility: labels, aria-invalid, role="dialog" if modal.

Example validation:
```typescript
this.form = this.fb.group({
  date: [todayIso, Validators.required],
  weight: ['', [Validators.required, Validators.min(0.1)]],
  notes: ['']
});
```

#### HomeComponent updates
`src/app/features/weight-tracker/pages/home/home.component.ts`
- Inject StorageService.
- On init: this.entries = await storage.getAll().
- Add action: open form, on submit call storage.add(entry) then refresh list.
- Show list sorted by date desc.
- Add a small toast/notification on save.

#### PWA
After ng add @angular/pwa, ensure manifest.webmanifest includes app name, short_name and icons (we already have favicon — we'll add proper sizes).
Confirm ngsw-config.json has an app shell strategy or basic caching for /index.html and assets.
Build production and test service worker locally (or use http-server to host dist).

#### Demo page & acceptance criteria
Add a README snippet docs/MVP-offline-entry.md documenting how to demo.

### Acceptance criteria (how you'll show it works)
- User opens the app, sees Home with "+ Add Entry" button.
- User clicks Add → entry form opens → enters date + weight → submits.
- Entry appears immediately in the list.
- Reload page → entry persists and shows.
- Turn off network (devtools offline) → app still opens → can add another entry → it persists locally.
- App is installable (PWA prompt or Add to home screen works in Chrome on Android).
- Basic a11y: form fields have <label>, focus is set on first input when form opens, buttons have aria-label.

### Manual demo script (what to show)
1. ng serve and open http://localhost:4200.
2. Click + Add Entry, fill date and weight, press submit. Show list update.
3. Refresh the page — entries remain.
4. Open DevTools → Network → Offline. Reload — app still loads, add another entry.
5. (Optional) Build production and serve (ng build --prod and npx http-server ./dist/fitlog-app) to demonstrate PWA installability.

## Prompts for Windsurf / Codex

### Prompt A — StorageService
Create StorageService as an IndexedDB wrapper using idb. Provide methods add, getAll, getById, update, delete. Ensure getAll() returns entries sorted by date descending. Add basic unit tests (Jest or Karma).

### Prompt B — EntryFormComponent
Create a standalone EntryFormComponent with a reactive form (date, weight, notes), validation messages, and an @Output() submitEntry = new EventEmitter<WeightEntry>(). Ensure labels, aria attributes, and keyboard accessibility.

### Prompt C — Home flow
Update HomeComponent to list entries and open EntryFormComponent in a modal or inline. On submit, persist using StorageService and refresh list.

### Prompt D — Add PWA
Run ng add @angular/pwa and wire up manifest.webmanifest. Ensure icons exist and adjust ngsw-config.json for app shell caching.

## Optional small NestJS shim (if you want to touch backend now)
If you want a tiny backend demo (not required for MVP):
- Create a simple NestJS project (fitlog-backend) with one endpoint GET /entries, POST /entries.
- This can be started later; for now implement front-end with a SyncService stub that can post to /api/entries when online.
- But do not require the backend for the MVP — keep it offline-first.

## Where Codex can help (repeatable tasks)
- Scaffolding EntryFormComponent HTML + SCSS and validation messages.
- Implementing StorageService boilerplate using idb.
- Adding PWA files via ng add @angular/pwa is CLI-driven (Codex not needed).
- Writing unit tests skeletons for components/services.

## Timeline suggestion
- Day 0 (you or Windsurf): Create branch feature/day2-mvp-offline-entry. Add idb dependency and run ng add @angular/pwa.
- Day 1: Implement StorageService + WeightEntry model.
- Day 2: Implement EntryFormComponent.
- Day 3: Wire HomeComponent, list entries, small polish + accessibility.
- Day 4: QA and demo offline behavior + create small README and acceptance checks.

## Migration to Angular 20

Before implementing the MVP features, we'll first migrate the project from Angular 16 to Angular 20 (the latest stable version as of September 2025).

### Migration Steps

1. **Update Angular CLI globally**
   ```bash
   npm install -g @angular/cli@latest
   ```

2. **Update project's Angular packages**
   ```bash
   # In the project directory
   ng update @angular/core@20 @angular/cli@20
   ```

3. **Update additional Angular packages**
   ```bash
   ng update @angular/material@20  # If using Angular Material
   ```

4. **Update TypeScript version**
   ```bash
   npm install typescript@latest
   ```

5. **Update RxJS if needed**
   ```bash
   npm install rxjs@latest
   ```

6. **Check for breaking changes**
   - Review the [Angular Update Guide](https://update.angular.io/) for any breaking changes between v16 and v20
   - Pay special attention to:
     - Standalone components (default in Angular 20)
     - Signal-based reactivity (preferred over Observable for simple state)
     - Deprecated APIs that might have been removed

7. **Run tests to verify the update**
   ```bash
   ng test
   ```

8. **Serve the application to check for runtime errors**
   ```bash
   ng serve
   ```

9. **Build the application in production mode**
   ```bash
   ng build --configuration production
   ```

### Post-Migration Recommendations

1. **Adopt Standalone Components**
   - New components should be created as standalone
   - Consider migrating existing components to standalone

2. **Use Signals for Local State**
   - For simple component state, prefer signals over RxJS
   - Example: `count = signal(0)` instead of `count$ = new BehaviorSubject(0)`

3. **Update Testing Practices**
   - Review test files for deprecated testing patterns
   - Update to the latest TestBed APIs

4. **Check Bundle Size**
   - Run `ng build --stats-json` and analyze with webpack-bundle-analyzer
   - Look for opportunities to reduce bundle size with lazy loading

5. **Update CI/CD Pipelines**
   - Ensure CI/CD pipelines use compatible Node.js version
   - Update any build scripts that might be affected by Angular CLI changes
