# SEO & Business Features Guide

**Purpose:** Prepare FitLog and utility projects for SEO optimization and basic business capabilities.

**Last Updated:** October 11, 2025  
**Version:** 1.0.0

---

## 📋 Table of Contents

1. [SEO Optimization](#seo-optimization)
2. [Business-Ready Features](#business-ready-features)
3. [Monetization Basics](#monetization-basics)
4. [Calendar & Booking](#calendar--booking)
5. [Chat & Communication](#chat--communication)
6. [Analytics & Tracking](#analytics--tracking)

---

## 🔍 SEO Optimization

### Meta Tags & Social Sharing

```typescript
// Angular Meta Service
@Injectable({ providedIn: 'root' })
export class SeoService {
  constructor(
    private meta: Meta,
    private title: Title
  ) {}
  
  updateMetaTags(config: {
    title: string;
    description: string;
    image?: string;
    url?: string;
    type?: string;
  }): void {
    // Page title
    this.title.setTitle(config.title);
    
    // Standard meta tags
    this.meta.updateTag({ name: 'description', content: config.description });
    this.meta.updateTag({ name: 'keywords', content: 'fitness, weight tracker, health, BMI' });
    
    // Open Graph (Facebook, LinkedIn)
    this.meta.updateTag({ property: 'og:title', content: config.title });
    this.meta.updateTag({ property: 'og:description', content: config.description });
    this.meta.updateTag({ property: 'og:type', content: config.type || 'website' });
    this.meta.updateTag({ property: 'og:url', content: config.url || window.location.href });
    this.meta.updateTag({ property: 'og:image', content: config.image || '/assets/og-image.png' });
    
    // Twitter Card
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: config.title });
    this.meta.updateTag({ name: 'twitter:description', content: config.description });
    this.meta.updateTag({ name: 'twitter:image', content: config.image || '/assets/og-image.png' });
  }
}
```

```typescript
// Usage in components
export class HomeComponent implements OnInit {
  constructor(private seo: SeoService) {}
  
  ngOnInit() {
    this.seo.updateMetaTags({
      title: 'FitLog - Track Your Fitness Journey',
      description: 'Free weight tracking app with BMI calculator, charts, and AI-powered suggestions. Works offline!',
      image: 'https://fitlog.app/assets/og-image.png',
      url: 'https://fitlog.app'
    });
  }
}
```

### Structured Data (Schema.org)

```typescript
// Add JSON-LD structured data
@Injectable({ providedIn: 'root' })
export class StructuredDataService {
  constructor(@Inject(DOCUMENT) private document: Document) {}
  
  addWebApplicationSchema(): void {
    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      'name': 'FitLog',
      'description': 'Weight tracking and fitness management application',
      'url': 'https://fitlog.app',
      'applicationCategory': 'HealthApplication',
      'operatingSystem': 'Any',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD'
      },
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': '4.8',
        'ratingCount': '150'
      }
    });
    this.document.head.appendChild(script);
  }
}
```

### Sitemap Generation

```xml
<!-- sitemap.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://fitlog.app/</loc>
    <lastmod>2025-10-11</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://fitlog.app/charts</loc>
    <lastmod>2025-10-11</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

### robots.txt

```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/

Sitemap: https://fitlog.app/sitemap.xml
```

### SSR for SEO

```typescript
// Angular Universal setup for better SEO
// Server-side rendering ensures search engines can crawl content

// app.config.server.ts
export const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering()
  ]
};
```

### Performance for SEO

- **Lighthouse Score**: Target 90+ (affects SEO ranking)
- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Mobile-First**: Responsive design is crucial
- **HTTPS**: Required for modern SEO

---

## 💼 Business-Ready Features

### 1. User Authentication & Profiles

```typescript
// Multi-tier user system
interface UserTier {
  FREE: {
    maxEntries: 100;
    features: ['basic-tracking', 'charts'];
  };
  PREMIUM: {
    maxEntries: -1; // unlimited
    features: ['basic-tracking', 'charts', 'ai-suggestions', 'export', 'sync'];
    price: 4.99; // per month
  };
  BUSINESS: {
    maxEntries: -1;
    features: ['all-premium', 'team-sharing', 'api-access', 'priority-support'];
    price: 19.99; // per month
  };
}
```

### 2. Subscription Management

```typescript
// Subscription service
@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private userTier = signal<'FREE' | 'PREMIUM' | 'BUSINESS'>('FREE');
  
  async upgradeToPremium(): Promise<void> {
    // Integrate with Stripe or similar
    const session = await this.createCheckoutSession('PREMIUM');
    window.location.href = session.url;
  }
  
  hasFeature(feature: string): boolean {
    const tier = this.userTier();
    return TIER_FEATURES[tier].includes(feature);
  }
  
  canAddEntry(): boolean {
    const tier = this.userTier();
    const entryCount = this.getEntryCount();
    const maxEntries = TIER_LIMITS[tier].maxEntries;
    
    return maxEntries === -1 || entryCount < maxEntries;
  }
}
```

### 3. Payment Integration (Stripe)

```typescript
// Stripe integration
@Injectable({ providedIn: 'root' })
export class PaymentService {
  private stripe = loadStripe(environment.stripePublicKey);
  
  async createCheckoutSession(plan: 'PREMIUM' | 'BUSINESS'): Promise<any> {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan })
    });
    
    return response.json();
  }
  
  async handlePaymentSuccess(sessionId: string): Promise<void> {
    // Verify payment and upgrade user
    await this.verifyPayment(sessionId);
    this.subscriptionService.upgradeUser();
  }
}
```

```typescript
// Backend (NestJS)
@Controller('payments')
export class PaymentsController {
  @Post('create-checkout-session')
  async createCheckoutSession(@Body() body: { plan: string }) {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: PRICE_IDS[body.plan],
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    });
    
    return { url: session.url };
  }
  
  @Post('webhook')
  async handleWebhook(@Req() req: Request) {
    const sig = req.headers['stripe-signature'];
    const event = this.stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    if (event.type === 'checkout.session.completed') {
      await this.fulfillOrder(event.data.object);
    }
    
    return { received: true };
  }
}
```

### 4. Feature Flags

```typescript
// Feature flag service for gradual rollout
@Injectable({ providedIn: 'root' })
export class FeatureFlagService {
  private flags = signal<Record<string, boolean>>({
    'ai-suggestions': false,
    'team-sharing': false,
    'export-pdf': false,
    'calendar-booking': false
  });
  
  async loadFlags(userId: string): Promise<void> {
    const flags = await this.api.getFeatureFlags(userId);
    this.flags.set(flags);
  }
  
  isEnabled(feature: string): boolean {
    return this.flags()[feature] || false;
  }
}
```

---

## 📅 Calendar & Booking

### Calendar Integration

```typescript
// Calendar booking service
@Injectable({ providedIn: 'root' })
export class CalendarService {
  // Integration with Google Calendar, Calendly, or custom solution
  
  async createBooking(booking: {
    title: string;
    startTime: Date;
    endTime: Date;
    attendees: string[];
    description?: string;
  }): Promise<CalendarEvent> {
    // Create calendar event
    const event = await this.api.post('/calendar/events', booking);
    
    // Send email notifications
    await this.sendBookingConfirmation(event);
    
    return event;
  }
  
  async getAvailableSlots(
    date: Date,
    duration: number
  ): Promise<TimeSlot[]> {
    // Check availability
    const slots = await this.api.get('/calendar/availability', {
      date: date.toISOString(),
      duration
    });
    
    return slots;
  }
}
```

### Booking UI Component

```typescript
@Component({
  selector: 'app-booking-calendar',
  template: `
    <div class="booking-calendar">
      <h3>{{ 'booking.title' | translate }}</h3>
      
      <!-- Date picker -->
      <input type="date" [(ngModel)]="selectedDate" />
      
      <!-- Available time slots -->
      <div class="time-slots">
        @for (slot of availableSlots(); track slot.id) {
          <button 
            class="time-slot"
            [class.selected]="selectedSlot() === slot"
            (click)="selectSlot(slot)">
            {{ slot.startTime | date:'shortTime' }}
          </button>
        }
      </div>
      
      <!-- Booking form -->
      @if (selectedSlot()) {
        <form [formGroup]="bookingForm" (ngSubmit)="confirmBooking()">
          <input 
            type="text" 
            formControlName="name" 
            placeholder="Your name" />
          <input 
            type="email" 
            formControlName="email" 
            placeholder="Your email" />
          <textarea 
            formControlName="notes" 
            placeholder="Additional notes"></textarea>
          
          <button type="submit" [disabled]="bookingForm.invalid">
            {{ 'booking.confirm' | translate }}
          </button>
        </form>
      }
    </div>
  `
})
export class BookingCalendarComponent {
  selectedDate = signal(new Date());
  availableSlots = signal<TimeSlot[]>([]);
  selectedSlot = signal<TimeSlot | null>(null);
  
  bookingForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    notes: ['']
  });
  
  async confirmBooking(): Promise<void> {
    const slot = this.selectedSlot();
    const formValue = this.bookingForm.value;
    
    await this.calendarService.createBooking({
      title: `Consultation with ${formValue.name}`,
      startTime: slot.startTime,
      endTime: slot.endTime,
      attendees: [formValue.email],
      description: formValue.notes
    });
    
    this.showSuccessMessage();
  }
}
```

### Calendly Integration (Simple)

```typescript
// Embed Calendly widget
@Component({
  selector: 'app-calendly-widget',
  template: `
    <div 
      class="calendly-inline-widget" 
      data-url="https://calendly.com/your-username/consultation"
      style="min-width:320px;height:630px;">
    </div>
  `
})
export class CalendlyWidgetComponent implements OnInit {
  ngOnInit() {
    // Load Calendly script
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);
  }
}
```

---

## 💬 Chat & Communication

### Simple Chat Widget

```typescript
// Chat service
@Injectable({ providedIn: 'root' })
export class ChatService {
  private socket: Socket;
  private messages = signal<ChatMessage[]>([]);
  
  constructor() {
    this.socket = io('/chat');
    
    this.socket.on('message', (message: ChatMessage) => {
      this.messages.update(msgs => [...msgs, message]);
    });
  }
  
  sendMessage(text: string): void {
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      text,
      userId: this.authService.getUserId(),
      timestamp: new Date()
    };
    
    this.socket.emit('message', message);
  }
  
  getMessages() {
    return this.messages.asReadonly();
  }
}
```

```typescript
// Chat widget component
@Component({
  selector: 'app-chat-widget',
  template: `
    <div class="chat-widget" [class.open]="isOpen()">
      <!-- Chat button -->
      <button class="chat-toggle" (click)="toggleChat()">
        💬 Chat with us
      </button>
      
      <!-- Chat window -->
      @if (isOpen()) {
        <div class="chat-window">
          <div class="chat-header">
            <h4>Support Chat</h4>
            <button (click)="toggleChat()">×</button>
          </div>
          
          <div class="chat-messages">
            @for (msg of messages(); track msg.id) {
              <div class="message" [class.own]="msg.userId === currentUserId">
                <p>{{ msg.text }}</p>
                <span class="timestamp">{{ msg.timestamp | date:'short' }}</span>
              </div>
            }
          </div>
          
          <div class="chat-input">
            <input 
              type="text" 
              [(ngModel)]="messageText"
              (keyup.enter)="sendMessage()"
              placeholder="Type a message..." />
            <button (click)="sendMessage()">Send</button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .chat-widget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
    }
    
    .chat-toggle {
      padding: 12px 24px;
      background: var(--color-primary);
      color: white;
      border: none;
      border-radius: 24px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .chat-window {
      position: absolute;
      bottom: 60px;
      right: 0;
      width: 350px;
      height: 500px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      display: flex;
      flex-direction: column;
    }
  `]
})
export class ChatWidgetComponent {
  isOpen = signal(false);
  messages = this.chatService.getMessages();
  messageText = '';
  currentUserId = this.authService.getUserId();
  
  constructor(
    private chatService: ChatService,
    private authService: AuthService
  ) {}
  
  toggleChat(): void {
    this.isOpen.update(open => !open);
  }
  
  sendMessage(): void {
    if (this.messageText.trim()) {
      this.chatService.sendMessage(this.messageText);
      this.messageText = '';
    }
  }
}
```

### Intercom/Crisp Integration

```typescript
// Third-party chat integration
@Injectable({ providedIn: 'root' })
export class IntercomService {
  boot(user: { email: string; name: string }): void {
    (window as any).Intercom('boot', {
      app_id: environment.intercomAppId,
      email: user.email,
      name: user.name,
      created_at: Date.now()
    });
  }
  
  show(): void {
    (window as any).Intercom('show');
  }
  
  hide(): void {
    (window as any).Intercom('hide');
  }
}
```

---

## 📊 Analytics & Tracking

### Google Analytics 4

```typescript
// Analytics service
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  constructor(private router: Router) {
    this.initGA4();
    this.trackPageViews();
  }
  
  private initGA4(): void {
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${environment.ga4MeasurementId}`;
    script.async = true;
    document.head.appendChild(script);
    
    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(...args: any[]) {
      (window as any).dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', environment.ga4MeasurementId);
  }
  
  private trackPageViews(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.trackPageView(event.urlAfterRedirects);
    });
  }
  
  trackPageView(url: string): void {
    (window as any).gtag('config', environment.ga4MeasurementId, {
      page_path: url
    });
  }
  
  trackEvent(eventName: string, params?: any): void {
    (window as any).gtag('event', eventName, params);
  }
}
```

### Custom Event Tracking

```typescript
// Track user actions
export class WeightTrackerComponent {
  addEntry(entry: WeightEntry): void {
    this.weightService.addEntry(entry);
    
    // Track event
    this.analytics.trackEvent('add_weight_entry', {
      weight: entry.weight,
      bmi: this.calculateBMI(entry.weight),
      has_notes: !!entry.notes
    });
  }
}
```

---

## 💰 Monetization Basics

### 1. Google AdSense (Utility Sites)

```html
<!-- Add to index.html -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
     crossorigin="anonymous"></script>
```

```typescript
// Ad component
@Component({
  selector: 'app-ad-banner',
  template: `
    <ins class="adsbygoogle"
         style="display:block"
         data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
         data-ad-slot="XXXXXXXXXX"
         data-ad-format="auto"
         data-full-width-responsive="true"></ins>
  `
})
export class AdBannerComponent implements AfterViewInit {
  ngAfterViewInit() {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }
}
```

### 2. Freemium Model

```typescript
// Paywall component
@Component({
  selector: 'app-feature-paywall',
  template: `
    <div class="paywall-overlay">
      <div class="paywall-content">
        <h3>🚀 Upgrade to Premium</h3>
        <p>Unlock AI-powered suggestions, unlimited entries, and more!</p>
        
        <ul class="features-list">
          <li>✅ Unlimited weight entries</li>
          <li>✅ AI health suggestions</li>
          <li>✅ Export data (CSV/PDF)</li>
          <li>✅ Device synchronization</li>
          <li>✅ Priority support</li>
        </ul>
        
        <div class="pricing">
          <span class="price">$4.99/month</span>
          <span class="trial">7-day free trial</span>
        </div>
        
        <button class="upgrade-btn" (click)="upgrade()">
          Start Free Trial
        </button>
        
        <a href="#" (click)="dismiss()">Maybe later</a>
      </div>
    </div>
  `
})
export class FeaturePaywallComponent {
  upgrade(): void {
    this.subscriptionService.startTrial();
  }
}
```

### 3. Affiliate Links

```typescript
// Affiliate service
@Injectable({ providedIn: 'root' })
export class AffiliateService {
  getAffiliateLink(product: string): string {
    const affiliateLinks = {
      'fitness-tracker': 'https://amazon.com/dp/XXXXX?tag=youraffid-20',
      'scale': 'https://amazon.com/dp/YYYYY?tag=youraffid-20'
    };
    
    return affiliateLinks[product] || '';
  }
  
  trackAffiliateClick(product: string): void {
    this.analytics.trackEvent('affiliate_click', { product });
  }
}
```

---

## ✅ Implementation Checklist

### SEO Basics
- [ ] Meta tags service
- [ ] Open Graph tags
- [ ] Twitter Card tags
- [ ] Structured data (JSON-LD)
- [ ] Sitemap.xml
- [ ] robots.txt
- [ ] SSR/SSG for critical pages
- [ ] Lighthouse score >90

### Business Features
- [ ] User authentication
- [ ] Subscription tiers (Free/Premium/Business)
- [ ] Payment integration (Stripe)
- [ ] Feature flags
- [ ] Usage limits
- [ ] Upgrade prompts

### Calendar & Booking
- [ ] Calendar integration
- [ ] Availability management
- [ ] Booking form
- [ ] Email confirmations
- [ ] Calendly/similar integration

### Chat & Support
- [ ] Chat widget
- [ ] WebSocket chat backend
- [ ] Message persistence
- [ ] Notification system
- [ ] Or third-party integration (Intercom/Crisp)

### Analytics
- [ ] Google Analytics 4
- [ ] Custom event tracking
- [ ] Conversion tracking
- [ ] User behavior analysis

### Monetization
- [ ] AdSense (for utility sites)
- [ ] Freemium paywall
- [ ] Subscription management
- [ ] Affiliate links (optional)

---

## 📚 Resources

- [Google Search Console](https://search.google.com/search-console)
- [Stripe Documentation](https://stripe.com/docs)
- [Google Analytics 4](https://developers.google.com/analytics/devguides/collection/ga4)
- [Schema.org](https://schema.org/)
- [Calendly API](https://developer.calendly.com/)
- [Intercom](https://www.intercom.com/)

---

**Last Updated:** October 11, 2025  
**Next Review:** After implementing basic features
