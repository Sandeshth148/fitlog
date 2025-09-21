# Progressive Web App (PWA) in FitLog

## What is a PWA?

A Progressive Web App (PWA) is a web application that provides a native app-like experience to users. PWAs work offline, can be installed on devices, and load quickly, even on slow networks.

## How PWAs Work in FitLog

FitLog uses Angular's built-in PWA capabilities to transform our web app into an installable, offline-capable application.

### Key Components

1. **Service Worker**: A JavaScript file that runs separately from the main browser thread, intercepting network requests and caching resources.
2. **Web App Manifest**: A JSON file that provides information about the app (name, icons, colors, etc.) needed for installation.
3. **HTTPS**: PWAs require secure connections to function properly.

## What We Did in Our Code

### 1. Added Angular PWA Package

We added the Angular PWA package using:

```bash
ng add @angular/pwa
```

This automatically:
- Added `@angular/service-worker` package
- Created `ngsw-config.json` (Angular Service Worker configuration)
- Created `manifest.webmanifest`
- Generated PWA icons
- Updated `angular.json` to include service worker
- Modified `main.ts` to register the service worker

### 2. Configured the Web App Manifest

Our `manifest.webmanifest` contains:

```json
{
  "name": "FitLog - Weight Tracker",
  "short_name": "FitLog",
  "display": "standalone",
  "theme_color": "#4F46E5",
  "background_color": "#ffffff",
  "scope": "./",
  "start_url": "./",
  "icons": [
    // Various icon sizes...
  ]
}
```

### 3. Added Manifest Link to HTML

We added the manifest link to our `index.html`:

```html
<link rel="manifest" href="manifest.webmanifest">
```

### 4. Configured Angular Assets

We updated `angular.json` to include the manifest and icons in the build:

```json
"assets": [
  "src/favicon.ico",
  "src/assets",
  "src/manifest.webmanifest",
  {
    "glob": "**/*",
    "input": "public/icons",
    "output": "icons/"
  }
]
```

### 5. Service Worker Registration

Angular automatically registers the service worker in `main.ts` for production builds:

```typescript
if ('serviceWorker' in navigator && environment.production) {
  navigator.serviceWorker.register('/ngsw-worker.js')
    .then(reg => console.log('Service worker registered', reg))
    .catch(err => console.error('Service worker registration failed', err));
}
```

## How to Test the PWA

1. **Build for production**:
   ```bash
   ng build --configuration production
   ```

2. **Serve with a static server**:
   ```bash
   npx http-server -p 8080 dist/fitlog-app
   ```

3. **Open in a browser**: Navigate to `http://localhost:8080`

4. **Check for install prompt**: Look for the install icon in the address bar or browser menu.

5. **Test offline functionality**: In Chrome DevTools, go to Network tab and check "Offline", then reload the page.

## What Happens During App Updates

When you update your PWA and deploy a new version:

### Update Detection Process

1. **Service Worker Detects Changes**: When a user visits your app, the service worker checks for updates by comparing the `ngsw.json` file from the server with its cached version.

2. **Background Download**: If updates are found, they are downloaded in the background while the user continues using the current version without interruption.

3. **Update Notification**: Once the new version is ready, the user can be notified that an update is available (this requires custom code, as shown below).

4. **Update Application**: The next time the user closes and reopens the app (or refreshes the page), the new version is activated.

### How Angular Determines Updates

Angular's service worker uses several mechanisms to detect updates:

1. **Hash-based Versioning**: During build, Angular generates hashes for all assets. Any change to a file results in a new hash.

2. **ngsw.json Changes**: This configuration file contains information about cached assets and routes. Any change to this file signals an update.

3. **Version Header**: You can configure your server to send a version header that the service worker checks.

### Update Strategies

1. **Default (Safety First)**: Angular's service worker waits until the user closes all tabs running the app before switching to the new version. This prevents version conflicts across tabs.

2. **Immediate Updates**: You can configure the app to prompt users to update immediately using `SwUpdate` service:

```typescript
import { SwUpdate } from '@angular/service-worker';

constructor(private swUpdate: SwUpdate) {
  // Check for updates
  this.swUpdate.checkForUpdate().then(() => console.log('Checking for updates'));
  
  // Subscribe to update events
  this.swUpdate.versionUpdates.subscribe(event => {
    if (event.type === 'VERSION_READY') {
      console.log(`Current version: ${event.currentVersion.hash}`);
      console.log(`New version: ${event.latestVersion.hash}`);
      
      // Prompt user to update
      if (confirm('New version available. Load new version?')) {
        window.location.reload();
      }
    }
  });
}
```

3. **Scheduled Updates**: Check for updates at specific intervals:

```typescript
interval(6 * 60 * 60 * 1000).subscribe(() => { // Check every 6 hours
  this.swUpdate.checkForUpdate();
});
```

### Update Lifecycle Events

Angular's `SwUpdate` service provides several events you can subscribe to:

- `versionUpdates`: Emits for all version-related events
  - `VERSION_DETECTED`: A new version has been detected on the server
  - `VERSION_READY`: A new version has been downloaded and is ready to use
  - `VERSION_INSTALLATION_FAILED`: An error occurred while installing a new version

### Handling Failed Updates

Sometimes updates can fail due to network issues or other problems. You can handle these cases:

```typescript
this.swUpdate.versionUpdates.subscribe(event => {
  if (event.type === 'VERSION_INSTALLATION_FAILED') {
    console.error('Failed to install app update:', event.error);
    // Notify user or attempt recovery
  }
});
```

### Testing Update Behavior

To test update behavior during development:

1. Build and serve your app: `ng build --configuration production && http-server -p 8080 dist/fitlog-app`
2. Visit the app and install it
3. Make a change to your app and rebuild
4. Serve the new version and observe update behavior

### Best Practices for Updates

1. **Communicate Changes**: Let users know what's new in the update
2. **Respect User Control**: Allow users to choose when to update
3. **Handle Critical Updates**: Force updates for security fixes
4. **Manage Breaking Changes**: Consider data migration needs
5. **Versioning**: Include visible version numbers in your app

### Practical Example: Adding a New Form to an Installed PWA

Let's walk through a real-world example of what happens when you add a new form to your FitLog PWA that's already installed on users' devices:

#### 1. Development: Adding a New Form

You add a new form component to your app, for example, a "Meal Tracking Form":

```typescript
// meal-form.component.ts
@Component({
  selector: 'app-meal-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <form [formGroup]="mealForm" (ngSubmit)="onSubmit()">
      <h2>Track Meal</h2>
      <div>
        <label for="mealType">Meal Type</label>
        <select id="mealType" formControlName="mealType">
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snack">Snack</option>
        </select>
      </div>
      <div>
        <label for="calories">Calories</label>
        <input id="calories" type="number" formControlName="calories">
      </div>
      <div>
        <label for="notes">Notes</label>
        <textarea id="notes" formControlName="notes"></textarea>
      </div>
      <button type="submit">Save Meal</button>
    </form>
  `
})
export class MealFormComponent {
  mealForm = this.fb.group({
    mealType: ['breakfast', Validators.required],
    calories: [0, [Validators.required, Validators.min(0)]],
    notes: ['']
  });
  
  constructor(private fb: FormBuilder) {}
  
  onSubmit() {
    // Save meal logic
  }
}
```

#### 2. Build and Deploy

You build and deploy the updated application:

```bash
ng build --configuration production
# Deploy to your hosting provider
```

#### 3. What Happens on the User's Device

**Scenario A: User has the app open when update is deployed**

1. The service worker periodically checks for updates (typically when navigating or refreshing)
2. It detects that `ngsw.json` has changed (because it contains new hashes for the updated JavaScript bundles)
3. The service worker downloads the new assets in the background
4. The user continues using the old version without seeing the new meal form
5. Angular's `SwUpdate` service emits a `VERSION_READY` event (if you've implemented the update notification)
6. The user is shown an update notification: "A new version is available. Reload to update?"
7. When the user clicks "Reload" or refreshes the page, the new version activates
8. The user now sees the new meal tracking feature in the navigation or wherever you've added it

**Scenario B: User opens the app after update is deployed**

1. The service worker checks for updates when the app loads
2. It detects and downloads the new version
3. If this is the first visit after the update, the new version activates immediately
4. The user sees the new meal form right away

**Scenario C: User is offline when opening the app**

1. The service worker serves the cached version of the app (the old version without the meal form)
2. When the user comes back online, the update process begins as in Scenario A

#### 4. Data Considerations

If your new form stores data in IndexedDB:

1. The first time the user submits the form, the app will create the necessary object store if it doesn't exist
2. You may need to include database migration logic if the update changes existing data structures

```typescript
// Example of database version upgrade to accommodate new meal tracking feature
private initDb(): Promise<IDBPDatabase<FitLogDb>> {
  return openDB<FitLogDb>(DB_NAME, 2, { // Increment version number
    upgrade(db, oldVersion, newVersion) {
      // Create weight entries store if it doesn't exist (v1)
      if (oldVersion < 1) {
        const weightStore = db.createObjectStore('weight-entries', { keyPath: 'id' });
        weightStore.createIndex('createdAt', 'createdAt');
      }
      
      // Add meal entries store (v2)
      if (oldVersion < 2) {
        const mealStore = db.createObjectStore('meal-entries', { keyPath: 'id' });
        mealStore.createIndex('createdAt', 'createdAt');
        mealStore.createIndex('mealType', 'mealType');
      }
    },
  });
}
```

This example demonstrates how the PWA update process works in practice when adding new features to your application.

## Benefits of PWA in FitLog

1. **Offline Functionality**: Users can add weight entries even without an internet connection.

2. **Installable**: Users can add FitLog to their home screen/desktop without going through an app store.

3. **Fast Loading**: Cached resources load quickly, even on slow networks.

4. **Automatic Updates**: Users always get the latest version without manual updates.

5. **Native-like Experience**: Full-screen mode, push notifications (if implemented), and app-like navigation.

## Debugging PWA Issues

1. **Chrome DevTools**: Go to Application > Service Workers to view registered service workers.

2. **Manifest**: Check Application > Manifest to verify your manifest is detected.

3. **Cache Storage**: View cached resources under Application > Cache Storage.

4. **Lighthouse**: Run a Lighthouse audit to check PWA compliance.

5. **Common Issues**:
   - Missing icons
   - Invalid manifest
   - Service worker not registered
   - HTTPS issues

## Multi-Browser Installation Behavior

### What Happens When a User Installs the Same PWA from Multiple Browsers

When a user installs your FitLog PWA from different browsers (e.g., Chrome, Edge, Firefox), several important behaviors occur that you should be aware of:

#### 1. Separate Installations

Each browser creates its own separate installation of the PWA:

- **Different App Icons**: Each installation gets its own icon on the user's desktop/home screen, often with subtle differences in the icon appearance based on how each browser renders the PWA icons.
- **Different Installation Locations**: Each browser stores the app files in different locations on the user's device.
- **Different Runtime Environments**: Each installation runs in the context of the browser that installed it, even though they appear as standalone apps.

#### 2. Isolated Data Storage

Each installation maintains its own separate data storage:

- **Separate IndexedDB Databases**: Data stored in one installation is not accessible to the other installations.
- **Separate Local Storage**: localStorage and sessionStorage are isolated between installations.
- **Separate Caches**: Each installation has its own cache storage managed by its service worker.

Example: If a user adds weight entries in the Chrome-installed version, those entries won't appear in the Edge-installed version unless you implement cloud synchronization.

#### 3. Update Behavior

Each installation follows its own update cycle:

- **Independent Updates**: When you deploy a new version of your PWA, each installation checks for updates independently.
- **Different Timing**: One installation might update before the others, depending on when the user opens each app.
- **Browser-Specific Service Workers**: Each browser manages its own service worker registration and lifecycle.

#### 4. User Experience Considerations

This behavior has important implications for your app design:

- **Data Synchronization**: Consider implementing cloud synchronization to provide a consistent experience across installations.
- **Clear Installation Guidance**: Advise users to choose one preferred browser for installation to avoid confusion.
- **Unique App Identifiers**: Ensure your app has a consistent app ID across browsers to help operating systems recognize it as the same app.

#### 5. Implementation Example: Cross-Browser Data Sync

To handle multiple installations, you might implement a cloud sync service:

```typescript
@Injectable({ providedIn: 'root' })
export class SyncService {
  constructor(
    private storageService: StorageService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  // Sync local data with cloud when online
  async syncData(): Promise<void> {
    if (!navigator.onLine) return;
    
    try {
      // Get user ID for data association
      const userId = await this.authService.getCurrentUserId();
      if (!userId) return;
      
      // Get local entries that haven't been synced
      const unsyncedEntries = await this.storageService.getUnsyncedEntries();
      
      if (unsyncedEntries.length > 0) {
        // Upload to cloud
        await this.http.post(`/api/users/${userId}/sync`, { entries: unsyncedEntries }).toPromise();
        
        // Mark as synced locally
        await this.storageService.markAsSynced(unsyncedEntries.map(e => e.id));
      }
      
      // Get latest data from cloud
      const response = await this.http.get<{entries: WeightEntry[]}>(`/api/users/${userId}/entries`).toPromise();
      
      // Merge with local data (handle conflict resolution)
      await this.storageService.mergeEntries(response.entries);
      
    } catch (error) {
      console.error('Sync failed:', error);
      // Queue for retry later
    }
  }
}
```

## Advanced PWA Features (Future Enhancements)

1. **Push Notifications**: Notify users about new features or reminders.

2. **Background Sync**: Sync data when the user comes back online.

3. **Periodic Sync**: Regularly update data in the background.

4. **Share Target**: Allow users to share content to your app.

5. **App Shortcuts**: Add quick actions to your app icon.

## Resources for Learning More

- [Angular Service Worker Guide](https://angular.io/guide/service-worker-intro)
- [Web App Manifest MDN](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Google PWA Documentation](https://web.dev/progressive-web-apps/)
- [Workbox (Service Worker Library)](https://developers.google.com/web/tools/workbox)
