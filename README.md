# Viala - Make Every Medicine Matter

Viala is an intelligent medicine lifecycle management platform built to prevent pharmaceutical waste, recover inventory value, and optimize supply chains in real time. Designed for retail pharmacy chains, hospital networks, and healthcare providers, Viala ensures no medicine expires without first reaching its highest-value outcome.

---

## 🚀 Key Features

- **Mission Control Dashboard**: Centralized executive analytics summarizing value recovery, waste prevention rates, and network-wide metrics.
- **Visual Shelf Heatmap**: Color-coded physical shelf layout tracking inventory FEFO (First Expiry First Out) status.
- **Intelligent Decision Engine**: Evaluates at-risk stock in real time to recommend one of six high-value outcomes:
  1. **Sell**: Surface stock to high-demand locations before expiration.
  2. **Return to Vendor**: Match items with active return policy windows.
  3. **Transfer**: Rebalance inventory to branches with stock shortages.
  4. **Redistribute**: Optimize slow-moving SKUs.
  5. **Donate**: Match expiring stock with verified NGO networks and auto-generate compliance certificates.
  6. **Safe Disposal**: Document full audit trails for zero regulatory risk.
- **Smart Scanner & OCR**: Automatically ingest batch details, manufacturing dates, and shelf locations via camera scanning (Tesseract.js integration).
- **AI Chatbot**: Intelligent chatbot powered by Gemini API to assist pharmacists in query classifications and recovery actions.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router, Server Actions)
- **Library**: React 19
- **Styling**: Tailwind CSS 4 (Modern typography, curated Stripe-inspired color palette)
- **UI Components**: Radix UI primitives & custom micro-animations (Framer Motion)
- **Data Visualization**: Recharts (Sustainability scores, environmental & financial impact trends)
- **AI Integration**: Gemini Pro (`@google/generative-ai`)
- **OCR System**: Tesseract.js
- **State Management**: React Context, custom client-side hooks

---

## 💾 Architecture & Database Layer

Viala features a database-agnostic repository structure. Database operations are handled via a local/in-memory database engine (`src/lib/db.ts`) simulating standard Postgres patterns (complete with chainable query builders, advanced filters like `.or()`, `.in()`, and `.not()`, and mock websocket realtime subscriptions). 

This allows Viala to work immediately out-of-the-box with **zero database configuration overhead** in development mode, while remaining fully prepared for production database bindings (e.g. Prisma, Knex, PostgreSQL) via custom adapters.

---

## ⚙️ Getting Started

### 1. Prerequisites
- Node.js 18+
- npm, yarn, or pnpm

### 2. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 3. Environment Variables
Configure your keys in `.env.local` at the root of the project:
```bash
# Force local demo mode (true = use mock database state, false = production backend)
NEXT_PUBLIC_FORCE_DEMO_MODE=true

# Gemini API Key for the AI Chatbot
GEMINI_API_KEY=your_gemini_api_key_here

# Production Security Configuration
JWT_SECRET=your_strong_jwt_secret_key_here
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to view the application.

---

## 🧪 System Verification

Viala includes a comprehensive end-to-end verification suite checking frontend pages, secure API endpoints, configuration parameters, and database bindings.

To execute the system tests, ensure the local development server is running (`npm run dev`), then run:
```bash
npm test
```

### Main test configurations:
- `test-system.js`: Automated page and endpoint verify checker.
- `simple-test.js`: Raw Node API request checking utility.
