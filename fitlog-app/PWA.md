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
