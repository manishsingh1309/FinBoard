# 📊 FinBoard - Real-Time Financial Dashboard

> A modern, full-stack financial dashboard application built with Next.js 14, featuring real-time stock data visualization and an AI-powered financial assistant.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38bdf8)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI-4285f4)](https://ai.google.dev/)

**Live Demo**: [FinBoard](https://fin-board-red.vercel.app/)  
**GitHub**: [manishsingh1309/FinBoard](https://github.com/manishsingh1309/FinBoard)

---

## 🎯 Project Overview

FinBoard is a customizable financial dashboard that enables users to monitor real-time stock market data through an intuitive widget-based interface. The application integrates multiple financial data providers (Finnhub, AlphaVantage) and includes an AI assistant powered by Google Gemini for market insights and investment advice.

### ✨ Key Highlights

- 🤖 **AI Financial Assistant** - Chat with an AI powered by Google Gemini 2.5 Flash
- 📈 **Real-Time Market Data** - Live stock quotes and historical charts
- 🎨 **Customizable Widgets** - Drag-and-drop dashboard with persistent layouts
- 🔒 **Secure API Handling** - Server-side proxy pattern for API key protection
- 🌙 **Modern UI/UX** - Dark mode, glassmorphism design, responsive layouts
- 📊 **Multiple Visualizations** - Quote cards, line charts, and data tables

---

## 🏗️ Architecture & Design

### Technology Stack

```
Frontend:
├── Next.js 14 (App Router)
├── React 18 (Server & Client Components)
├── TypeScript (Type Safety)
├── Tailwind CSS (Styling)
└── shadcn/ui (Component Library)

State Management:
├── Zustand (Dashboard State)
└── localStorage (Persistence)

Data Visualization:
├── Chart.js (Charts)
└── React Chart.js 2 (React Integration)

Backend:
├── Next.js API Routes
├── Server-Side Rendering (SSR)
└── Server Components

AI Integration:
└── Google Gemini 2.5 Flash API

APIs:
├── Finnhub (US Stocks)
├── AlphaVantage (Global Markets)
└── Gemini AI (Financial Assistant)
```

### Project Structure

```
FinBoard/
├── src/
│   ├── app/                        # Next.js 14 App Router
│   │   ├── api/                    # API Routes (Backend)
│   │   │   ├── proxy/              # Secure API proxy
│   │   │   │   └── route.ts        # Handles external API calls
│   │   │   └── chat/               # AI Assistant endpoint
│   │   │       └── route.ts        # Gemini AI integration
│   │   ├── widgets/[id]/           # Dynamic widget pages
│   │   ├── layout.tsx              # Root layout with providers
│   │   └── page.tsx                # Dashboard home page
│   │
│   ├── components/                 # React Components
│   │   ├── ui/                     # Reusable UI components (50+)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   ├── widgets/                # Widget components
│   │   │   ├── widget-grid.tsx    # Drag-and-drop grid
│   │   │   ├── card-widget.tsx    # Quote card display
│   │   │   ├── line-chart-widget.tsx
│   │   │   └── widget-shell.tsx   # Widget wrapper
│   │   ├── ai-assistant.tsx       # AI chat interface
│   │   └── add-widget-dialog.tsx  # Widget creation modal
│   │
│   ├── store/                      # State Management
│   │   ├── dashboard-store.ts     # Zustand store
│   │   └── dashboard-store.test.ts
│   │
│   ├── services/                   # Business Logic
│   │   └── adapters.ts            # Data normalization
│   │
│   ├── lib/                        # Utilities
│   │   └── adapters.ts            # API adapter configs
│   │
│   └── types/                      # TypeScript types
│       └── widgets.ts
│
├── public/                         # Static assets
├── .env.local                      # Environment variables (not in git)
└── package.json                    # Dependencies
```

---

## 🎨 Design Patterns & Architecture

### 1. **Proxy Pattern** (API Security)
```typescript
// Client → Next.js API Route → External API
// Benefits: API keys hidden, rate limiting, caching

// Example: src/app/api/proxy/route.ts
export async function POST(req: NextRequest) {
  const { provider, endpoint, params } = await req.json()
  
  // Server-side API call with hidden keys
  const apiKey = process.env.FINNHUB_API_KEY
  const response = await fetch(`https://finnhub.io${endpoint}?token=${apiKey}`)
  
  return NextResponse.json(data)
}
```

**Why?** Keeps API keys secure on the server, prevents client-side exposure, enables caching and rate limiting.

### 2. **Adapter Pattern** (Data Normalization)
```typescript
// Different API formats → Unified Candle format
// src/services/adapters.ts

export function adaptFinnhubQuote(json: any): Candle[] {
  return [{ time, open, high, low, close }]
}

export function adaptAlphaVantageGlobalQuote(json: any): Candle[] {
  const quote = json["Global Quote"]
  return [{ time, open, high, low, close }]
}
```

**Why?** Handles multiple API formats seamlessly, makes the UI layer provider-agnostic, easy to add new data sources.

### 3. **Component Composition** (Widget System)
```typescript
// Flexible, reusable widget architecture

<WidgetShell>
  <CardWidget />    // or <ChartWidget /> or <TableWidget />
</WidgetShell>
```

**Why?** Modular design, easy to add new widget types, consistent behavior across widgets.

### 4. **Server-Side Rendering (SSR)**
```typescript
// Next.js 14 App Router with React Server Components

// Faster initial load, better SEO, reduced client bundle
export default async function DashboardPage() {
  // Rendered on server
  return <WidgetGrid />
}
```

**Why?** Better performance, improved SEO, reduced JavaScript bundle size.

---

## 🚀 Key Features Explained

### 1. Real-Time Stock Dashboard

**What**: Users can add multiple widgets to track different stocks
**How**: 
- Widgets fetch data from Finnhub/AlphaVantage APIs
- Data updates every 60 seconds (configurable)
- State persisted to localStorage using Zustand

**Code Flow**:
```
User adds widget → Store saves config → Widget fetches data 
→ API proxy forwards request → Data normalized → Chart displays
```

### 2. AI Financial Assistant

**What**: Conversational AI that provides market insights and financial advice
**How**:
- Floating chat button accessible from anywhere
- Powered by Google Gemini 2.5 Flash (latest model)
- Context-aware: knows user's dashboard widgets
- Maintains conversation history

**Code Flow**:
```
User asks question → Frontend sends to /api/chat 
→ Server calls Gemini API → AI response returned 
→ Displayed in chat interface
```

**Key File**: `src/components/ai-assistant.tsx`

### 3. Widget Management

**What**: Drag-and-drop, add, remove, and configure widgets
**How**:
- Built with `dnd-kit` for smooth drag interactions
- State managed by Zustand with localStorage persistence
- Unique IDs for each widget instance

**Features**:
- Add new widgets (Quote cards, Charts)
- Remove widgets
- Auto-refresh configuration
- Provider selection (Finnhub/AlphaVantage)

### 4. Data Visualization

**What**: Multiple ways to view stock data
**Types**:
- **Quote Cards**: Current price + % change with color coding
- **Line Charts**: Historical price trends (Chart.js)
- **Data Tables**: Detailed OHLC data

**Responsive**: Adapts to mobile, tablet, and desktop screens

---

## 💻 Code Quality & Best Practices

### Type Safety
```typescript
// Full TypeScript coverage
export type Widget = {
  id: string
  type: WidgetType
  provider: ProviderId
  endpoint: string
  params: Record<string, any>
}
```

### Error Handling
```typescript
// Graceful error handling at every level
try {
  const data = await fetch('/api/proxy')
} catch (error) {
  // User-friendly error messages
  setError('Unable to load data. Please try again.')
}
```

### Performance Optimization
- SWR for efficient data fetching
- React Server Components for reduced bundle size
- Lazy loading for charts
- Optimized re-renders with React.memo

### Testing
```bash
npm test  # Vitest for unit tests
```

---

## 🔒 Security Features

1. **API Key Protection**
   - All keys stored in `.env.local` (not in git)
   - Server-side API calls only
   - No client-side key exposure

2. **Input Validation**
   - TypeScript for compile-time checks
   - Runtime validation for API requests

3. **CORS & Rate Limiting**
   - Server-side caching (30s TTL)
   - Rate limit handling for external APIs

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- API keys (see below)

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/manishsingh1309/FinBoard.git
cd FinBoard

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local

# Add your API keys to .env.local:
# FINNHUB_API_KEY=your_finnhub_key
# ALPHA_VANTAGE_API_KEY=your_alphavantage_key
# GEMINI_API_KEY=your_gemini_key

# 4. Run development server
npm run dev

# 5. Open browser
# Visit http://localhost:3000
```

### Get API Keys (Free)

1. **Finnhub**: https://finnhub.io/register
2. **AlphaVantage**: https://www.alphavantage.co/support/#api-key
3. **Google Gemini**: https://aistudio.google.com/app/apikey

---

## 📊 Features Demo

### Adding a Widget
1. Click "+ Add Widget" button
2. Select provider (Finnhub/AlphaVantage)
3. Choose widget type (Quote Card/Chart)
4. Enter stock symbol (e.g., AAPL)
5. Configure refresh rate
6. Click "Add to Dashboard"

### Using AI Assistant
1. Click the floating chat button (bottom-right)
2. Ask questions like:
   - "What's the outlook for AAPL?"
   - "Should I invest in tech stocks?"
   - "Explain my dashboard"
3. Get instant AI-powered insights

### Customizing Dashboard
- **Drag & Drop**: Rearrange widgets
- **Remove**: Click 'X' on widget
- **Refresh**: Data auto-updates
- **Theme**: Toggle dark/light mode

---

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm test:watch

# Build for production
npm run build

# Start production server
npm start
```

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Settings → Environment Variables
```

### Environment Variables for Production
```
FINNHUB_API_KEY=your_key
ALPHA_VANTAGE_API_KEY=your_key
GEMINI_API_KEY=your_key
```

---

## 🎯 Technical Decisions & Trade-offs

### Why Next.js 14?
- ✅ Built-in API routes (no separate backend needed)
- ✅ Server components reduce bundle size
- ✅ Excellent performance out of the box
- ✅ Easy deployment on Vercel

### Why Zustand over Redux?
- ✅ Simpler API (less boilerplate)
- ✅ Better TypeScript support
- ✅ Built-in persistence
- ✅ Smaller bundle size

### Why Chart.js?
- ✅ Lightweight and fast
- ✅ Good documentation
- ✅ Easy to customize
- ✅ Responsive by default

### Why Server-Side Proxy?
- ✅ API keys never exposed to client
- ✅ Can implement caching
- ✅ Can add rate limiting
- ✅ Can handle CORS issues

---

## 🔮 Future Enhancements

- [ ] Multiple dashboard layouts
- [ ] Widget templates
- [ ] Export data to CSV/PDF
- [ ] Stock price alerts
- [ ] Portfolio tracking
- [ ] Social sharing
- [ ] Real-time WebSocket updates
- [ ] Advanced charting (candlestick, indicators)
- [ ] Multi-user support with authentication
- [ ] Custom AI training on user preferences

---

## 📝 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm test         # Run tests
npm run lint     # Run ESLint
npm run format   # Format code with Prettier
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Manish Singh**
- GitHub: [@manishsingh1309](https://github.com/manishsingh1309)
- LinkedIn: [Connect with me](https://linkedin.com/in/manishsingh1309)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React Framework
- [shadcn/ui](https://ui.shadcn.com/) - UI Components
- [Finnhub](https://finnhub.io/) - Stock Market Data
- [AlphaVantage](https://www.alphavantage.co/) - Financial Data
- [Google Gemini](https://ai.google.dev/) - AI Assistant
- [Vercel](https://vercel.com/) - Hosting Platform

---

## 📞 Support

If you have any questions or need help, please:
- Open an issue on [GitHub](https://github.com/manishsingh1309/FinBoard/issues)
- Email: manishsingh1309@example.com

---

**⭐ If you found this project helpful, please give it a star!**
