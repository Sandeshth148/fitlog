# Technical Debt & Future Improvements

## Overview
This document tracks technical debt, known issues, and planned improvements for FitLog.

## 🔧 Current Issues

### 1. Language Dropdown Issues
**Priority**: Medium
**Status**: Open

**Problems**:
- Dark/Light theme doesn't apply to dropdown styling
- Dropdown doesn't close when clicking outside
- No keyboard navigation support

**Technical Details**:
- Dropdown uses custom CSS that doesn't inherit theme variables
- Missing click-outside directive or event listener
- No focus management for accessibility

**Proposed Solutions**:
1. **Quick Fix**: Add click-outside event listener
2. **Better Fix**: Create reusable dropdown component with:
   - Theme-aware styling
   - Click-outside handling
   - Keyboard navigation (ESC, Arrow keys)
   - ARIA accessibility attributes

**Implementation Notes**:
```typescript
// Option 1: Simple click-outside listener
@HostListener('document:click', ['$event'])
onDocumentClick(event: Event) {
  if (!this.elementRef.nativeElement.contains(event.target)) {
    this.closeDropdown();
  }
}

// Option 2: Reusable dropdown directive
@Directive({ selector: '[clickOutside]' })
export class ClickOutsideDirective { ... }
```

### 2. Theme Button Placement
**Priority**: Low
**Status**: Open

**Problem**: 
- Theme toggle button is in main header, should be near language switcher
- Creates visual imbalance in navigation

**Solution**:
- Move theme button to navigation bar beside language switcher
- Create consistent button group styling

### 3. FitLog Logo Positioning
**Priority**: Low  
**Status**: Open

**Problem**:
- Logo positioning needs adjustment for better visual balance
- May need responsive adjustments

**Solution**:
- Review logo placement and spacing
- Ensure consistent alignment across screen sizes

---

## 🚀 Future Enhancements

### 1. Advanced Dropdown Component
**Priority**: Medium
**Effort**: 2-3 hours

**Features**:
- Reusable across the app
- Theme-aware styling
- Keyboard navigation
- Animation transitions
- Portal rendering (for z-index issues)

### 2. Improved Navigation Layout
**Priority**: Low
**Effort**: 1-2 hours

**Features**:
- Better responsive design
- Consistent spacing and alignment
- Mobile-first approach
- Hamburger menu for mobile

### 3. Advanced Theming System
**Priority**: Low
**Effort**: 3-4 hours

**Features**:
- More theme options (Auto, System preference)
- Custom color schemes
- Theme persistence across sessions
- Smooth theme transitions

---

## 📋 Quick Wins (< 1 hour each)

1. **Fix dropdown click-outside**: Add simple event listener
2. **Move theme button**: Relocate to navigation area
3. **Adjust logo positioning**: CSS tweaks for better alignment
4. **Add dropdown animations**: Simple CSS transitions
5. **Improve button grouping**: Consistent styling for nav buttons

---

## 🎯 Long-term Goals

### 1. Component Library
- Extract reusable components (Button, Dropdown, Modal)
- Consistent design system
- Storybook documentation

### 2. Advanced PWA Features
- Offline data sync
- Background sync
- Push notifications
- App shortcuts

### 3. Performance Optimizations
- Lazy loading for routes
- Image optimization
- Bundle size analysis
- Core Web Vitals improvements

---

## 📊 Technical Metrics to Track

1. **Bundle Size**: Current ~670KB, target <500KB
2. **Lighthouse Score**: Current ~85, target >90
3. **Core Web Vitals**: Monitor LCP, FID, CLS
4. **Accessibility**: WCAG 2.1 AA compliance
5. **Browser Support**: Modern browsers (ES2020+)

---

## 🔄 Review Process

- **Weekly**: Review and prioritize new items
- **Monthly**: Assess progress and update priorities  
- **Quarterly**: Major architecture reviews

---

*Last Updated: January 4, 2025*
*Next Review: January 11, 2025*
