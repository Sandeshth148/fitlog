# FitLog App - Angular PWA Implementation

## Overview

FitLog is a Progressive Web App (PWA) built with Angular 20 for tracking weight and health metrics. This application demonstrates modern Angular development practices including standalone components, reactive forms, PWA capabilities, and offline-first architecture.

## Branch Structure and Development Workflow

### Main Branches

- **`main`**: The production branch containing stable, released code
- **`develop`**: Integration branch where feature branches are merged before release

### Feature Branches

- **`feature/day1-setup`**: Initial project setup
  - Angular 20 migration from Angular 16
  - Project structure (core/shared/features)
  - Basic UI components
  - PWA configuration
  - Theme service implementation

- **`feature/day2-mvp-offline-entry`**: MVP implementation
  - Weight entry form component
  - IndexedDB storage service
  - Entry list component
  - Offline data persistence
  - Unit tests

### Future Feature Branches

Future development will follow the pattern `feature/[feature-name]` for:
- Charts and statistics
- User authentication
- Cloud synchronization
- Settings and preferences

### Development Workflow

1. **Create Feature Branch**:
   ```bash
   git checkout develop
   git pull
   git checkout -b feature/new-feature
   ```

2. **Implement Feature**:
   - Follow the modular architecture
   - Add unit tests
   - Ensure PWA compatibility

3. **Merge to Develop**:
   ```bash
   git checkout develop
   git merge feature/new-feature
   git push origin develop
   ```

4. **Release to Main**:
   ```bash
   git checkout main
   git merge develop
   git tag v1.x.x
   git push origin main --tags
   ```

5. **Deploy**:
   ```bash
   npm run deploy
   ```

## Development Commands

### Development Server

```bash
npm start
```
Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### Code Generation

```bash
ng generate component features/weight-tracker/components/my-component --standalone
```

### Build

```bash
npm run build
```
The build artifacts will be stored in the `dist/fitlog-app` directory.

### Testing

```bash
npm test
```
Executes the unit tests via [Karma](https://karma-runner.github.io).

### PWA Testing

To test PWA features locally:

```bash
ng build --configuration production
npx http-server -p 8080 dist/fitlog-app
```

### Deployment

```bash
npm run deploy
```
Builds and deploys the app to GitHub Pages.

## Project Structure Explained

### Core Module

Contains singleton services and utilities used throughout the app:
- `StorageService`: IndexedDB wrapper for data persistence
- `ThemeService`: Manages application theming

### Shared Module

Reusable components, directives, and pipes:
- `ButtonComponent`: Custom button with various styles

### Features Module

Feature-specific components organized by domain:

#### Weight Tracker Feature
- **Components**: UI components for the feature
  - `EntryFormComponent`: Form for adding/editing weight entries
  - `EntryListComponent`: Displays weight entries
- **Models**: Data models and interfaces
  - `WeightEntry`: Interface for weight entry data
- **Pages**: Page-level components
  - `HomeComponent`: Main page with entry list and form

## PWA Implementation

See [PWA.md](./PWA.md) for detailed documentation on the PWA implementation, including:
- Service worker configuration
- Manifest setup
- Offline capabilities
- Update handling
- Installation behavior

## MVP Plan and Roadmap

See [FITLOG-MVP-PLAN.md](./FITLOG-MVP-PLAN.md) for the detailed development plan and future roadmap.
