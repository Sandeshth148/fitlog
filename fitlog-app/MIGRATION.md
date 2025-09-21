# Angular Migration Guide

This document tracks the migration of the FitLog app from Angular 16 to Angular 20 (the latest stable version as of September 2025).

## Current Version
- Angular: 16.2.0
- Angular CLI: 16.2.16
- TypeScript: 5.1.3
- RxJS: 7.8.0

## Target Version
- Angular: 20.x (Latest stable)
- Angular CLI: 20.x
- TypeScript: Latest compatible
- RxJS: Latest compatible

## Migration Steps

### 1. Update Angular CLI globally
```bash
npm install -g @angular/cli@latest
```

### 2. Update project's Angular packages
```bash
# In the project directory
ng update @angular/core @angular/cli
```

### 3. Update additional Angular packages
```bash
# If using Angular Material
ng update @angular/material
```

### 4. Update TypeScript and RxJS
```bash
npm install typescript@latest rxjs@latest
```

### 5. Address breaking changes
- Review changes between Angular 16 and Angular 20
- Update code as necessary

### 6. Verify the update
```bash
ng test
ng serve
ng build --configuration production
```

## Migration Log
This section documents the actual commands run and issues encountered during the migration process.

### [DATE: 2025-09-21]
- Started migration process
- Current Angular version: 16.2.0
- Manually updated package.json with the following changes:
  - Updated Angular packages from 16.2.0 to 17.0.0
  - Updated Angular CLI from 16.2.16 to 17.0.0
  - Updated TypeScript from 5.1.3 to 5.2.2
  - Updated zone.js from 0.13.0 to 0.14.0
- Ran `npm install --force` to resolve dependency conflicts
  - Used the force flag to override peer dependency issues
  - Successfully installed Angular 17 packages

### Angular 20 Migration (2025-09-21)
- Updated Angular packages from v17.0.0 to v20.0.0
- Updated TypeScript from 5.2.2 to 5.9.2 (Angular 20 requires TypeScript 5.8 or higher)
- Updated other dependencies to be compatible with Angular 20

### Node.js Version Requirement
**Important:** Angular 20 requires Node.js version v20.19+ or v22.12+

Your current Node.js version is v18.20.4, which is not compatible with Angular 20.

### Options to Proceed

1. **Update Node.js (Recommended):**
   - Download and install Node.js v20.19 or later from [nodejs.org](https://nodejs.org/)
   - After installing, verify with `node -v` that you're running the correct version
   - Run `npm install` again to ensure all dependencies are correctly installed

2. **Use nvm (Node Version Manager):**
   - Install nvm from [github.com/nvm-sh/nvm](https://github.com/nvm-sh/nvm) (Unix/macOS) or [github.com/coreybutler/nvm-windows](https://github.com/coreybutler/nvm-windows) (Windows)
   - Install Node.js v20: `nvm install 20`
   - Use Node.js v20: `nvm use 20`

3. **Downgrade to Angular 17 (Alternative):**
   - If updating Node.js is not an option, we can downgrade to Angular 17 which supports Node.js v18
   - This would require updating package.json back to Angular 17 dependencies

### Next Steps After Node.js Update
- Verify the application builds and runs correctly with `ng serve`
- Test for any breaking changes or issues
- Continue implementing the core features of FitLog

### Challenges Encountered During Migration

The migration from Angular 16 to 20 was not straightforward and involved several manual steps and troubleshooting:

-   **`ng update` Command Issues**: The standard `ng update` command was slow and was ultimately bypassed in favor of a manual update of `package.json`.

-   **Dependency Conflicts**: Manually updating `package.json` led to several dependency resolution errors (`ERESOLVE`). Key conflicts included:
    -   `zone.js`: The version was incompatible with Angular 17 and later 20.
    -   TypeScript: The installed version did not meet the peer dependency requirement for Angular 20's build tools.
    -   The `npm install --force` command was used multiple times to bypass these peer dependency checks.

-   **Node.js Version Incompatibility**: After upgrading to Angular 20, the application failed to start because Angular CLI v20 requires Node.js v20.19+ or v22.12+. The existing environment was running Node.js v18.20.4.
    -   **Resolution**: The Node.js version was manually upgraded to v22.19.0.

-   **`angular.json` Schema Changes**: The project failed to serve due to schema validation errors in `angular.json`.
    -   **Resolution**: The `serve` and `extract-i18n` configurations were updated to use the `buildTarget` property instead of the deprecated `browserTarget`. The build builder was also updated to `@angular-devkit/build-angular:browser-esbuild`.

-   **Sass Deprecation Warning**: The build process showed a warning for the deprecated `@import` rule in `styles.scss`.
    -   **Resolution**: Replaced `@import './styles/themes.scss';` with `@use './styles/themes';`.

-   **Angular CLI MCP Server Setup**: There was initial confusion and errors when setting up the MCP server due to a mismatch between the global and local Angular CLI versions.
    -   **Resolution**: The global Angular CLI was updated and uninstalled to ensure the local project's CLI version (`20.3.2`) was used, which resolved the `Unknown argument: mcp` error.
