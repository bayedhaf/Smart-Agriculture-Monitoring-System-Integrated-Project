# 🌾 Smart Agriculture Frontend (Next.js)

Next.js 14 App Router-based progressive web application for real-time crop monitoring and AI disease diagnosis.

**Lead:** Bayisa

---

## Table of Contents

- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Key Features](#key-features)
- [Development Guide](#development-guide)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Firebase Setup](#firebase-setup)
- [Testing](#testing)
- [Deployment](#deployment)

---

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm/npm installed
- Firebase credentials (project ID, API keys, etc.)
- `.env.local` file populated

### Installation

```bash
# From root of monorepo
cd apps/web

# Install dependencies
pnpm install

# Create .env.local file
cp .env.example .env.local

# Fill in your Firebase config and API URL
# NEXT_PUBLIC_FIREBASE_API_KEY=xxx
# NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
# NEXT_PUBLIC_API_URL=http://localhost:5000

# Run development server
pnpm dev
```

Visit `http://localhost:3000` in your browser.

---

## Project Structure

```
apps/web/
├── public/
│   ├── icons/                       ← PWA icons (192px, 512px)
│   ├── images/                      ← Static assets (logos, illustrations)
│   └── manifest.json               ← PWA manifest
│
├── src/
│   ├── app/
│   │   ├── layout.tsx       ← Root layout (fonts, themproviders)
│   │   ├── page.tsx                 ← Home/landing page
│   │   ├── not-found.tsx
│   │   ├── error.tsx
│   │   │
│   │   ├── (auth)/                  ← Auth routes (no layout)
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   │
│   │   ├── dashboard/             ← Protected routes with sidebar
│   │   │   ├── layout.tsx           ← Sidebar + nav shell
│   │   │   ├              ← Farm Dashboard (main)
│   │   │   │   └── page.tsx
│   │   │   ├── diagnose/            ← Disease diagnosis section
│   │   │   │   ├── page.tsx         ← Take photo / upload
│   │   │   │   └── [id]/            ← Single result detail
│   │   │   │       └── page.tsx
│   │   │   ├── history/             ← Diagnosis history
│   │   │   │   └── page.tsx
│   │   │   └── settings/            ← User & device settings
│   │   │       └── page.tsx
│   │   │
│   │   └── api/
│   │       └── health/route.ts       ← Health check endpoint
│   │
│   ├── components/
│   │   ├── ui/                      ← Primitive components (Button, Card, etc.)
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Input.tsx
│   │   │   └── ...
│   │   │
│   │   ├── forms/                   ← Form components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── ImageUploadForm.tsx
│   │   │   └── DeviceRegistrationForm.tsx
│   │   │
│   │   ├── dashboard/               ← Farm Dashboard components
│   │   │   ├── SensorCard.tsx       ← Soil moisture, temp, humidity display
│   │   │   ├── SensorChart.tsx      ← Recharts line chart (historical)
│   │   │   ├── WeatherCard.tsx      ← Current weather + forecast
│   │   │   ├── RecommendationBanner.tsx ← Action recommendation
│   │   │   └── DeviceSelector.tsx   ← Multi-device dropdown
│   │   │
│   │   ├── diagnose/                ← Disease diagnosis components
│   │   │   ├── CameraCapture.tsx    ← Camera input via getUserMedia
│   │   │   ├── ImagePreview.tsx     ← Preview before upload
│   │   │   ├── DiagnosisResult.tsx  ← AI result display
│   │   │   ├── DiagnosisCard.tsx    ← Compact history item
│   │   │   └── UploadSection.tsx    ← File upload fallback
│   │   │
│   │   └── layout/                  ← Layout components
│   │       ├── Sidebar.tsx          ← Desktop navigation
│   │       ├── Topbar.tsx
            |-DashboardLayout.tsx  ← Header + user menu
│   │       ├── BottomNav.tsx        ← Mobile bottom navigation
│   │       └── AuthGuard.tsx        ← Protected route wrapper
│   │
│   ├── hooks/
│   │   ├── useAuth.ts               ← Auth state (login, logout, user)
│   │   ├── useAuthGuard.ts          ← Check if user logged in
│   │   ├── useSensorData.ts         ← Firebase Realtime DB subscription
│   │   ├── useDiagnose.ts           ← Diagnosis API calls
│   │   ├── useWeather.ts            ← Weather API integration
│   │   ├── useRecommendation.ts     ← Recommendation fetching
│   │   ├── useToast.ts              ← Toast notifications
│   │   └── useMobile.ts             ← Responsive design detection
│   │
│   ├── lib/
│   │   ├── api.ts                   ← Axios instance with interceptors
│   │   ├── firebase.ts              ← Firebase client initialization
│   │   ├── utils.ts                 ← Utility functions
│   │   └── validation.ts            ← Input validation functions
│   │
│   ├── store/
│   │   ├── authStore.ts             ← Zustand auth state (user, token)
│   │   ├── sensorStore.ts           ← Zustand sensor state (readings, devices)
│   │   └── uiStore.ts               ← Zustand UI state (theme, sidebar open)
│   │
│   ├── types/
│   │   ├── api.types.ts             ← API response/request types
│   │   ├── sensor.types.ts          ← Sensor data types
│   │   ├── diagnosis.types.ts       ← Diagnosis result types
│   │   ├── user.types.ts            ← User & auth types
│   │   └── weather.types.ts         ← Weather API types
│   │
│   └── styles/
│       ├── globals.css              ← Global styles + CSS variables
│       └── tokens.css               ← Design tokens (colors, spacing)
│
├── __tests__/
│   ├── components/
│   │   └── *.test.tsx
│   ├── pages/
│   │   └── *.test.tsx
│   └── hooks/
│       └── *.test.ts
│
├── .env.example
├── .env.local                       ← Your local config (gitignored)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── jest.config.ts
└── package.json
```

---

## Technology Stack

| Layer             | Tech                         | Purpose                         |
| ----------------- | ---------------------------- | ------------------------------- |
| **Runtime**       | Next.js 14                   | App Router, SSR/SSG/ISR         |
| **UI Framework**  | React 18+                    | Component library               |
| **Styling**       | Tailwind CSS                 | Utility-first CSS               |
| **Components**    | shadcn/ui                    | Pre-built accessible components |
| **State**         | Zustand                      | Lightweight state management    |
| **HTTP Client**   | Axios                        | API requests with interceptors  |
| **Real-time DB**  | Firebase SDK                 | Sensor data subscriptions       |
| **Forms**         | React Hook Form              | Form state + validation         |
| **Charts**        | Recharts                     | Sensor trend visualization      |
| **Notifications** | Sonner                       | Toast notifications             |
| **Testing**       | Jest + React Testing Library | Unit & component tests          |
| **Build**         | Turbopack                    | Next.js bundler                 |

---

## Key Features

### 🔐 Authentication

- Email/password registration and login via Firebase
- JWT token stored securely in httpOnly cookies
- Logout with token refresh
- Session persistence across page reloads

### 📊 Farm Dashboard

- Real-time sensor card display (soil moisture, temperature, humidity)
- Historical sensor trend chart (Recharts)
- Current weather card with 5-day forecast
- Smart actionable recommendations banner
- Multi-device selector dropdown

### 🩺 Disease Diagnosis

- Camera capture (getUserMedia) or file upload
- AI-powered analysis via Claude Vision API
- Diagnosis confidence score & severity level
- Actionable remedies and prevention tips
- Full diagnosis history with filtering

### 🌍 Weather Integration

- Current weather conditions
- 5-day forecast
- Location-based recommendations
- Integration with irrigation logic

### 📱 PWA Ready

- Offline support via Service Worker
- Installable to home screen
- Responsive design (mobile-first)
- Bottom navigation on mobile, sidebar on desktop

---

### Vercel (Recommended)

```bash
# Connect repo to Vercel from dashboard
# Set environment variables in Vercel project settings:
# - NEXT_PUBLIC_FIREBASE_API_KEY
# - NEXT_PUBLIC_FIREBASE_PROJECT_ID
# - NEXT_PUBLIC_API_URL (production API URL)

# Deploy automatically on push to main
git push origin main
```

### Self-Hosted

```bash
# Build
pnpm build

# Start production server
pnpm start
```

### Environment Variables (Production)

```
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://xxx.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx.appspot.com
NEXT_PUBLIC_API_URL=https://api.agritech-astu.com
```

---

## Styling & Design Tokens

### Tailwind Best Practices

- Use semantic tokens: `text-foreground`, `bg-background`
- Prefer standard spacing scale: `px-4`, `py-2` (not `px-[16px]`)
- Responsive prefixes: `md:text-lg`, `lg:grid-cols-3`
- Avoid arbitrary values unless absolutely necessary

---

## Performance Tips

1. **Image Optimization**
   - Use Next.js `Image` component for automatic optimization
   - Lazy load images below the fold
   - Use WebP format where supported

2. **Code Splitting**
   - Dynamically import heavy components: `const Component = dynamic(() => import(...))`
   - Next.js automatic code splitting for routes

3. **Data Fetching**
   - Use SWR for client-side data fetching with caching
   - Cache Firebase queries where possible
   - Implement pagination for large lists

4. **Bundle Size**
   - Monitor with `npm run analyze` (requires analysis tool)
   - Lazy load non-critical dependencies

---

## Troubleshooting

| Issue                         | Solution                                                       |
| ----------------------------- | -------------------------------------------------------------- |
| **API calls failing**         | Check `NEXT_PUBLIC_API_URL` env var, ensure backend is running |
| **Firebase connection error** | Verify Firebase config in `.env.local`, check project exists   |
| **Styles not applying**       | Clear `.next` folder: `rm -rf .next && pnpm dev`               |
| **Module not found**          | Run `pnpm install`, clear `node_modules` if persistent         |
| **Hot reload not working**    | Check port 3000 is available, restart dev server               |

---

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Firebase Web SDK](https://firebase.google.com/docs/web)
- [Zustand](https://github.com/pmndrs/zustand)

---

**Lead:** Bekam Birhanu (@bekam)  
**Questions?** Open an issue or ping on WhatsApp.
