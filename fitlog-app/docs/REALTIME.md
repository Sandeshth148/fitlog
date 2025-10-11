# Real-Time Architecture Guide

**Purpose:** Comprehensive guide for implementing real-time features in FitLog and related projects.

**Last Updated:** October 11, 2025  
**Version:** 1.0.0

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Real-Time Technologies](#real-time-technologies)
3. [When to Use What](#when-to-use-what)
4. [Architecture Patterns](#architecture-patterns)
5. [Implementation Phases](#implementation-phases)
6. [Security Considerations](#security-considerations)
7. [Code Examples](#code-examples)
8. [Testing Strategy](#testing-strategy)

---

## 🎯 Overview

Real-time features enable instant synchronization across devices, collaborative editing, live notifications, and dynamic user experiences. This guide covers implementation strategies for FitLog.

### Use Cases for FitLog

1. **Device Sync**: Same user, multiple devices showing identical state
2. **AI Feed**: Live suggestions and tips based on user activity
3. **Collaborative Features**: Shared workout plans or meal tracking
4. **Push Notifications**: Reminders, achievements, motivational messages
5. **Live Activity Feed**: Real-time updates from connected users

---

## 🔌 Real-Time Technologies

### 1. Polling

**Description:** Client repeatedly requests updates from server at fixed intervals.

```typescript
// Simple polling example
setInterval(async () => {
  const updates = await fetch('/api/updates').then(r => r.json());
  updateUI(updates);
}, 5000); // Every 5 seconds
```

**Pros:**
- Simple to implement
- Works with any HTTP server
- No special infrastructure needed

**Cons:**
- Wasteful (many empty responses)
- High latency (up to polling interval)
- Increased server load

**When to Use:** Simple, low-frequency updates where real-time isn't critical.

---

### 2. Long Polling

**Description:** Client makes request, server holds connection until data available.

```typescript
async function longPoll() {
  try {
    const response = await fetch('/api/long-poll', {
      signal: AbortSignal.timeout(30000) // 30s timeout
    });
    const data = await response.json();
    handleUpdate(data);
  } catch (error) {
    console.error('Long poll error:', error);
  } finally {
    // Immediately reconnect
    longPoll();
  }
}
```

**Pros:**
- Near real-time updates
- Works with standard HTTP
- Better than regular polling

**Cons:**
- Still creates many connections
- Complex error handling
- Not true bidirectional

**When to Use:** When WebSocket isn't available but need better than polling.

---

### 3. Server-Sent Events (SSE)

**Description:** Server pushes updates to client over persistent HTTP connection.

```typescript
// Client-side (Angular Service)
@Injectable({ providedIn: 'root' })
export class FeedService {
  private eventSource: EventSource | null = null;
  private feedUpdates$ = new Subject<FeedItem>();
  
  connectToFeed(userId: string): Observable<FeedItem> {
    this.eventSource = new EventSource(`/api/feed/${userId}`);
    
    this.eventSource.onmessage = (event) => {
      const feedItem = JSON.parse(event.data);
      this.feedUpdates$.next(feedItem);
    };
    
    this.eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      this.reconnect(userId);
    };
    
    return this.feedUpdates$.asObservable();
  }
  
  disconnect(): void {
    this.eventSource?.close();
  }
}
```

```typescript
// Server-side (NestJS)
@Controller('feed')
export class FeedController {
  @Sse(':userId')
  streamFeed(@Param('userId') userId: string): Observable<MessageEvent> {
    return interval(1000).pipe(
      map(() => ({
        data: {
          type: 'suggestion',
          message: 'Great progress! Keep it up!',
          timestamp: new Date()
        }
      }))
    );
  }
}
```

**Pros:**
- Unidirectional server → client (perfect for feeds)
- Built-in reconnection
- Simple HTTP-based
- Lower overhead than WebSocket for one-way data

**Cons:**
- One-way only (client can't send via SSE)
- Limited browser support (IE doesn't support)
- Connection limits per domain

**When to Use:** 
- Live feeds (AI suggestions, activity stream)
- Notifications
- Progress updates
- Any server → client streaming

---

### 4. WebSocket

**Description:** Full-duplex, bidirectional communication channel.

```typescript
// Client-side (Angular Service)
@Injectable({ providedIn: 'root' })
export class SyncService {
  private socket: Socket;
  private syncUpdates$ = new Subject<SyncEvent>();
  
  constructor() {
    this.socket = io('wss://api.fitlog.com', {
      auth: {
        token: this.getAuthToken()
      }
    });
    
    this.socket.on('connect', () => {
      console.log('Connected to sync server');
      this.joinUserRoom();
    });
    
    this.socket.on('state-update', (data) => {
      this.syncUpdates$.next(data);
    });
  }
  
  private joinUserRoom(): void {
    const userId = this.getUserId();
    this.socket.emit('join-room', { userId });
  }
  
  sendStateUpdate(state: any): void {
    this.socket.emit('state-update', state);
  }
  
  onStateUpdate(): Observable<SyncEvent> {
    return this.syncUpdates$.asObservable();
  }
}
```

```typescript
// Server-side (NestJS WebSocket Gateway)
@WebSocketGateway({
  cors: { origin: '*' }
})
export class SyncGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  
  private userSockets = new Map<string, Set<string>>();
  
  async handleConnection(client: Socket) {
    const token = client.handshake.auth.token;
    const userId = await this.validateToken(token);
    
    if (!userId) {
      client.disconnect();
      return;
    }
    
    // Track user's sockets
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(client.id);
    
    client.join(`user:${userId}`);
  }
  
  handleDisconnect(client: Socket) {
    // Clean up tracking
  }
  
  @SubscribeMessage('state-update')
  handleStateUpdate(client: Socket, payload: any) {
    const userId = this.getUserIdFromSocket(client);
    
    // Broadcast to all user's devices except sender
    client.to(`user:${userId}`).emit('state-update', payload);
  }
}
```

**Pros:**
- True bidirectional communication
- Low latency
- Efficient for high-frequency updates
- Perfect for chat, collaboration, gaming

**Cons:**
- More complex than SSE
- Requires WebSocket server
- Connection management needed
- Firewall/proxy issues possible

**When to Use:**
- Chat applications
- Device synchronization
- Collaborative editing
- Real-time gaming
- Any bidirectional real-time needs

---

### 5. WebRTC

**Description:** Peer-to-peer communication for media and data.

**Pros:**
- Direct peer-to-peer (no server routing)
- Low latency
- Great for video/audio
- Can be used for data channels

**Cons:**
- Complex setup (signaling server needed)
- NAT traversal challenges
- Browser compatibility varies

**When to Use:**
- Video calls
- Screen sharing
- Peer-to-peer file transfer
- Collaborative whiteboard (with CRDT)

---

### 6. Webhooks

**Description:** Server-to-server HTTP callbacks for event notifications.

```typescript
// Webhook receiver (NestJS)
@Controller('webhooks')
export class WebhookController {
  @Post('external')
  async handleWebhook(
    @Body() payload: any,
    @Headers('x-signature') signature: string
  ) {
    // Verify signature
    if (!this.verifySignature(payload, signature)) {
      throw new UnauthorizedException('Invalid signature');
    }
    
    // Process webhook
    await this.processExternalEvent(payload);
    
    return { received: true };
  }
  
  private verifySignature(payload: any, signature: string): boolean {
    const secret = process.env.WEBHOOK_SECRET;
    const computed = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(computed)
    );
  }
}
```

**When to Use:**
- Third-party integrations (Stripe, GitHub, etc.)
- Microservice communication
- Event-driven architecture

---

## 🎯 When to Use What

| Use Case | Technology | Reason |
|----------|------------|--------|
| AI Feed / Suggestions | SSE | One-way server → client, simple |
| Device Sync | WebSocket | Bidirectional, low latency |
| Chat | WebSocket | Real-time bidirectional |
| Collaborative Editing | WebSocket + CRDT (Yjs) | Conflict-free concurrent edits |
| Push Notifications | SSE or WebSocket | Server-initiated updates |
| External Integrations | Webhooks | Server-to-server events |
| Video Calls | WebRTC | Peer-to-peer media |
| Status Updates | SSE | Simple streaming |

---

## 🏗 Architecture Patterns

### Pattern 1: SSE Feed with Redis Pub/Sub

```
┌─────────────┐
│   Client    │
│  (Angular)  │
└──────┬──────┘
       │ SSE
       ↓
┌─────────────┐     ┌─────────────┐
│  NestJS API │────→│    Redis    │
│  (SSE Route)│←────│  (Pub/Sub)  │
└─────────────┘     └─────────────┘
       ↑                    ↑
       │                    │
┌──────┴──────┐     ┌──────┴──────┐
│   Worker    │────→│   Worker    │
│  (Process   │     │  (Process   │
│   Events)   │     │   Events)   │
└─────────────┘     └─────────────┘
```

### Pattern 2: WebSocket Device Sync

```
┌─────────────┐     ┌─────────────┐
│  Desktop    │     │   Mobile    │
│   Client    │     │   Client    │
└──────┬──────┘     └──────┬──────┘
       │                   │
       │    WebSocket      │
       └────────┬──────────┘
                ↓
         ┌─────────────┐
         │  Socket.IO  │
         │   Gateway   │
         └──────┬──────┘
                │
         ┌──────┴──────┐
         │    Redis    │
         │   Adapter   │
         └─────────────┘
```

### Pattern 3: Collaborative Editing with Yjs

```
┌─────────────┐     ┌─────────────┐
│   User A    │     │   User B    │
└──────┬──────┘     └──────┬──────┘
       │                   │
       │    Yjs Protocol   │
       └────────┬──────────┘
                ↓
         ┌─────────────┐
         │ y-websocket │
         │   Server    │
         └──────┬──────┘
                │
         ┌──────┴──────┐
         │  Persistence│
         │   (Optional)│
         └─────────────┘
```

---

## 🚀 Implementation Phases

### Phase A: Live Feed & Notifications (SSE + Webhooks)

**Goal:** Display live AI suggestions and activity feed.

**Steps:**
1. Create SSE endpoint in NestJS
2. Implement Angular service to consume SSE
3. Add webhook receiver for external events
4. Integrate Redis Pub/Sub for event distribution
5. Create feed UI component

**Demo:** Show AI suggestions appearing in real-time as user adds weight entries.

---

### Phase B: Device Synchronization (WebSocket)

**Goal:** Keep app state synced across all user's devices.

**Steps:**
1. Set up Socket.IO gateway in NestJS
2. Implement authentication at handshake
3. Create room-based architecture (one room per user)
4. Add Redis adapter for multi-instance support
5. Implement presence tracking
6. Create Angular sync service

**Demo:** Add weight entry on desktop, instantly appears on mobile.

---

### Phase C: Collaborative Editing (Yjs + WebSocket)

**Goal:** Allow multiple users to edit shared content concurrently.

**Steps:**
1. Integrate Yjs library
2. Set up y-websocket server
3. Create shared document types
4. Implement Angular Yjs service
5. Add collaborative UI indicators (cursors, selections)

**Demo:** Two users editing same workout plan simultaneously.

---

### Phase D: Chat & Activity Stream (WebSocket + Persistence)

**Goal:** Full chat functionality with history.

**Steps:**
1. Design message schema
2. Implement WebSocket message handlers
3. Add database persistence
4. Create pagination for history
5. Add typing indicators and read receipts
6. Build chat UI

**Demo:** Real-time chat with message history.

---

## 🔒 Security Considerations

### 1. Authentication

```typescript
// Validate JWT at WebSocket handshake
async handleConnection(client: Socket) {
  try {
    const token = client.handshake.auth.token;
    const payload = await this.jwtService.verifyAsync(token);
    
    // Store user info in socket
    client.data.userId = payload.sub;
    client.data.email = payload.email;
    
  } catch (error) {
    client.disconnect();
  }
}
```

### 2. Authorization

```typescript
// Check permissions before allowing room join
@SubscribeMessage('join-room')
async handleJoinRoom(client: Socket, payload: { roomId: string }) {
  const userId = client.data.userId;
  const hasAccess = await this.checkRoomAccess(userId, payload.roomId);
  
  if (!hasAccess) {
    client.emit('error', { message: 'Access denied' });
    return;
  }
  
  client.join(payload.roomId);
}
```

### 3. Rate Limiting

```typescript
// Prevent spam/DOS
private rateLimiter = new Map<string, number[]>();

@SubscribeMessage('message')
handleMessage(client: Socket, payload: any) {
  const userId = client.data.userId;
  const now = Date.now();
  
  // Get recent messages
  const recent = this.rateLimiter.get(userId) || [];
  const recentInWindow = recent.filter(t => now - t < 60000); // 1 minute
  
  if (recentInWindow.length >= 10) {
    client.emit('error', { message: 'Rate limit exceeded' });
    return;
  }
  
  recentInWindow.push(now);
  this.rateLimiter.set(userId, recentInWindow);
  
  // Process message
  this.processMessage(client, payload);
}
```

### 4. Input Validation

```typescript
// Validate all incoming data
@SubscribeMessage('state-update')
handleStateUpdate(
  @MessageBody() payload: StateUpdateDto,
  @ConnectedSocket() client: Socket
) {
  // DTO with class-validator decorators
  // NestJS automatically validates
}
```

### 5. Secure Connections

```typescript
// Always use TLS for production
const httpsServer = https.createServer({
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
}, app);

const io = new Server(httpsServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS.split(','),
    credentials: true
  }
});
```

---

## 💻 Code Examples

### Complete SSE Feed Example

**Backend (NestJS):**

```typescript
@Controller('feed')
export class FeedController {
  constructor(
    private readonly redisService: RedisService,
    private readonly aiService: AIService
  ) {}
  
  @Sse(':userId')
  async streamFeed(
    @Param('userId') userId: string,
    @Req() request: Request
  ): Promise<Observable<MessageEvent>> {
    // Verify user authentication
    const user = await this.validateUser(request);
    if (user.id !== userId) {
      throw new UnauthorizedException();
    }
    
    // Subscribe to Redis channel for this user
    const subscriber = this.redisService.createSubscriber();
    await subscriber.subscribe(`feed:${userId}`);
    
    return new Observable((observer) => {
      // Send initial connection message
      observer.next({
        data: { type: 'connected', timestamp: new Date() }
      });
      
      // Listen for Redis messages
      subscriber.on('message', (channel, message) => {
        observer.next({
          data: JSON.parse(message)
        });
      });
      
      // Handle client disconnect
      request.on('close', () => {
        subscriber.unsubscribe();
        subscriber.quit();
        observer.complete();
      });
    });
  }
}
```

**Frontend (Angular):**

```typescript
@Injectable({ providedIn: 'root' })
export class FeedService {
  private eventSource: EventSource | null = null;
  private feedItems = signal<FeedItem[]>([]);
  private isConnected = signal(false);
  
  connectToFeed(userId: string): void {
    const token = this.authService.getToken();
    this.eventSource = new EventSource(
      `/api/feed/${userId}?token=${token}`
    );
    
    this.eventSource.onopen = () => {
      this.isConnected.set(true);
      console.log('Feed connected');
    };
    
    this.eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'suggestion') {
        this.feedItems.update(items => [data, ...items]);
      }
    };
    
    this.eventSource.onerror = (error) => {
      console.error('Feed error:', error);
      this.isConnected.set(false);
      
      // Reconnect after delay
      setTimeout(() => this.connectToFeed(userId), 5000);
    };
  }
  
  disconnect(): void {
    this.eventSource?.close();
    this.isConnected.set(false);
  }
  
  getFeedItems() {
    return this.feedItems.asReadonly();
  }
}
```

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
describe('SyncService', () => {
  let service: SyncService;
  let mockSocket: any;
  
  beforeEach(() => {
    mockSocket = {
      on: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn()
    };
    
    service = new SyncService();
    service['socket'] = mockSocket;
  });
  
  it('should send state update', () => {
    const state = { weight: 70 };
    service.sendStateUpdate(state);
    
    expect(mockSocket.emit).toHaveBeenCalledWith('state-update', state);
  });
});
```

### Integration Tests

```typescript
describe('WebSocket Gateway', () => {
  let gateway: SyncGateway;
  let client: Socket;
  
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [SyncGateway]
    }).compile();
    
    gateway = module.get(SyncGateway);
    client = await createTestSocket();
  });
  
  it('should sync state across devices', (done) => {
    const client2 = await createTestSocket();
    
    client2.on('state-update', (data) => {
      expect(data.weight).toBe(70);
      done();
    });
    
    client.emit('state-update', { weight: 70 });
  });
});
```

---

## 📚 Resources

- [Socket.IO Documentation](https://socket.io/docs/)
- [Server-Sent Events MDN](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [Yjs Documentation](https://docs.yjs.dev/)
- [WebRTC for Beginners](https://webrtc.org/getting-started/overview)
- [NestJS WebSockets](https://docs.nestjs.com/websockets/gateways)

---

**Last Updated:** October 11, 2025  
**Next Review:** After implementing Phase A
