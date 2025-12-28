# 🏗️ FinBoard Architecture Documentation

## Table of Contents
1. [System Architecture Overview](#system-architecture-overview)
2. [Data Flow Diagrams](#data-flow-diagrams)
3. [Component Architecture](#component-architecture)
4. [State Management](#state-management)
5. [API Integration](#api-integration)
6. [Security Architecture](#security-architecture)

---

## System Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser (Client)                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Widget     │  │   Widget     │  │  AI Chat     │      │
│  │   Cards      │  │   Charts     │  │  Interface   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│           │                 │                 │              │
│           └─────────────────┴─────────────────┘              │
│                         │                                    │
│                   React Components                           │
│                   (Client & Server)                          │
│                         │                                    │
└─────────────────────────┼────────────────────────────────────┘
                          │
                          │ HTTP/HTTPS
                          │
┌─────────────────────────▼────────────────────────────────────┐
│                   Next.js 14 Server                          │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              API Routes (Server-Side)                 │   │
│  │  ┌────────────────┐      ┌────────────────┐         │   │
│  │  │  /api/proxy    │      │   /api/chat    │         │   │
│  │  │  (Data APIs)   │      │   (Gemini AI)  │         │   │
│  │  └───────┬────────┘      └───────┬────────┘         │   │
│  └──────────┼───────────────────────┼──────────────────┘   │
│             │                       │                        │
└─────────────┼───────────────────────┼────────────────────────┘
              │                       │
              │                       │
    ┌─────────▼────────┐    ┌────────▼─────────┐
    │   External APIs  │    │   Google AI      │
    ├──────────────────┤    │   Gemini API     │
    │  • Finnhub       │    └──────────────────┘
    │  • AlphaVantage  │
    └──────────────────┘
```

---

## Data Flow Diagrams

### 1. Widget Data Flow

```
┌────────────┐
│   User     │ Clicks "Add Widget"
└─────┬──────┘
      │
      ▼
┌────────────────────┐
│  AddWidgetDialog   │ Configure widget (symbol, provider, refresh)
└─────┬──────────────┘
      │
      ▼
┌────────────────────┐
│  Zustand Store     │ Save widget config → localStorage
└─────┬──────────────┘
      │
      ▼
┌────────────────────┐
│  WidgetGrid        │ Render new widget
└─────┬──────────────┘
      │
      ▼
┌────────────────────┐
│  Widget Component  │ Mount & start fetching data
│  (Card/Chart)      │
└─────┬──────────────┘
      │
      ▼
┌────────────────────┐
│  useSWR Hook       │ Fetch data with auto-refresh
└─────┬──────────────┘
      │
      ▼
┌────────────────────┐
│  /api/proxy        │ Server-side API call
└─────┬──────────────┘
      │
      ▼
┌────────────────────┐
│  External API      │ Finnhub/AlphaVantage
│  (Finnhub/AV)      │
└─────┬──────────────┘
      │
      ▼
┌────────────────────┐
│  Adapter Functions │ Normalize data format
│  (services/)       │
└─────┬──────────────┘
      │
      ▼
┌────────────────────┐
│  Widget Display    │ Show chart/card with data
└────────────────────┘
```

### 2. AI Chat Flow

```
┌────────────┐
│   User     │ Clicks chat button
└─────┬──────┘
      │
      ▼
┌────────────────────┐
│  AI Assistant      │ Opens chat panel
│  Component         │
└─────┬──────────────┘
      │
      ▼
┌────────────────────┐
│   User types       │ "What's the outlook for AAPL?"
│   question         │
└─────┬──────────────┘
      │
      ▼
┌────────────────────┐
│  Frontend collects │ messages + dashboard context (widgets)
│  context           │
└─────┬──────────────┘
      │
      ▼
┌────────────────────┐
│  POST /api/chat    │ Send to backend
└─────┬──────────────┘
      │
      ▼
┌────────────────────┐
│  Build AI prompt   │ Include system context + user widgets
└─────┬──────────────┘
      │
      ▼
┌────────────────────┐
│  Call Gemini API   │ Google Generative AI
│  (Server-side)     │
└─────┬──────────────┘
      │
      ▼
┌────────────────────┐
│  Parse response    │ Extract AI reply
└─────┬──────────────┘
      │
      ▼
┌────────────────────┐
│  Return to client  │ JSON response
└─────┬──────────────┘
      │
      ▼
┌────────────────────┐
│  Display in chat   │ Show AI message in conversation
└────────────────────┘
```

---

## Component Architecture

### Component Hierarchy

```
App
├── Layout (Root)
│   ├── ThemeProvider
│   ├── Header
│   └── AIAssistant (Floating)
│
├── Home Page (Dashboard)
│   ├── AddWidgetDialog
│   └── WidgetGrid
│       ├── WidgetShell (Wrapper)
│       │   ├── CardWidget
│       │   │   └── Card UI
│       │   ├── LineChartWidget
│       │   │   └── Chart.js Canvas
│       │   └── TableWidget
│       │       └── Table UI
│       └── DndContext (Drag & Drop)
│
└── Widget Detail Page /widgets/[id]
    ├── WidgetDetail Component
    │   ├── Chart Display
    │   ├── Stats Display
    │   └── Tabs (Chart/Data/JSON)
    └── Refresh Controls
```

### Component Responsibilities

#### 1. **WidgetGrid** (`src/components/widgets/widget-grid.tsx`)
```typescript
Responsibilities:
- Layout management (responsive grid)
- Drag-and-drop functionality
- Widget rendering loop
- Empty state handling

Key Features:
- CSS Grid for responsive layout
- dnd-kit for drag interactions
- Connects to Zustand store
```

#### 2. **WidgetShell** (`src/components/widgets/widget-shell.tsx`)
```typescript
Responsibilities:
- Widget chrome (border, actions)
- Remove button
- Link to detail page
- Provider badge display

Key Features:
- Consistent wrapper for all widget types
- Action menu integration
- Loading/error states
```

#### 3. **CardWidget** (`src/components/widgets/card-widget.tsx`)
```typescript
Responsibilities:
- Display current stock price
- Show price change ($ and %)
- Color coding (red/green)
- Refresh indicator

Key Features:
- Real-time data updates
- Responsive text sizing
- SWR for data fetching
```

#### 4. **AIAssistant** (`src/components/ai-assistant.tsx`)
```typescript
Responsibilities:
- Chat UI (messages, input)
- Context management (conversation history)
- Dashboard context sharing
- Error handling

Key Features:
- Floating button (always accessible)
- Message history
- Typing indicators
- Quick question suggestions
```

---

## State Management

### Zustand Store Architecture

```typescript
// src/store/dashboard-store.ts

interface DashboardStore {
  // State
  widgets: Widget[]
  
  // Actions
  addWidget: (widget: Widget) => void
  removeWidget: (id: string) => void
  updateWidget: (id: string, updates: Partial<Widget>) => void
  reorderWidgets: (from: number, to: number) => void
  getWidget: (id: string) => Widget | undefined
}

// Features:
// - Immutable updates
// - localStorage persistence
// - Type-safe
// - Simple API
```

### State Flow

```
┌─────────────────────────────────────────────────────┐
│                   User Action                       │
│  (Add/Remove/Update Widget)                         │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│              Zustand Action                         │
│  (addWidget, removeWidget, etc.)                    │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│          Update Store State                         │
│  (Immutable state update)                           │
└───────────────────┬─────────────────────────────────┘
                    │
                    ├─────────────┬──────────────────┐
                    │             │                  │
                    ▼             ▼                  ▼
         ┌──────────────┐  ┌──────────┐  ┌──────────────┐
         │ React        │  │localStorage│  │ Subscribers  │
         │ Re-render    │  │ Persist   │  │ (Components) │
         └──────────────┘  └──────────┘  └──────────────┘
```

---

## API Integration

### Proxy Pattern Implementation

```typescript
// Client-Side Request
async function fetchStockData(symbol: string) {
  const response = await fetch('/api/proxy', {
    method: 'POST',
    body: JSON.stringify({
      provider: 'finnhub',
      endpoint: '/quote',
      params: { symbol }
    })
  })
  return response.json()
}

// Server-Side Handler (src/app/api/proxy/route.ts)
export async function POST(req: NextRequest) {
  const { provider, endpoint, params } = await req.json()
  
  // Get API key from environment (SECURE!)
  const apiKey = process.env.FINNHUB_API_KEY
  
  // Check cache first
  const cached = cache.get(cacheKey)
  if (cached && cached.expires > Date.now()) {
    return NextResponse.json(cached.data)
  }
  
  // Make external API call
  const url = `https://finnhub.io${endpoint}?token=${apiKey}&symbol=${params.symbol}`
  const response = await fetch(url)
  const data = await response.json()
  
  // Cache result
  cache.set(cacheKey, { data, expires: Date.now() + 30000 })
  
  return NextResponse.json(data)
}
```

### Benefits of This Pattern

1. **Security**: API keys never exposed to client
2. **Caching**: Reduce external API calls, faster responses
3. **Rate Limiting**: Control request frequency
4. **Error Handling**: Centralized error management
5. **CORS**: No cross-origin issues

### Adapter Pattern for Data Normalization

```typescript
// Problem: Different APIs, different formats

// Finnhub Format:
{ c: 273.40, h: 275.37, l: 272.86, o: 274.16, t: 1703635200 }

// AlphaVantage Format:
{
  "Global Quote": {
    "05. price": "273.4000",
    "02. open": "274.1600",
    "03. high": "275.3700",
    "04. low": "272.8600"
  }
}

// Solution: Adapter functions normalize to common format

export type Candle = {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

// All widgets work with Candle[] regardless of source
```

---

## Security Architecture

### 1. Environment Variables

```bash
# .env.local (NOT in git)
FINNHUB_API_KEY=secret_key_1
ALPHA_VANTAGE_API_KEY=secret_key_2
GEMINI_API_KEY=secret_key_3

# .gitignore ensures this is never committed
.env*.local
```

### 2. Server-Side Only API Calls

```typescript
// ✅ GOOD - Server-side (Secure)
export async function POST(req: NextRequest) {
  const apiKey = process.env.FINNHUB_API_KEY // Server only
  // ...
}

// ❌ BAD - Client-side (Exposed)
const apiKey = "my_secret_key" // Visible in browser!
fetch(`https://api.com/data?key=${apiKey}`)
```

### 3. Input Validation

```typescript
// Validate user inputs
const { provider, endpoint, params } = await req.json()

if (!provider || !endpoint) {
  return NextResponse.json({ error: "Invalid request" }, { status: 400 })
}

// Whitelist allowed providers
if (!['finnhub', 'alphaVantage'].includes(provider)) {
  return NextResponse.json({ error: "Invalid provider" }, { status: 400 })
}
```

### 4. Rate Limiting & Caching

```typescript
// In-memory cache
const cache = new Map<string, CacheEntry>()
const TTL = 30_000 // 30 seconds

// Rate limit tracking
let rateLimitUntil = 0

export async function POST(req: NextRequest) {
  // Check rate limit
  if (Date.now() < rateLimitUntil) {
    return NextResponse.json(
      { error: "Rate limit exceeded" }, 
      { status: 429 }
    )
  }
  
  // Check cache
  const cached = cache.get(cacheKey)
  if (cached && cached.expires > Date.now()) {
    return NextResponse.json(cached.data)
  }
  
  // ... make API call
}
```

---

## Performance Optimizations

### 1. Server Components (Next.js 14)
```typescript
// Default: Server Component (fast, no JS)
export default async function DashboardPage() {
  // Rendered on server
  return <div>Dashboard</div>
}

// Only when needed: Client Component
'use client'
export function InteractiveWidget() {
  const [state, setState] = useState()
  // ...
}
```

### 2. Data Fetching Strategy
```typescript
// SWR for client-side data fetching
import useSWR from 'swr'

function Widget() {
  const { data, error, isLoading } = useSWR(
    ['/api/proxy', config],
    fetcher,
    {
      refreshInterval: 60000,    // Auto-refresh
      revalidateOnFocus: false,  // Don't refetch on focus
      dedupingInterval: 5000,    // Dedupe requests
    }
  )
}
```

### 3. Code Splitting
```typescript
// Dynamic imports for heavy components
import dynamic from 'next/dynamic'

const HeavyChart = dynamic(
  () => import('./heavy-chart'),
  { 
    loading: () => <Skeleton />,
    ssr: false  // Client-side only
  }
)
```

---

## Development Workflow

### Local Development
```bash
# 1. Start dev server
npm run dev

# 2. Make changes (auto-reload)

# 3. Test
npm test

# 4. Build for production
npm run build

# 5. Test production build
npm start
```

### Git Workflow
```bash
# 1. Create feature branch
git checkout -b feature/new-widget-type

# 2. Make changes and commit
git add .
git commit -m "Add new widget type"

# 3. Push to GitHub
git push origin feature/new-widget-type

# 4. Create Pull Request
```

---

## Deployment Architecture

### Vercel Deployment Flow

```
┌─────────────┐
│  Git Push   │ Push to main branch
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  GitHub         │ Webhook triggers Vercel
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Vercel Build   │ npm run build
│  - Next.js      │
│  - TypeScript   │
│  - Tailwind     │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Deploy to CDN  │ Global edge network
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Live on        │ https://finboard.vercel.app
│  Production     │
└─────────────────┘
```

---

## Testing Strategy

### Unit Tests (Vitest)
```typescript
// src/store/dashboard-store.test.ts
describe('DashboardStore', () => {
  it('adds widget correctly', () => {
    const store = useDashboardStore.getState()
    store.addWidget({ id: '1', type: 'card', ... })
    expect(store.widgets).toHaveLength(1)
  })
})
```

### Integration Tests
```typescript
// Test full user flows
test('user can add and remove widget', async () => {
  render(<Dashboard />)
  
  // Click add widget
  await userEvent.click(screen.getByText('Add Widget'))
  
  // Fill form
  await userEvent.type(screen.getByLabel('Symbol'), 'AAPL')
  await userEvent.click(screen.getByText('Add'))
  
  // Widget appears
  expect(screen.getByText('AAPL')).toBeInTheDocument()
})
```

---

## Common Patterns & Conventions

### File Naming
```
components/     PascalCase: Widget.tsx
utils/          camelCase: formatDate.ts
hooks/          camelCase: useWidget.ts
types/          camelCase: widget.ts
```

### Component Structure
```typescript
// 1. Imports
import { useState } from 'react'
import { Button } from '@/components/ui/button'

// 2. Types
type Props = { ... }

// 3. Component
export function MyComponent({ prop }: Props) {
  // 4. Hooks
  const [state, setState] = useState()
  
  // 5. Event handlers
  const handleClick = () => { }
  
  // 6. Effects
  useEffect(() => { }, [])
  
  // 7. Render
  return <div>...</div>
}
```

### Error Handling Pattern
```typescript
try {
  const data = await fetchData()
  return { success: true, data }
} catch (error) {
  console.error('Fetch failed:', error)
  return { 
    success: false, 
    error: error instanceof Error ? error.message : 'Unknown error'
  }
}
```

---

## Troubleshooting Guide

### Common Issues

1. **API Keys Not Working**
   - Check `.env.local` file exists
   - Verify keys are correct
   - Restart dev server after adding keys

2. **Widgets Not Loading**
   - Check browser console for errors
   - Verify API proxy is running
   - Check network tab for failed requests

3. **AI Chat Not Responding**
   - Verify GEMINI_API_KEY in .env.local
   - Check Gemini API quota (free tier limits)
   - Review server logs for errors

4. **Build Failures**
   - Run `npm install` to update dependencies
   - Clear `.next` folder: `rm -rf .next`
   - Check TypeScript errors: `npm run type-check`

---

## Resources & References

- **Next.js Docs**: https://nextjs.org/docs
- **React Docs**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Zustand**: https://github.com/pmndrs/zustand
- **Chart.js**: https://www.chartjs.org/docs
- **shadcn/ui**: https://ui.shadcn.com

---

**This architecture is designed for:**
- ✅ Scalability (easy to add new features)
- ✅ Maintainability (clear code organization)
- ✅ Performance (optimized for speed)
- ✅ Security (API keys protected)
- ✅ Developer Experience (TypeScript, testing, hot reload)
