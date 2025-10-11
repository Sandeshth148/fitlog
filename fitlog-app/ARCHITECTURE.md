# FitLog Architecture Documentation

**Version:** 1.8.0  
**Last Updated:** October 11, 2025  
**Author:** Sandesh

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Architecture Patterns](#architecture-patterns)
5. [Data Flow](#data-flow)
6. [State Management](#state-management)
7. [Routing Strategy](#routing-strategy)
8. [Storage Architecture](#storage-architecture)
9. [PWA Architecture](#pwa-architecture)
10. [Security Considerations](#security-considerations)
11. [Performance Optimizations](#performance-optimizations)
12. [Future Architecture](#future-architecture)

---

## 🎯 Overview

FitLog is a Progressive Web App (PWA) built with Angular 20, designed as an offline-first fitness tracking application. The architecture emphasizes modern Angular patterns, performance, and maintainability.

### Design Principles

1. **Offline-First**: App works without internet connection
2. **Mobile-First**: Optimized for mobile devices
3. **Performance**: Fast load times, smooth interactions
4. **Modularity**: Clear separation of concerns
5. **Scalability**: Easy to add new features
6. **Maintainability**: Clean, documented code

---

## 🛠 Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Angular** | 20.0.0 | Frontend framework |
| **TypeScript** | 5.9.2 | Type-safe JavaScript |
| **RxJS** | 7.8.1 | Reactive programming |
| **Chart.js** | 4.5.0 | Data visualization |
| **date-fns** | 4.1.0 | Date manipulation |
| **IndexedDB (idb)** | 8.0.3 | Client-side storage |

### Build Tools

| Tool | Purpose |
|------|---------|
| **Angular CLI** | Project scaffolding and build |
| **ESBuild** | Fast JavaScript bundler |
| **TypeScript Compiler** | Type checking and transpilation |

### Development Tools

| Tool | Purpose |
|------|---------|
| **Angular DevTools** | Debugging and profiling |
| **Lighthouse** | Performance auditing |
| **Chrome DevTools** | Browser debugging |

---

## 📁 Project Structure

```
fitlog-app/
├── src/
│   ├── app/
│   │   ├── core/                      # Core module (singleton services)
│   │   │   ├── components/            # Core UI components
│   │   │   │   ├── footer/
│   │   │   │   ├── header/
│   │   │   │   ├── nav/
│   │   │   │   ├── profile-setup/     # Initial profile setup
│   │   │   │   └── user-profile/      # User profile management
│   │   │   ├── guards/                # Route guards
│   │   │   ├── interceptors/          # HTTP interceptors
│   │   │   ├── models/                # Core interfaces
│   │   │   │   └── user-profile.model.ts
│   │   │   ├── pipes/                 # Global pipes
│   │   │   │   └── translate.pipe.ts
│   │   │   └── services/              # Core services
│   │   │       ├── storage.service.ts
│   │   │       ├── theme.service.ts
│   │   │       ├── translation.service.ts
│   │   │       └── user.service.ts
│   │   │
│   │   ├── shared/                    # Shared module (reusable components)
│   │   │   ├── components/            # Shared UI components
│   │   │   │   ├── button/
│   │   │   │   └── fab/               # Floating Action Button
│   │   │   └── directives/            # Shared directives
│   │   │       └── swipe.directive.ts
│   │   │
│   │   ├── features/                  # Feature modules
│   │   │   └── weight-tracker/        # Weight tracking feature
│   │   │       ├── components/        # Feature components
│   │   │       │   ├── bmi-chart/
│   │   │       │   ├── bmi-display/
│   │   │       │   ├── entry-form/
│   │   │       │   ├── entry-list/
│   │   │       │   └── weight-chart/
│   │   │       ├── models/            # Feature models
│   │   │       │   └── weight-entry.model.ts
│   │   │       ├── pages/             # Route components
│   │   │       │   ├── charts/
│   │   │       │   ├── home/
│   │   │       │   └── setup/
│   │   │       └── services/          # Feature services
│   │   │           └── weight.service.ts
│   │   │
│   │   ├── app.component.ts           # Root component
│   │   ├── app.config.ts              # App configuration
│   │   └── app.routes.ts              # Route definitions
│   │
│   ├── assets/                        # Static assets
│   │   ├── i18n/                      # Translation files
│   │   │   └── en.json
│   │   └── images/
│   │
│   ├── icons/                         # PWA icons
│   ├── styles.scss                    # Global styles
│   ├── manifest.webmanifest           # PWA manifest
│   └── ngsw-config.json               # Service worker config
│
├── docs/                              # Documentation
│   ├── ARCHITECTURE.md                # This file
│   ├── CONTRIBUTING.md                # Contribution guidelines
│   ├── LEARNING_ROADMAP.md            # Learning roadmap
│   └── PWA.md                         # PWA documentation
│
├── angular.json                       # Angular CLI configuration
├── package.json                       # Dependencies
├── tsconfig.json                      # TypeScript configuration
└── README.md                          # Project overview
```

### Module Organization

#### Core Module
- **Purpose**: Singleton services and app-wide components
- **Characteristics**:
  - Imported once in `app.config.ts`
  - Services provided at root level
  - Contains layout components (header, footer, nav)

#### Shared Module
- **Purpose**: Reusable components, directives, pipes
- **Characteristics**:
  - Can be imported by any feature module
  - No business logic
  - Pure presentation components

#### Feature Modules
- **Purpose**: Domain-specific functionality
- **Characteristics**:
  - Self-contained features
  - Lazy-loaded when possible
  - Own services, components, models

---

## 🏗 Architecture Patterns

### 1. Standalone Components Architecture

All components are standalone (no NgModules):

```typescript
@Component({
  selector: 'app-weight-chart',
  standalone: true,
  imports: [CommonModule, ChartComponent],
  templateUrl: './weight-chart.component.html',
  styleUrls: ['./weight-chart.component.scss']
})
export class WeightChartComponent {
  // Component logic
}
```

**Benefits:**
- Simpler mental model
- Better tree-shaking
- Easier testing
- Clearer dependencies

### 2. Signals-Based State Management

Using Angular Signals for reactive state:

```typescript
export class UserProfileComponent {
  // Signal for reactive state
  userProfile = signal<UserProfile | null>(null);
  isModalOpen = signal(false);
  heightUnit = signal<'cm' | 'ft'>('cm');
  
  // Computed signal (derived state)
  displayHeight = computed(() => {
    const profile = this.userProfile();
    if (!profile) return '';
    
    if (this.heightUnit() === 'cm') {
      return `${profile.heightCm} cm`;
    } else {
      const feet = Math.floor(profile.heightCm / 30.48);
      const inches = Math.round((profile.heightCm / 2.54) % 12);
      return `${feet}'${inches}"`;
    }
  });
}
```

**Benefits:**
- Fine-grained reactivity
- Better performance than Zone.js
- Simpler than RxJS for local state
- Automatic change detection

### 3. Service Layer Pattern

Services handle business logic and data operations:

```typescript
@Injectable({ providedIn: 'root' })
export class WeightService {
  private storageService = inject(StorageService);
  
  // Observable for reactive data
  private entriesSubject = new BehaviorSubject<WeightEntry[]>([]);
  entries$ = this.entriesSubject.asObservable();
  
  async loadEntries(): Promise<void> {
    const entries = await this.storageService.getWeightEntries();
    this.entriesSubject.next(entries);
  }
  
  async addEntry(entry: WeightEntry): Promise<void> {
    const saved = await this.storageService.saveWeightEntry(entry);
    const current = this.entriesSubject.value;
    this.entriesSubject.next([...current, saved]);
  }
}
```

### 4. Smart vs Dumb Components

**Smart Components (Containers)**
- Handle business logic
- Interact with services
- Manage state
- Example: `HomeComponent`

```typescript
export class HomeComponent implements OnInit {
  private weightService = inject(WeightService);
  entries = signal<WeightEntry[]>([]);
  
  async ngOnInit() {
    await this.weightService.loadEntries();
    this.weightService.entries$.subscribe(entries => {
      this.entries.set(entries);
    });
  }
}
```

**Dumb Components (Presentational)**
- Pure presentation
- Input/Output only
- No service dependencies
- Example: `EntryListComponent`

```typescript
export class EntryListComponent {
  @Input() entries: WeightEntry[] = [];
  @Output() entryDeleted = new EventEmitter<string>();
  @Output() entryEdited = new EventEmitter<WeightEntry>();
}
```

### 5. Dependency Injection Pattern

Modern `inject()` function:

```typescript
export class MyComponent {
  // ✅ Modern approach
  private userService = inject(UserService);
  private router = inject(Router);
  
  // ❌ Old approach (still valid for constructor logic)
  constructor(
    private userService: UserService,
    private router: Router
  ) {}
}
```

---

## 🔄 Data Flow

### Application Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                     User Interface                       │
│  (Components with Signals for reactive state)           │
└────────────────┬────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────┐
│                    Service Layer                         │
│  (Business logic, data transformation)                   │
│  - WeightService                                         │
│  - UserService                                           │
│  - ThemeService                                          │
└────────────────┬────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────┐
│                  Storage Service                         │
│  (IndexedDB abstraction layer)                           │
└────────────────┬────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────┐
│                    IndexedDB                             │
│  (Browser storage - offline persistence)                 │
└─────────────────────────────────────────────────────────┘
```

### Example: Adding a Weight Entry

```
1. User fills form in EntryFormComponent
   ↓
2. Form submission triggers onSubmit()
   ↓
3. Component calls weightService.addEntry(entry)
   ↓
4. WeightService validates and processes entry
   ↓
5. WeightService calls storageService.saveWeightEntry(entry)
   ↓
6. StorageService saves to IndexedDB
   ↓
7. StorageService returns saved entry with ID
   ↓
8. WeightService updates BehaviorSubject
   ↓
9. Components subscribed to entries$ receive update
   ↓
10. UI automatically updates via signals/observables
```

---

## 📊 State Management

### Current Approach: Hybrid (Signals + RxJS)

#### Local State: Signals
For component-specific state:

```typescript
export class EntryFormComponent {
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  selectedDate = signal(new Date());
}
```

#### Global State: RxJS BehaviorSubjects
For shared state across components:

```typescript
@Injectable({ providedIn: 'root' })
export class UserService {
  private profileSubject = new BehaviorSubject<UserProfile | null>(null);
  userProfile$ = this.profileSubject.asObservable();
  
  async loadProfile() {
    const profile = await this.storageService.getUserProfile();
    this.profileSubject.next(profile);
  }
}
```

### Future: NgRx (Planned)

For complex state management:

```
┌─────────────────────────────────────────────────────────┐
│                       Component                          │
│  (Dispatches actions, selects state)                     │
└────────────────┬────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────┐
│                        Store                             │
│  (Single source of truth)                                │
└────────────────┬────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        ↓                 ↓
┌──────────────┐  ┌──────────────┐
│   Reducers   │  │   Effects    │
│  (Pure fns)  │  │ (Side effects)│
└──────────────┘  └──────────────┘
```

---

## 🛣 Routing Strategy

### Route Configuration

```typescript
export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'setup',
    loadComponent: () => import('./features/weight-tracker/pages/setup/setup.component')
      .then(m => m.SetupComponent),
    canActivate: [setupGuard]
  },
  {
    path: 'home',
    loadComponent: () => import('./features/weight-tracker/pages/home/home.component')
      .then(m => m.HomeComponent)
  },
  {
    path: 'charts',
    loadComponent: () => import('./features/weight-tracker/pages/charts/charts.component')
      .then(m => m.ChartsComponent)
  }
];
```

### Lazy Loading Strategy

- **Initial Bundle**: Core components, services, and home page
- **Lazy Loaded**: Charts page, setup page
- **Preloading**: None (load on demand for better initial performance)

### Route Guards

```typescript
export const setupGuard: CanActivateFn = async (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);
  
  const profile = await userService.getUserProfile();
  
  if (!profile || !profile.name) {
    return true; // Allow access to setup
  }
  
  router.navigate(['/home']);
  return false; // Redirect to home if already set up
};
```

---

## 💾 Storage Architecture

### IndexedDB Schema

```typescript
// Database: fitlog-db
// Version: 1

// Object Store: weight-entries
interface WeightEntry {
  id?: string;           // Auto-generated UUID
  weight: number;        // Weight in kg
  date: Date;            // Entry date
  notes?: string;        // Optional notes
  createdAt: Date;       // Creation timestamp
  updatedAt: Date;       // Last update timestamp
}

// Object Store: user-profile
interface UserProfile {
  id: string;            // Always 'default'
  name: string;          // User's name
  age?: number;          // Optional age
  heightCm: number;      // Height in centimeters
  avatar?: string;       // Base64 image data
  preferredUnits: {
    weight: 'kg' | 'lbs';
    height: 'cm' | 'ft' | 'in';
  };
  createdAt: Date;
  updatedAt: Date;
}

// Object Store: app-settings
interface AppSettings {
  id: string;            // Always 'default'
  theme: 'light' | 'dark' | 'auto';
  language: string;      // ISO language code
  lastSync?: Date;       // Last backend sync
}
```

### Storage Service Architecture

```typescript
@Injectable({ providedIn: 'root' })
export class StorageService {
  private db: IDBPDatabase | null = null;
  
  // Initialize database
  async initDB(): Promise<void> {
    this.db = await openDB('fitlog-db', 1, {
      upgrade(db) {
        // Create object stores
        if (!db.objectStoreNames.contains('weight-entries')) {
          db.createObjectStore('weight-entries', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('user-profile')) {
          db.createObjectStore('user-profile', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('app-settings')) {
          db.createObjectStore('app-settings', { keyPath: 'id' });
        }
      }
    });
  }
  
  // CRUD operations
  async saveWeightEntry(entry: WeightEntry): Promise<WeightEntry> { }
  async getWeightEntries(): Promise<WeightEntry[]> { }
  async updateWeightEntry(entry: WeightEntry): Promise<void> { }
  async deleteWeightEntry(id: string): Promise<void> { }
}
```

---

## 📱 PWA Architecture

### Service Worker Strategy

```
┌─────────────────────────────────────────────────────────┐
│                   Service Worker                         │
│  (Intercepts network requests)                           │
└────────────────┬────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        ↓                 ↓
┌──────────────┐  ┌──────────────┐
│    Cache     │  │   Network    │
│   Storage    │  │   Requests   │
└──────────────┘  └──────────────┘
```

### Caching Strategy

**Cache First (for static assets)**
```
1. Check cache
2. If found → return cached version
3. If not found → fetch from network → cache → return
```

**Network First (for API calls - future)**
```
1. Try network request
2. If success → update cache → return
3. If fail → return cached version (if available)
```

### Offline Capabilities

- ✅ View weight entries offline
- ✅ Add new entries offline (stored locally)
- ✅ View charts offline
- ✅ Edit profile offline
- ⚪ Sync with backend when online (future)

---

## 🔒 Security Considerations

### Current Implementation

1. **Input Sanitization**
   - Angular's built-in XSS protection
   - DomSanitizer for user-generated content

2. **Data Validation**
   - Form validators
   - Type checking with TypeScript
   - Range validation for numeric inputs

3. **Secure Storage**
   - IndexedDB (client-side only)
   - No sensitive data stored
   - Base64 encoding for images

### Future Security (with Backend)

1. **Authentication**
   - JWT tokens
   - HTTP-only cookies
   - Refresh token rotation

2. **Authorization**
   - Role-based access control
   - Route guards
   - API endpoint protection

3. **Data Protection**
   - HTTPS only
   - CORS configuration
   - CSP headers
   - Rate limiting

4. **Security Headers**
   ```
   Content-Security-Policy
   X-Frame-Options: DENY
   X-Content-Type-Options: nosniff
   Strict-Transport-Security
   ```

---

## ⚡ Performance Optimizations

### Current Optimizations

1. **Change Detection**
   - OnPush strategy in components
   - Manual change detection when needed
   - Signals for fine-grained reactivity

2. **Lazy Loading**
   - Route-level code splitting
   - Charts page lazy loaded
   - Setup page lazy loaded

3. **Bundle Optimization**
   - Tree-shaking enabled
   - ESBuild for fast builds
   - Production optimizations

4. **Caching**
   - Service worker caching
   - IndexedDB for data
   - CSS/JS caching

### Performance Metrics

| Metric | Target | Current |
|--------|--------|---------|
| First Contentful Paint | < 1.5s | ~1.2s |
| Time to Interactive | < 3.0s | ~2.5s |
| Lighthouse Score | > 90 | 92 |
| Bundle Size (initial) | < 500KB | ~767KB |

### Future Optimizations

- [ ] Virtual scrolling for large lists
- [ ] Image lazy loading
- [ ] Web Workers for calculations
- [ ] Preloading strategy for routes
- [ ] HTTP/2 server push

---

## 🔮 Future Architecture

### Phase 1: Backend Integration

```
┌─────────────────────────────────────────────────────────┐
│                   Angular Frontend                       │
│  (PWA with offline-first)                                │
└────────────────┬────────────────────────────────────────┘
                 │
                 ↓ HTTP/WebSocket
┌─────────────────────────────────────────────────────────┐
│                   NestJS Backend                         │
│  (REST API + GraphQL + WebSockets)                       │
└────────────────┬────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        ↓                 ↓
┌──────────────┐  ┌──────────────┐
│   MongoDB    │  │    Redis     │
│  (Primary)   │  │  (Cache)     │
└──────────────┘  └──────────────┘
```

### Phase 2: Microservices

```
┌─────────────────────────────────────────────────────────┐
│                   API Gateway                            │
│  (Authentication, Rate Limiting, Routing)                │
└────────────────┬────────────────────────────────────────┘
                 │
        ┌────────┼────────┐
        ↓        ↓        ↓
┌──────────┐ ┌──────────┐ ┌──────────┐
│  User    │ │  Weight  │ │  Notify  │
│ Service  │ │ Service  │ │ Service  │
└──────────┘ └──────────┘ └──────────┘
```

### Phase 3: Micro Frontends

```
┌─────────────────────────────────────────────────────────┐
│                   Shell Application                      │
│  (Navigation, Authentication, Layout)                    │
└────────────────┬────────────────────────────────────────┘
                 │
        ┌────────┼────────┐
        ↓        ↓        ↓
┌──────────┐ ┌──────────┐ ┌──────────┐
│  FitLog  │ │   Task   │ │ Fasting  │
│   MFE    │ │   MFE    │ │   MFE    │
└──────────┘ └──────────┘ └──────────┘
```

---

## 📚 References

- [Angular Architecture Guide](https://angular.dev/guide/architecture)
- [Angular Best Practices](https://angular.dev/best-practices)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

---

**Last Updated:** October 11, 2025  
**Next Review:** When implementing backend integration
