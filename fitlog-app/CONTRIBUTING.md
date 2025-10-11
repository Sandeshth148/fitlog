# Contributing to FitLog

Thank you for your interest in contributing to FitLog! This document provides guidelines and standards for contributing to this project.

---

## 🎯 Project Vision

FitLog is a learning platform project designed to demonstrate modern Angular development practices, full-stack capabilities, and professional engineering standards. While it's primarily a personal learning project, contributions that align with the learning goals are welcome.

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Development Workflow](#development-workflow)
3. [Code Standards](#code-standards)
4. [Commit Guidelines](#commit-guidelines)
5. [Documentation Requirements](#documentation-requirements)
6. [Testing Requirements](#testing-requirements)
7. [Pull Request Process](#pull-request-process)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18+ 
- **npm**: v9+
- **Angular CLI**: v20+
- **Git**: Latest version

### Setup

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/fitlog.git
   cd fitlog/fitlog-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```
   Navigate to `http://localhost:4200/`

4. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

---

## 🔄 Development Workflow

### Branch Strategy

- **`main`**: Production-ready code
- **`develop`**: Integration branch for features
- **`feature/*`**: New features or enhancements
- **`fix/*`**: Bug fixes
- **`docs/*`**: Documentation updates
- **`chore/*`**: Maintenance tasks

### Workflow Steps

1. **Create Feature Branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/amazing-feature
   ```

2. **Make Changes**
   - Write clean, documented code
   - Follow Angular style guide
   - Add tests for new features
   - Update documentation

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

4. **Push to Fork**
   ```bash
   git push origin feature/amazing-feature
   ```

5. **Create Pull Request**
   - Target the `develop` branch
   - Fill out PR template
   - Link related issues

---

## 📝 Code Standards

### Angular Style Guide

Follow the [Official Angular Style Guide](https://angular.dev/style-guide)

### Key Conventions

#### 1. **Standalone Components**
All components must be standalone:
```typescript
@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './my-component.component.html',
  styleUrls: ['./my-component.component.scss']
})
```

#### 2. **Modern Template Syntax**
Use new control flow syntax:
```html
<!-- ✅ Good -->
@if (condition) {
  <div>Content</div>
}

@for (item of items; track item.id) {
  <div>{{ item.name }}</div>
}

<!-- ❌ Avoid -->
<div *ngIf="condition">Content</div>
<div *ngFor="let item of items">{{ item.name }}</div>
```

#### 3. **Signals for State**
Prefer signals over traditional properties:
```typescript
// ✅ Good
isLoading = signal(false);
userName = signal('');

// ❌ Avoid (unless necessary)
isLoading = false;
userName = '';
```

#### 4. **Dependency Injection**
Use modern `inject()` function:
```typescript
// ✅ Good
private userService = inject(UserService);

// ❌ Avoid (unless constructor logic needed)
constructor(private userService: UserService) {}
```

#### 5. **Change Detection**
Use OnPush strategy for performance:
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

#### 6. **TypeScript Strict Mode**
- Enable strict type checking
- No `any` types (use `unknown` if needed)
- Proper interface definitions

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  age?: number;
}

// ❌ Avoid
const user: any = {};
```

### File Structure

```
src/app/
├── core/                    # Singleton services, guards, interceptors
│   ├── components/          # Core UI components (header, footer, nav)
│   ├── services/            # App-wide services
│   ├── guards/              # Route guards
│   ├── interceptors/        # HTTP interceptors
│   ├── models/              # Core interfaces/types
│   └── pipes/               # Global pipes
├── shared/                  # Reusable components, directives, pipes
│   ├── components/          # Shared UI components
│   ├── directives/          # Shared directives
│   └── pipes/               # Shared pipes
├── features/                # Feature modules
│   └── weight-tracker/      # Feature-specific code
│       ├── components/      # Feature components
│       ├── pages/           # Route components
│       ├── services/        # Feature services
│       └── models/          # Feature models
└── app.component.ts         # Root component
```

### Naming Conventions

- **Components**: `kebab-case.component.ts` (e.g., `user-profile.component.ts`)
- **Services**: `kebab-case.service.ts` (e.g., `storage.service.ts`)
- **Interfaces**: `PascalCase` (e.g., `UserProfile`, `WeightEntry`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_FILE_SIZE`)
- **Functions**: `camelCase` (e.g., `getUserProfile()`)

---

## 📝 Commit Guidelines

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, no logic change)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks
- **ci**: CI/CD changes

### Examples

```bash
# Feature
feat(profile): add age and height fields to user profile

# Bug fix
fix(bmi): correct BMI calculation for metric units

# Documentation
docs(readme): update installation instructions

# Performance
perf(list): implement virtual scrolling for weight entries

# Refactor
refactor(storage): migrate to signals-based state management
```

### Commit Best Practices

- ✅ Write clear, descriptive messages
- ✅ Use present tense ("add feature" not "added feature")
- ✅ Keep subject line under 72 characters
- ✅ Reference issues in footer (`Closes #123`)
- ❌ Don't commit commented-out code
- ❌ Don't commit console.logs (use proper logging)
- ❌ Don't commit large binary files

---

## 📚 Documentation Requirements

### Code Documentation

#### 1. **Component Documentation**
```typescript
/**
 * User Profile Component
 * 
 * Displays and manages user profile information including name, age, height,
 * and avatar. Supports both metric and imperial units for height.
 * 
 * @example
 * <app-user-profile></app-user-profile>
 */
@Component({
  selector: 'app-user-profile',
  // ...
})
export class UserProfileComponent {
  /**
   * User's preferred height unit (cm or ft)
   */
  heightUnit = signal<'cm' | 'ft'>('cm');
}
```

#### 2. **Service Documentation**
```typescript
/**
 * Storage Service
 * 
 * Provides IndexedDB storage operations for offline-first data persistence.
 * Handles weight entries and user profile data.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  /**
   * Saves a weight entry to IndexedDB
   * 
   * @param entry - The weight entry to save
   * @returns Promise resolving to the saved entry with generated ID
   * @throws {Error} If IndexedDB is not available
   */
  async saveWeightEntry(entry: WeightEntry): Promise<WeightEntry> {
    // Implementation
  }
}
```

#### 3. **Complex Logic Documentation**
```typescript
/**
 * Converts height from feet and inches to centimeters
 * 
 * Formula: (feet × 12 + inches) × 2.54
 * 
 * @param feet - Height in feet (1-9)
 * @param inches - Additional inches (0-11)
 * @returns Height in centimeters
 */
private convertToMetric(feet: number, inches: number): number {
  const totalInches = (feet * 12) + inches;
  return totalInches * 2.54;
}
```

### Markdown Documentation

Every significant feature should have a corresponding `.md` file in the `/docs` folder:

```
docs/
├── ARCHITECTURE.md          # System architecture
├── FEATURES.md              # Feature documentation
├── API.md                   # API documentation
├── DEPLOYMENT.md            # Deployment guide
└── features/
    ├── profile-management.md
    ├── weight-tracking.md
    └── charts.md
```

### Documentation Checklist

- [ ] Component/Service has JSDoc comments
- [ ] Complex algorithms are explained
- [ ] Public APIs are documented
- [ ] Feature has corresponding `.md` file
- [ ] README.md is updated if needed
- [ ] Architecture diagrams updated (if applicable)

---

## 🧪 Testing Requirements

### Unit Tests

Every component and service should have basic unit tests:

```typescript
describe('UserProfileComponent', () => {
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with user data', () => {
    const mockProfile = { name: 'John', age: 30 };
    component.userProfile.set(mockProfile);
    expect(component.profileForm.value.name).toBe('John');
  });

  it('should convert height from cm to ft/in', () => {
    component.heightUnit.set('ft');
    const result = component.convertHeight(170);
    expect(result.feet).toBe(5);
    expect(result.inches).toBeCloseTo(7, 0);
  });
});
```

### Test Coverage

- **Minimum**: 50% coverage for new code
- **Target**: 70% coverage
- **Critical paths**: 90%+ coverage

### Running Tests

```bash
# Unit tests
npm test

# With coverage
npm run test:coverage

# E2E tests (when implemented)
npm run e2e
```

---

## 🔍 Pull Request Process

### Before Submitting

- [ ] Code follows style guide
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] No console.logs or debug code
- [ ] Build succeeds without warnings

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] All tests passing

## Documentation
- [ ] Code comments added
- [ ] README updated
- [ ] Feature documentation added

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Closes #123
```

### Review Process

1. **Automated Checks**: CI/CD runs tests and linting
2. **Code Review**: Maintainer reviews code quality
3. **Testing**: Reviewer tests functionality
4. **Approval**: PR approved and merged to `develop`
5. **Release**: Periodically merged to `main`

---

## 🎨 UI/UX Guidelines

### Design Principles

1. **Mobile-First**: Design for mobile, enhance for desktop
2. **Accessibility**: WCAG 2.1 Level AA compliance
3. **Performance**: Fast, responsive, smooth animations
4. **Consistency**: Follow existing design patterns

### Component Design

- Use CSS variables for theming
- Support both light and dark modes
- Minimum touch target: 44x44px
- Proper focus states for keyboard navigation
- Loading states for async operations
- Error states with helpful messages

### Example

```scss
.button {
  // Use CSS variables
  background-color: var(--color-primary);
  color: var(--color-text-on-primary);
  
  // Minimum touch target
  min-height: 44px;
  min-width: 44px;
  
  // Focus state
  &:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }
  
  // Loading state
  &.loading {
    opacity: 0.7;
    cursor: wait;
  }
}
```

---

## 🐛 Bug Reports

### Before Reporting

1. Check existing issues
2. Try latest version
3. Reproduce in clean environment

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 1.8.0]

**Additional context**
Any other relevant information
```

---

## 💡 Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Clear description of the problem

**Describe the solution you'd like**
What you want to happen

**Describe alternatives you've considered**
Other solutions you've thought about

**Additional context**
Mockups, examples, etc.

**Learning Value**
How does this feature help demonstrate engineering concepts?
```

---

## 📞 Questions?

- **Issues**: Open a GitHub issue
- **Discussions**: Use GitHub Discussions
- **Email**: [Your contact if applicable]

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

## 🙏 Acknowledgments

Thank you for contributing to FitLog and helping make this a better learning resource!

---

**Last Updated:** October 11, 2025  
**Version:** 1.0.0
