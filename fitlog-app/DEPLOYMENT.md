# FitLog PWA Deployment Guide

This document provides comprehensive instructions for deploying the FitLog PWA to various environments, including GitHub Pages, Firebase Hosting, and traditional web servers.

## Table of Contents

- [GitHub Pages Deployment](#github-pages-deployment)
- [Firebase Hosting Deployment](#firebase-hosting-deployment)
- [Traditional Web Server Deployment](#traditional-web-server-deployment)
- [Deployment Considerations](#deployment-considerations)
- [Continuous Integration/Deployment](#continuous-integrationdeployment)
- [Post-Deployment Verification](#post-deployment-verification)
- [Troubleshooting](#troubleshooting)

## GitHub Pages Deployment

GitHub Pages provides free hosting for static websites directly from a GitHub repository.

### Prerequisites

- GitHub account
- Repository with your Angular project
- Angular CLI and angular-cli-ghpages package

### Setup

1. **Install the GitHub Pages deployment package**:

   ```bash
   npm install angular-cli-ghpages --save-dev
   ```

2. **Add a deployment script to package.json**:

   ```json
   "scripts": {
     "deploy": "ng build --configuration production --base-href=/fitlog/ && npx angular-cli-ghpages --dir=dist/fitlog-app"
   }
   ```

   Note: Replace `/fitlog/` with the name of your repository if different.

### Deployment Process

1. **Build and deploy the application**:

   ```bash
   npm run deploy
   ```

2. **Verify deployment**:
   - The deployment script will output a URL where your app is hosted
   - Navigate to `https://[your-username].github.io/fitlog/`

### Custom Domain (Optional)

1. **Add a CNAME file to your project**:

   Create a file named `CNAME` in the `src` directory with your domain:
   ```
   www.yourdomain.com
   ```

2. **Update the angular.json file**:

   Add the CNAME file to the assets array:
   ```json
   "assets": [
     "src/favicon.ico",
     "src/assets",
     "src/manifest.webmanifest",
     "src/CNAME"
   ]
   ```

3. **Configure DNS settings** with your domain provider:
   - Add an A record pointing to GitHub Pages IP addresses
   - Add a CNAME record if using a subdomain

4. **Update the base-href in your deploy script**:

   ```json
   "deploy": "ng build --configuration production --base-href=/ && npx angular-cli-ghpages --dir=dist/fitlog-app"
   ```

## Firebase Hosting Deployment

Firebase Hosting provides fast and secure hosting for web apps.

### Prerequisites

- Firebase account
- Firebase CLI installed (`npm install -g firebase-tools`)

### Setup

1. **Login to Firebase**:

   ```bash
   firebase login
   ```

2. **Initialize Firebase in your project**:

   ```bash
   firebase init
   ```

   - Select "Hosting"
   - Select your Firebase project or create a new one
   - Specify `dist/fitlog-app` as your public directory
   - Configure as a single-page app: Yes
   - Set up automatic builds and deploys with GitHub: Optional

3. **Update firebase.json for PWA support**:

   ```json
   {
     "hosting": {
       "public": "dist/fitlog-app",
       "ignore": [
         "firebase.json",
         "**/.*",
         "**/node_modules/**"
       ],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ],
       "headers": [
         {
           "source": "/**",
           "headers": [
             {
               "key": "Cache-Control",
               "value": "no-cache, no-store, must-revalidate"
             }
           ]
         },
         {
           "source": "**/*.@(jpg|jpeg|gif|png|svg|webp|js|css|eot|otf|ttf|ttc|woff|woff2|font.css)",
           "headers": [
             {
               "key": "Cache-Control",
               "value": "max-age=604800"
             }
           ]
         },
         {
           "source": "/ngsw-worker.js",
           "headers": [
             {
               "key": "Cache-Control",
               "value": "no-cache"
             }
           ]
         }
       ]
     }
   }
   ```

4. **Add a deployment script to package.json**:

   ```json
   "scripts": {
     "deploy:firebase": "ng build --configuration production && firebase deploy"
   }
   ```

### Deployment Process

1. **Build and deploy the application**:

   ```bash
   npm run deploy:firebase
   ```

2. **Verify deployment**:
   - The deployment script will output a URL where your app is hosted
   - Navigate to the provided Firebase Hosting URL

## Traditional Web Server Deployment

Deploying to a traditional web server like Apache, Nginx, or IIS.

### Prerequisites

- Access to a web server (shared hosting, VPS, etc.)
- FTP client or SSH access to upload files

### Build Process

1. **Build the application for production**:

   ```bash
   ng build --configuration production
   ```

2. **Upload the contents** of the `dist/fitlog-app` directory to your web server's public directory (e.g., `public_html`, `www`, or `htdocs`).

### Server Configuration

#### Apache

Create a `.htaccess` file in the root directory with:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Cache control for service worker
<Files "ngsw-worker.js">
  FileETag None
  Header set Cache-Control "no-store, no-cache, must-revalidate, max-age=0"
</Files>

# Cache static assets
<FilesMatch "\.(html|htm|js|json|css|png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|eot)$">
  Header set Cache-Control "max-age=604800, public"
</FilesMatch>

# Enable CORS
Header set Access-Control-Allow-Origin "*"
```

#### Nginx

Add to your server block:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/dist/fitlog-app;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache control for service worker
    location = /ngsw-worker.js {
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate, post-check=0, pre-check=0";
    }

    # Cache static assets
    location ~* \.(html|htm|js|json|css|png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|eot)$ {
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
    }

    # Enable CORS
    add_header Access-Control-Allow-Origin "*";
}
```

#### IIS

Create a `web.config` file:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="Angular Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
    <staticContent>
      <mimeMap fileExtension=".webmanifest" mimeType="application/manifest+json" />
      <mimeMap fileExtension=".json" mimeType="application/json" />
    </staticContent>
    <httpProtocol>
      <customHeaders>
        <add name="Cache-Control" value="no-cache, no-store" />
        <add name="Access-Control-Allow-Origin" value="*" />
      </customHeaders>
    </httpProtocol>
  </system.webServer>
</configuration>
```

## Deployment Considerations

### HTTPS

PWAs require HTTPS to function properly. Ensure your deployment environment supports HTTPS:

- **GitHub Pages**: HTTPS is provided automatically
- **Firebase Hosting**: HTTPS is provided automatically
- **Traditional Web Server**: Use Let's Encrypt for free SSL certificates

### Base HREF

If your app is not hosted at the root of the domain, you need to set the correct base href:

```bash
ng build --configuration production --base-href=/your-path/
```

### Service Worker Considerations

- Service workers only work over HTTPS (except on localhost for development)
- Ensure proper cache headers for the service worker file (no caching)
- Test service worker updates after deployment

## Continuous Integration/Deployment

### GitHub Actions

Create a file `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build -- --configuration production --base-href=/fitlog/

      - name: Deploy
        uses: JamesIves/github-pages-deploy-action@4.1.5
        with:
          branch: gh-pages
          folder: dist/fitlog-app
```

### GitLab CI/CD

Create a file `.gitlab-ci.yml`:

```yaml
image: node:18

cache:
  paths:
    - node_modules/

stages:
  - build
  - deploy

build:
  stage: build
  script:
    - npm ci
    - npm run build -- --configuration production --base-href=/fitlog/
  artifacts:
    paths:
      - dist/

pages:
  stage: deploy
  script:
    - cp -r dist/fitlog-app/* public/
  artifacts:
    paths:
      - public
  only:
    - main
```

## Post-Deployment Verification

After deploying your PWA, verify the following:

1. **Service Worker Registration**:
   - Open DevTools > Application > Service Workers
   - Confirm the service worker is registered and active

2. **Manifest Detection**:
   - Open DevTools > Application > Manifest
   - Verify the manifest is detected and icons are loaded

3. **Offline Functionality**:
   - Open DevTools > Network > check "Offline"
   - Reload the page and verify the app still works

4. **Installability**:
   - Look for the install icon in the address bar or browser menu
   - Try installing the app and verify it works as a standalone application

5. **Lighthouse Audit**:
   - Run a Lighthouse PWA audit
   - Address any issues identified

## Troubleshooting

### Common Issues

1. **Service Worker Not Registering**:
   - Ensure the app is served over HTTPS
   - Check that ngsw-worker.js exists in the build output
   - Verify the service worker registration in main.ts

2. **App Not Installable**:
   - Ensure the manifest.webmanifest is properly included in the build
   - Verify all required icons are present
   - Check that the start_url in the manifest is correct

3. **Routing Issues After Deployment**:
   - Ensure the base-href is set correctly for your deployment environment
   - Verify server configuration for URL rewriting

4. **Updates Not Detected**:
   - Check cache headers for ngsw.json and ngsw-worker.js
   - Implement the SwUpdate service to handle updates

5. **Assets Not Loading**:
   - Ensure all assets are included in the angular.json assets array
   - Check network requests for 404 errors

### Debugging Tools

- **Chrome DevTools** > Application tab
- **Lighthouse** PWA audits
- **Network** tab with "Disable cache" checked
- **Console** for service worker registration errors
