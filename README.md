# 🌱 Smart Agriculture Monitoring System

A comprehensive IoT + AI solution for real-time crop monitoring and disease diagnosis using ESP32 sensors, Next.js frontend, Node.js/Express backend, Firebase, and Claude Vision API.

**Team:** AgriTech Integrators · ASTU · Next.js + Node/Express · April 2026

---

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Team & Roles](#team--roles)
- [Git Workflow](#git-workflow)
- [Development Guide](#development-guide)
- [Deployment](#deployment)
- [Documentation](#documentation)

---

## Project Overview

Smart Agriculture Monitoring System is an end-to-end platform enabling farmers to:

✅ **Real-time Monitoring** - Track soil moisture, temperature, and humidity via ESP32 sensors  
✅ **AI-Powered Diagnosis** - Identify crop diseases from leaf photos using Google Gemini Vision API  
✅ **Weather Integration** - Get location-based weather forecasts and smart recommendations  
✅ **Historical Analysis** - Review past diagnoses and sensor trends  
✅ **Mobile-Ready** - Progressive Web App (PWA) optimized for field use

**Tech Stack:**

- Frontend: Next.js 14 (App Router) + React + Tailwind CSS
- Backend: Node.js + Express + Firebase Admin SDK
- Database: Firebase Realtime Database + Storage
- AI: Google Gemini API (Vision + Text)
- Weather: OpenWeatherMap API
- Hardware: ESP32 + DHT11 + Soil Moisture Sensor
- Deployment: Render (API) + Vercel (Frontend)

---

## Architecture

### System Overview

```
┌─────────────────────┐
│   ESP32 Sensor      │  DHT11 (Temp/Humidity)
│   (Hardware)        │  Soil Moisture Sensor
└──────────┬──────────┘
           │ HTTP POST
           ▼
┌─────────────────────┐       ┌──────────────────┐
│  Firebase Realtime  │◄──────┤   Node.js API    │
│   Database + Storage│       │   (Express)      │
└─────────────────────┘       └──────┬───────────┘
           ▲                          │
           │ WebSocket/SSE           │ Claude Vision API
           │                         │ OpenWeatherMap
           │                         │
           ▼                         ▼
┌─────────────────────┐
│  Next.js Frontend   │
│  (Farm Dashboard)   │
└─────────────────────┘
```

### Layered Monolith Architecture

**API Layer:** Routes → Controllers → Services → Repositories  
**Separation of Concerns:** Each module (Auth, AI, IoT, Weather) is self-contained and can be extracted to a microservice later  
**Stateless Design:** All state stored in Firebase; API uses JWT for authentication

---

## Quick Start

### Prerequisites

- Node.js 18+ and npm/pnpm
- Firebase account (create a project)
- Google Gemini API key
- OpenWeatherMap API key
- Git

### Installation

1. **Clone Repository**

   ```bash
   git clone https://github.com/astu-agritech/smart-agri.git
   cd smart-agri
   ```

2. **Install Dependencies**

   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set Environment Variables**

   Copy `.env.example` to `.env.local` in root, `apps/web`, and `apps/api`:

   ```bash
   cp .env.example .env.local
   cp apps/web/.env.example apps/web/.env.local
   cp apps/api/.env.example apps/api/.env
   ```

   Fill in your credentials:
   - Firebase config (project ID, API key, etc.)
   - Google Gemini API key
   - OpenWeatherMap API key
   - JWT secret

4. **Run Development Servers**

   ```bash
   # Terminal 1: API (http://localhost:5000)
   npm run dev:api

   # Terminal 2: Frontend (http://localhost:3000)
   npm run dev:web
   ```

5. **Verify Setup**
   - Frontend: Visit `http://localhost:3000`
   - API Docs: Visit `http://localhost:5000/api/docs` (Swagger UI)
   - Health Check: Visit `http://localhost:5000/api/v1/health`

---

## Project Structure

```
smart-agri/                          ← Git root
├── .github/
│   ├── workflows/                   ← CI/CD pipelines
│   │   ├── ci.yml                   ← Lint + test on PR
│   │   ├── deploy-staging.yml       ← Auto-deploy develop
│   │   └── deploy-production.yml    ← Manual production deploy
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── ISSUE_TEMPLATE/
│
├── apps/
│   ├── web/                         ← Next.js 14 Frontend
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── app/                 ← App Router pages
│   │   │   ├── components/          ← React components
│   │   │   ├── hooks/               ← Custom React hooks
│   │   │   ├── lib/                 ← Utilities (API, Firebase)
│   │   │   ├── store/               ← Zustand state
│   │   │   └── types/               ← TypeScript types
│   │   └── package.json
│   │
│   └── api/                         ← Node.js/Express Backend
│       ├── src/
│       │   ├── index.ts             ← Server entry point
│       │   ├── app.ts               ← Express setup
│       │   ├── config/              ← Firebase, Swagger, Env
│       │   ├── routes/              ← Route definitions
│       │   ├── controllers/         ← Request handlers
│       │   ├── services/            ← Business logic
│       │   ├── repositories/        ← DB access layer
│       │   ├── middleware/          ← Auth, validation, upload
│       │   ├── validators/          ← Zod schemas
│       │   ├── types/               ← TypeScript definitions
│       │   └── utils/               ← Helpers (logger, response)
│       ├── __tests__/               ← Unit + integration tests
│       └── package.json
│
├── packages/
│   └── shared/                      ← Shared types & constants
│       ├── src/
│       │   ├── types/
│       │   └── constants/
│       └── package.json
│
├── firmware/                        ← ESP32 Arduino firmware
│   └── smart_agri_node/
│       ├── smart_agri_node.ino      ← Main sketch
│       ├── config.h
│       ├── sensors.h / .cpp
│       ├── http_client.h / .cpp
│       └── eeprom_cache.h / .cpp
│
├── docs/                            ← Architecture & guides
│   ├── architecture/
│   ├── adr/                         ← Architecture Decision Records
│   ├── api/                         ← OpenAPI spec
│   └── user-manual/
│
├── scripts/                         ← Helper scripts
├── .gitignore
├── .env.example
└── package.json                     ← Root npm workspaces config
```

---

## Team & Roles

| #   | Name               | Department | Primary Role                   | GitHub Alias | Key Deliverables                              |
| --- | ------------------ | ---------- | ------------------------------ | ------------ | --------------------------------------------- |
| 1   | Bayisa Balcha Teka | SE         | Project Manager & Backend Lead | @bayisa      | Sprint planning, API gateway, Firebase config |
| 2   | Bekam Birhanu      | SE         | Frontend Lead (Next.js)        | @bekam       | App shell, routing, UI components             |
| 3   | Girma Wakeyo       | CSE        | AI/ML Integration Lead         | @girma       | Gemini Vision API, disease logic              |
| 4   | Kenenisa Mekonnen  | CSE        | AI/Backend Engineer            | @kenenisa    | AI service wrapper, error handling            |
| 5   | Medhanit Tesfaye   | CSE        | Database & Cloud               | @medhanit    | Firebase schema, weather API                  |
| 6   | Marya Getu         | CSE        | QA & Documentation             | @marya       | Jest/Supertest, Swagger docs                  |
| 7   | Beakal Bewnet      | ECE        | IoT Hardware Lead              | @beakalb     | ESP32 circuit, enclosure, calibration         |
| 8   | Meseret Kebede     | ECE        | Embedded Programmer            | @meseret     | Arduino/C++ firmware, MQTT                    |
| 9   | Abdisa Niguse      | ECE        | Power & Field Testing          | @abdisa      | Power supply, field deployment                |
| 10  | Beakal Abreham     | ECE        | IoT Communications             | @beakala     | MQTT broker, HTTP fallback                    |

---

## Git Workflow

### Branching Strategy (GitHub Flow)

- **`main`** — Production-ready, protected, requires 1 approved PR + CI pass
- **`develop`** — Integration branch, auto-deploy staging on merge
- **`feature/<ticket-id>-short-desc`** — One branch per issue/task
- **`fix/<ticket-id>-short-desc`** — Hotfix branches
- **`chore/<description>`** — Config, dependency, tooling changes

### Branch Naming Examples

```bash
feature/AGRI-12-disease-detection-api
fix/AGRI-34-firebase-auth-null
chore/update-eslint-config
```

### Commit Message Convention (Conventional Commits)

```
type(scope): short description [AGRI-XX]

Types: feat | fix | docs | style | refactor | test | chore | ci

Example:
feat(ai): add Claude vision disease detection endpoint [AGRI-12]
fix(iot): correct DHT11 humidity byte offset [AGRI-28]
test(api): add supertest suite for /diagnose route [AGRI-31]
```

### PR Workflow

1. Create feature branch from `develop`
2. Commit with Conventional Commits format
3. Push and open PR targeting `develop`
4. Address CI failures and PR review comments
5. Domain owner approves + merges (≤24h SLA)
6. CI auto-deploys to staging on merge to develop

---

## Development Guide

### Setting Up Your Environment

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Create `.env.local` files** (see Quick Start)

3. **Run Dev Servers**

   ```bash
   npm run dev:api      # Starts backend on port 5000
   npm run dev:web      # Starts frontend on port 3000
   ```

4. **View Logs**
   - Backend: Check terminal running `npm run dev:api`
   - Frontend: Check browser console and terminal

### Code Structure

**Frontend (`apps/web/`):**

- Use Next.js 14 App Router
- Components in `/components` (organize by feature)
- Hooks in `/hooks` for custom logic
- Zustand for state management
- Tailwind CSS for styling

**Backend (`apps/api/`):**

- Routes define endpoints, controllers handle requests
- Services contain business logic, repositories access Firebase
- Middleware for auth, validation, file uploads
- Zod for schema validation
- Winston for logging

### Common Tasks

**Add a New API Endpoint:**

1. Create validator in `src/validators/`
2. Add route in `src/routes/`
3. Implement controller in `src/controllers/`
4. Add service logic in `src/services/`
5. Update Swagger docs in controller JSDoc

**Add a New Frontend Page:**

1. Create page in `app/(dashboard)/your-page/page.tsx`
2. Create component in `components/` if reusable
3. Add types to `types/`
4. Connect API calls via custom hook in `hooks/`

---

## Deployment

### Staging (Automatic)

```bash
# Push to develop branch → GitHub Action auto-deploys to Render staging
git push origin feature/AGRI-XX
# [Open PR, get approval, merge to develop]
# Staging updates automatically
```

### Production (Manual)

1. Create PR from `develop` → `main`
2. Get approval + ensure all CI checks pass
3. Merge to `main` (triggers deploy action)
4. Manual approval required in GitHub Actions UI
5. Deployment to Vercel (Frontend) + Render (API)

**Production URLs:**

- Frontend: `https://agritech-astu.vercel.app`
- API: `https://api.agritech-astu.com/api/v1`
- API Docs: `https://api.agritech-astu.com/api/docs`

---

## Documentation

- **[Architecture Overview](docs/architecture/system-overview.md)** — System design & data flows
- **[API Reference](docs/api/openapi.yaml)** — Full Swagger/OpenAPI spec
- **[ADRs](docs/adr/)** — Architecture Decision Records
- **[Farmer Guide](docs/user-manual/farmer-guide.md)** — User manual for app
- **[Frontend Guide](apps/web/README.md)** — Next.js setup & conventions
- **[Backend Guide](apps/api/README.md)** — Express API & development

---

## Communication & Coordination

| Channel             | Purpose                           | Frequency         | Owner        |
| ------------------- | --------------------------------- | ----------------- | ------------ |
| GitHub Issues       | All tasks, bugs, features         | Continuous        | Everyone     |
| GitHub Projects     | Sprint board (Kanban)             | Continuous        | Bayisa       |
| WhatsApp/Telegram   | Quick pings, blockers             | Daily             | Bayisa       |
| Saturday 10 AM Sync | Sprint review + planning (30 min) | Weekly            | Bayisa       |
| GitHub PR Review    | Code review before merge          | Per PR (≤24h SLA) | Domain owner |
| Notion/Google Docs  | Meeting notes, ADRs               | Per meeting       | Marya        |

---

## Sprint Plan (12 Weeks, 2-Week Sprints)

| Sprint       | Weeks | Goal                     | Owner(s)          |
| ------------ | ----- | ------------------------ | ----------------- |
| **Sprint 0** | 1–2   | Setup & Foundations      | All               |
| **Sprint 1** | 3–4   | Core Vertical Slices     | ECE + SE          |
| **Sprint 2** | 5–6   | AI + Weather Integration | CSE + SE          |
| **Sprint 3** | 7–8   | Feature Complete         | All               |
| **Sprint 4** | 9–10  | Polish & Hardening       | SE + CSE          |
| **Sprint 5** | 11–12 | Testing, Docs & Demo     | All (Marya leads) |

---

## Troubleshooting

**API not connecting to Firebase?**

- Check `.env` file in `apps/api/`
- Verify Firebase credentials and service account key
- Run `npm run dev:api` and check console logs

**Frontend can't reach API?**

- Ensure API is running on `localhost:5000`
- Check `NEXT_PUBLIC_API_URL` in `apps/web/.env.local`
- Check browser console for network errors

**Tests failing?**

- Clear cache: `npm run test -- --clearCache`
- Rebuild: `npm run build`
- Check `.env` files are properly set

**GitHub Actions failing?**

- Check workflow logs in GitHub Actions tab
- Verify secrets are set in repo Settings
- Ensure branch protection rules are correct

---

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Express Docs](https://expressjs.com/)
- [Firebase Docs](https://firebase.google.com/docs)
- [Gemini API Docs](https://ai.google.dev/gemini-api/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zod Validation](https://zod.dev/)

---

## License

Proprietary. Team AgriTech Integrators, ASTU 2026.

---
