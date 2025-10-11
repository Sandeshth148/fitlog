# FitLog - Weight Tracker PWA

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://sandeshth148.github.io/fitlog/)
[![Angular](https://img.shields.io/badge/Angular-20-red)](https://angular.io/)
[![PWA](https://img.shields.io/badge/PWA-Ready-blue)](https://web.dev/progressive-web-apps/)
[![Offline](https://img.shields.io/badge/Offline-Ready-orange)]()

A modern, offline-first Progressive Web App (PWA) for tracking your weight and health metrics. Built with Angular 20 and IndexedDB for local storage.

![FitLog Screenshot](https://via.placeholder.com/800x400?text=FitLog+Screenshot)

## 🌟 Features

- **Offline-First**: Add and view entries even without an internet connection
- **PWA**: Installable on desktop and mobile devices
- **Reactive Forms**: Validated input with immediate feedback
- **IndexedDB Storage**: Persistent local storage using the Repository pattern
- **Modern UI**: Clean, responsive design with dark/light mode support
- **Accessibility**: WCAG compliant with proper ARIA attributes

## 📱 Live Demo

Try the live demo: [https://sandeshth148.github.io/fitlog/](https://sandeshth148.github.io/fitlog/)

## 🏗️ Project Structure

The project follows a modular architecture:

```
fitlog-app/
├── src/
│   ├── app/
│   │   ├── core/            # Core services (storage, theme)
│   │   ├── features/        # Feature modules (weight-tracker)
│   │   │   └── weight-tracker/
│   │   │       ├── components/  # UI components
│   │   │       ├── models/      # Data models
│   │   │       └── pages/       # Page components
│   │   └── shared/         # Shared components (button, etc.)
│   ├── styles/            # Global styles and themes
│   ├── assets/            # Static assets
│   ├── manifest.webmanifest  # PWA manifest
│   └── index.html         # Main HTML file
└── public/               # Public assets (icons)
```

## 🌿 Branch Structure

The repository is organized with the following branch structure:

- **`main`**: Stable production code
- **`develop`**: Integration branch for features
- **`feature/day1-setup`**: Initial project setup with PWA capabilities
- **`feature/day2-mvp-offline-entry`**: MVP implementation with offline storage

Future feature branches will follow the pattern `feature/[feature-name]`.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm (v9+)
- Angular CLI (v20)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/Sandeshth148/fitlog.git
   cd fitlog/fitlog-app
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm start
   ```

4. Open your browser to `http://localhost:4200`

### Building for Production

```bash
npm run build
```

### Testing PWA Features

To test PWA features locally:

1. Build the app for production
   ```bash
   npm run build
   ```

2. Serve the production build
   ```bash
   npx http-server -p 8080 dist/fitlog-app
   ```

3. Open `http://localhost:8080` in your browser

## 🚢 Deployment

The app is deployed to GitHub Pages using the following process:

1. Run the deploy script
   ```bash
   npm run deploy
   ```

2. The app will be built and deployed to the `gh-pages` branch

3. Access the deployed app at `https://sandeshth148.github.io/fitlog/`

## 📘 Documentation

- [PWA Documentation](./fitlog-app/PWA.md): Detailed guide on PWA implementation
- [MVP Plan](./fitlog-app/FITLOG-MVP-PLAN.md): Development roadmap and feature planning

## 🔮 Future Enhancements

- Cloud synchronization
- User authentication
- Weight trend charts and statistics
- Meal tracking
- Exercise logging
- Goal setting and progress tracking

## 🧰 Technologies Used

- **Angular 20**: Frontend framework
- **TypeScript**: Programming language
- **IndexedDB/idb**: Local database
- **Angular Service Worker**: PWA capabilities
- **SCSS**: Styling
- **GitHub Pages**: Hosting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

- **Sandesh** - [GitHub Profile](https://github.com/Sandeshth148)
