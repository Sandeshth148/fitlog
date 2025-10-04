# FitLog Changelog

All notable changes to this project will be documented in this file.

## [v1.6.0] - 2025-10-05

### Added
- **Mobile Responsive Design**: Enhanced mobile experience with hamburger menu
- **Complete Translation System**: Fixed translation issues across all components
- **Responsive Grid System**: Added flexible grid layout for all screen sizes

### Fixed
- **Navigation Bar**: Improved mobile navigation with slide-out menu
- **Height Component Translations**: Added missing translations for all languages
- **Translation Consistency**: Fixed mixed language issues in UI components
- **Responsive Typography**: Adjusted font sizes for better readability on small screens

### Technical
- **Media Queries**: Implemented comprehensive breakpoints for all screen sizes
- **Translation Architecture**: Enhanced translation pipe with better fallback handling
- **CSS Custom Properties**: Expanded theme variables for consistent styling

---

## [v1.5.1] - 2025-01-04

### Fixed
- **Language Dropdown**: Fixed click-outside behavior - now closes when clicking elsewhere
- **Theme Support**: Language dropdown now properly inherits dark/light theme colors
- **Navigation Layout**: Moved theme toggle button to navigation bar beside language switcher
- **Logo Styling**: Improved FitLog logo positioning and typography
- **Responsive Design**: Removed max-width constraint for better full-width layout

### Technical
- **Click-Outside Directive**: Added HostListener for better dropdown UX
- **Theme Variables**: Updated dropdown CSS to use CSS custom properties
- **Component Cleanup**: Removed duplicate theme button from home component
- **Tech Debt Documentation**: Created comprehensive tech debt tracking system

---

## [v1.5.0] - 2025-01-03

### Added
- **Complete Translation Coverage**: All UI components now support 7 languages
- **Angular 20 Control Flow**: Migrated to @if, @for, @switch syntax
- **Enhanced Translation System**: Parameter support for dynamic content
- **Technical Documentation**: Comprehensive Angular 20 features guide

### Changed
- **Modern Syntax**: Updated all templates to use Angular 20 control flow
- **Translation Architecture**: Reactive translation pipe with change detection
- **Component Structure**: Full standalone component implementation

### Technical
- **Performance**: Reduced bundle size with new control flow syntax
- **Type Safety**: Enhanced template type checking
- **Developer Experience**: Better IntelliSense and error detection
- **Interview Ready**: Comprehensive documentation for technical discussions

---

## [v1.4.0] - 2025-01-03

### Added
- **Multi-language Support**: Added support for 7 languages
  - English, Hindi (हिंदी), Kannada (ಕನ್ನಡ), Tamil (தமிழ்), Telugu (తెలుగు)
  - French (Français), German (Deutsch)
- **Translation System**: Complete translation infrastructure with pipes
- **PWA Install Prompt**: Native-like install banner with custom icons
- **Enhanced Logging**: Extensive debugging logs for height setup issues

### Fixed
- **PWA Icons**: Fixed custom icons not showing in install prompt
- **Language Selection**: Fixed language switcher not updating UI
- **Install Banner**: Fixed dismiss button not working properly
- **Height Setup Guard**: Added comprehensive error handling and logging

### Technical
- Updated `angular.json` to properly include PWA icons
- Added `TranslatePipe` for easy translation usage
- Enhanced `UserService` and `HeightSetupGuard` with detailed logging
- Improved language persistence and change detection

---

## [v1.3.0] - 2025-01-02

### Added
- **Footer Component**: Copyright notice and tagline
- **BMI Statistics**: Complete BMI trend analysis
  - Average BMI, Current BMI, BMI Change
  - Status indicators with color coding
- **Navigation Rename**: "Charts" renamed to "Trends"

### Enhanced
- **Weight Statistics**: Added ideal weight range display
- **Chart Legends**: Show weight data and ideal weight lines
- **Route Management**: Added backward compatibility for old chart routes

---

## [v1.2.0] - 2025-01-02

### Added
- **Chart Functionality**: Weight and BMI trend visualization
- **Chart Statistics**: 
  - Average weight, current weight, weight change
  - Color-coded indicators (green for loss, red for gain)
- **Ideal Weight Lines**: Visual reference lines on weight charts
- **Time Range Filters**: 1M, 3M, 6M, 1Y, All time options

### Fixed
- **Chart Loading**: Fixed BMI chart not loading on page load
- **Date Adapter**: Added `chartjs-adapter-date-fns` for time-based charts

---

## [v1.1.0] - 2025-01-01

### Added
- **Core Weight Tracking**: Add, edit, delete weight entries
- **BMI Calculation**: Automatic BMI calculation based on height
- **Height Setup**: Initial user profile setup with height input
- **Date Restrictions**: Reasonable date ranges for entries
- **Responsive Design**: Mobile-first responsive UI

### Technical
- **IndexedDB Storage**: Offline-first data persistence
- **PWA Support**: Service worker and manifest configuration
- **Angular 20**: Latest Angular framework with standalone components

---

## [v1.0.0] - 2024-12-31

### Added
- **Initial Release**: Basic project structure
- **Angular Setup**: Angular 20 with TypeScript
- **Core Architecture**: Feature-based folder structure
- **Basic Styling**: CSS custom properties and responsive design

---

## Version Numbering

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR** version for incompatible API changes
- **MINOR** version for new functionality in a backwards compatible manner  
- **PATCH** version for backwards compatible bug fixes

## Categories

- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** for vulnerability fixes
- **Technical** for internal/developer-focused changes
