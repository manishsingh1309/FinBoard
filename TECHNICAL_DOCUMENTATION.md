# FinBoard - Technical Documentation

## Architecture Overview

FinBoard is a modern, full-stack Next.js application that enables users to create customizable financial dashboards with real-time data visualization. The architecture follows a component-based design with clear separation of concerns.

### Core Architecture Principles

1. **Server-First Security**: API keys are handled server-side only via `/api/proxy`
2. **Client-Side State Management**: Zustand with persistence for dashboard configuration
3. **Real-time Data**: SWR for efficient caching and auto-refresh
4. **Component Composition**: Modular widget system with pluggable data sources
5. **Progressive Enhancement**: Works without JavaScript for basic functionality

## Technology Stack & Rationale

### Frontend Framework: Next.js 14+ (App Router)
**Why chosen:**
- **File-based routing**: Intuitive organization of pages and API routes
- **Server Components**: Better performance and SEO
- **Built-in API routes**: Secure server-side proxy for API key management
- **Vercel optimization**: Seamless deployment and edge functions
- **TypeScript support**: Built-in type safety



### Styling: Tailwind CSS + shadcn/ui
**Why chosen:**
- **Utility-first**: Rapid development with consistent design tokens
- **Component library**: shadcn/ui provides accessible, customizable components
- **Design system**: Built-in dark mode and theming support
- **Performance**: Purged CSS, only ships used styles
- **Developer experience**: IntelliSense and consistent naming



### State Management: Zustand + Persistence
**Why chosen:**
- **Lightweight**: ~2KB vs Redux's ~10KB+ ecosystem
- **Simple API**: No boilerplate, direct state mutations
- **TypeScript-first**: Excellent type inference
- **Persistence**: Built-in localStorage integration
- **No providers**: Direct hook usage, simpler component tree



### Data Fetching: SWR (Stale-While-Revalidate)
**Why chosen:**
- **Caching strategy**: Shows cached data immediately, updates in background
- **Deduplication**: Multiple components requesting same data = single request
- **Auto-refresh**: Configurable intervals for real-time updates
- **Error handling**: Built-in retry logic and error boundaries
- **Optimistic updates**: Better UX during mutations



### Charts: Chart.js + react-chartjs-2
**Why chosen:**
- **Performance**: Canvas-based rendering, handles large datasets
- **Accessibility**: Built-in ARIA labels and keyboard navigation
- **Customization**: Extensive plugin system and styling options
- **Responsive**: Automatic resizing and mobile optimization
- **Mature ecosystem**: Well-documented, stable API



### Drag & Drop: @hello-pangea/dnd
**Why chosen:**
- **Accessibility**: Full keyboard navigation and screen reader support
- **Performance**: Optimized for smooth animations
- **Flexible**: Supports multiple drag patterns (lists, grids, etc.)
- **TypeScript**: Excellent type definitions
- **Maintained**: Active fork of react-beautiful-dnd


## Performance Optimizations

### 1. Code Splitting
- **Route-based**: Each page loads only necessary code
- **Component-based**: Heavy components (charts) load on demand
- **Dynamic imports**: Widget types loaded when needed

### 2. Caching Strategy
- **SWR cache**: In-memory cache with TTL
- **Browser cache**: Static assets cached aggressively
- **API response cache**: Server-side caching for expensive API calls

### 3. Rendering Optimizations
- **Server Components**: Initial HTML rendered server-side
- **Client hydration**: Minimal JavaScript for interactivity
- **Virtual scrolling**: For large datasets in tables

## Security Considerations

### 1. API Key Management
- **Server-only**: Keys stored in environment variables
- **Proxy pattern**: Client never accesses external APIs directly
- **Validation**: Input sanitization on all API endpoints

### 2. Data Validation
- **TypeScript**: Compile-time type checking
- **Runtime validation**: Zod schemas for API responses
- **Sanitization**: XSS prevention on user inputs

### 3. CORS & CSP
- **CORS headers**: Restrict API access to authorized domains
- **Content Security Policy**: Prevent script injection
- **HTTPS only**: All production traffic encrypted

## Scalability Considerations

### 1. Horizontal Scaling
- **Stateless design**: No server-side sessions

- **CDN integration**: Static assets served from edge locations

### 2. Database Strategy (Future)
- **Current**: Client-side persistence (localStorage)
- **Future**: PostgreSQL with user accounts and shared dashboards
- **Caching**: Redis for frequently accessed data

### 3. API Rate Limiting
- **Client-side**: Respect provider rate limits
- **Server-side**: Implement request queuing
- **Monitoring**: Track usage patterns and optimize

## Testing Strategy

### 1. Unit Tests
- **Components**: React Testing Library for UI components
- **Utilities**: Jest for pure functions and adapters
- **Hooks**: Custom hook testing with renderHook

### 2. Integration Tests
- **API routes**: Test proxy functionality and error handling
- **User flows**: Test complete widget creation and management
- **Data flow**: Test state management and persistence

### 3. E2E Tests
- **Playwright**: Full user journey testing
- **Visual regression**: Screenshot comparison for UI consistency
- **Performance**: Lighthouse CI for performance monitoring



## Future Enhancements

### 1. User Management
- **Authentication**: NextAuth.js for multiple providers
- **User dashboards**: Personal and shared configurations
- **Permissions**: Role-based access control

### 2. Advanced Features
- **Real-time updates**: WebSocket integration for live data
- **Alerts**: Threshold-based notifications
- **Export formats**: PDF, PNG, CSV export options

### 3. Data Sources
- **More providers**: Polygon, IEX Cloud, Yahoo Finance
- **Custom APIs**: User-defined data sources
- **Database connections**: Direct SQL query widgets
