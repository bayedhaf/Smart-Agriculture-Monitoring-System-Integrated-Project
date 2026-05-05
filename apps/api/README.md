# 🚀 Smart Agriculture API (Node.js + Express)

Production-grade REST API for real-time IoT sensor data, AI-powered disease diagnosis, and weather integration.

**Lead:** Bayisa and (@beka)

---

## Table of Contents

- [Quick Start](#quick-start)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Environment Setup](#environment-setup)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Development Guide](#development-guide)
- [Authentication](#authentication)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm/pnpm installed
- Firebase Admin SDK service account key
- Google Gemini API key
- OpenWeatherMap API key

### Installation

```bash
# From root of monorepo
cd apps/api

# Install dependencies
pnpm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Fill in your credentials:
# - FIREBASE_PROJECT_ID
# - FIREBASE_PRIVATE_KEY
# - FIREBASE_CLIENT_EMAIL
# - GEMINI_API_KEY
# - OPENWEATHERMAP_API_KEY
# - JWT_SECRET

# Run development server
pnpm dev
```

Server runs on `http://localhost:5000`

**Verify setup:**

```bash
curl http://localhost:5000/api/v1/health
# Response: { "status": "ok", "uptime": 123, "timestamp": "2026-04-25T..." }
```

---

## Architecture Overview

### Layered Architecture

```
Routes (Define endpoints)
   ↓
Controllers (Handle HTTP request/response)
   ↓
Services (Business logic & orchestration)
   ↓
Repositories (Firebase data access)
   ↓
External APIs (Gemini, OpenWeatherMap)
```

### Request Flow Example: Disease Diagnosis

```
POST /diagnose (ImageUploadForm from frontend)
  ↓
diagnose.routes.ts (Route handler)
  ↓
diagnose.controller.ts (Validate input, call service)
  ↓
diagnose.service.ts (Orchestrate: upload image → call Gemini → save result)
  ↓
ai.service.ts (Call Gemini Vision API)
↓
diagnosis.repository.ts (Save diagnosis to Firebase)
  ↓
Response: { diagnosisId, disease, confidence, remedy, prevention, imageUrl }
```

### Key Design Principles

- **Separation of Concerns:** Each layer has a single responsibility
- **API-First:** Routes define contracts before implementation
- **Stateless:** No server-side session state; JWT for auth
- **Fail-Safe IoT:** ESP32 stores last 5 readings in EEPROM
- **Error Handling:** Consistent error envelope with error codes
- **Environment-Based Config:** No secrets in code; use `.env`

---

## Project Structure

```
apps/api/
├── src/
│   ├── index.ts                     ← Server entry point
│   ├── app.ts                       ← Express app setup & middleware
│   │
│   ├── config/
│   │   ├── env.ts                   ← Zod-validated environment variables
│   │   ├── firebase.ts              ← Firebase Admin SDK initialization
│   │   └── swagger.ts               ← Swagger/OpenAPI setup
│   │
│   ├── routes/                      ← Route definitions
│   │   ├── index.ts                 ← Mount all routers
│   │   ├── auth.routes.ts           ← /auth/* endpoints
│   │   ├── diagnose.routes.ts       ← /diagnose/* endpoints
│   │   ├── sensor.routes.ts         ← /sensors/* endpoints
│   │   ├── recommendation.routes.ts ← /recommendations/* endpoints
│   │   ├── weather.routes.ts        ← /weather/* endpoints
│   │   └── health.routes.ts         ← /health/* endpoints
│   │
│   ├── controllers/                 ← Request handlers
│   │   ├── auth.controller.ts       ← Register, login, refresh, profile
│   │   ├── diagnose.controller.ts   ← Diagnosis submission & retrieval
│   │   ├── sensor.controller.ts     ← Sensor readings & device management
│   │   ├── recommendation.controller.ts
│   │   └── weather.controller.ts
│   │
│   ├── services/                    ← Business logic
│   │   ├── auth.service.ts          ← Password hashing, JWT creation
│   │   ├── diagnose.service.ts      ← Orchestrate AI + storage
│   │   ├── ai.service.ts            ← Gemini Vision API wrapper
│   │   ├── sensor.service.ts        ← Sensor data logic
│   │   ├── weather.service.ts       ← OpenWeatherMap integration
│   │   └── recommendation.service.ts← Rule engine (irrigation logic)
│   │
│   ├── repositories/                ← Firebase database access
│   │   ├── user.repository.ts
│   │   ├── diagnosis.repository.ts
│   │   ├── sensor.repository.ts
│   │   ├── recommendation.repository.ts
│   │   └── firebase.utils.ts        ← Helper functions
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts       ← JWT verification
│   │   ├── apiKey.middleware.ts     ← ESP32 device key validation
│   │   ├── validate.middleware.ts   ← Zod schema validation
│   │   ├── upload.middleware.ts     ← Multer file handling
│   │   ├── rateLimit.middleware.ts  ← express-rate-limit
│   │   └── errorHandler.middleware.ts ← Global error handling
│   │
│   ├── validators/                  ← Zod schemas
│   │   ├── auth.validators.ts
│   │   ├── diagnose.validators.ts
│   │   ├── sensor.validators.ts
│   │   └── common.validators.ts     ← Shared schemas
│   │
│   ├── types/
│   │   ├── express.d.ts             ← Extend Express Request type
│   │   ├── api.types.ts             ← Request/response types
│   │   └── index.ts                 ← Export all types
│   │
│   └── utils/
│       ├── logger.ts                ← Winston logger instance
│       ├── asyncHandler.ts          ← Wrap async controllers
│       ├── apiResponse.ts           ← Response envelope helpers
│       └── errors.ts                ← Custom error classes
│
├── __tests__/
│   ├── unit/
│   │   ├── services/
│   │   │   ├── auth.service.test.ts
│   │   │   ├── ai.service.test.ts
│   │   │   └── weather.service.test.ts
│   │   └── utils/
│   │       └── apiResponse.test.ts
│   │
│   └── integration/
│       ├── auth.test.ts             ← Full auth flow tests
│       ├── diagnose.test.ts         ← Disease diagnosis tests
│       └── sensor.test.ts           ← Sensor endpoint tests
│
├── .env.example
├── .env                             ← Gitignored secrets
├── jest.config.ts
├── tsconfig.json
└── package.json
```

---

## Technology Stack

| Category           | Tech                 | Purpose                      |
| ------------------ | -------------------- | ---------------------------- |
| **Runtime**        | Node.js 18+          | Server runtime               |
| **Framework**      | Express.js           | HTTP server & routing        |
| **Database**       | Firebase Realtime DB | Real-time data storage       |
| **File Storage**   | Firebase Storage     | Image uploads                |
| **Authentication** | Firebase Auth + JWT  | User auth & API tokens       |
| **AI Integration** | Google Gemini API   | Disease diagnosis via vision |
| **Weather**        | OpenWeatherMap API   | Weather forecasts & data     |
| **Validation**     | Zod                  | Schema validation & parsing  |
| **File Upload**    | Multer               | Image handling               |
| **Logging**        | Winston              | Structured logging           |
| **Rate Limiting**  | express-rate-limit   | API protection               |
| **Testing**        | Jest + Supertest     | Unit & integration tests     |
| **Documentation**  | Swagger/OpenAPI      | API documentation            |
| **Security**       | bcrypt, JWT, helmet  | Password hashing & security  |

---

## Environment Setup

### Create `.env` File

```bash
cp .env.example .env
```

### Required Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-abc@project.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project.firebasedatabase.app

# External APIs
GEMINI_API_KEY=AIzaSy...
OPENWEATHERMAP_API_KEY=your-openweathermap-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=5242880         # 5MB
ALLOWED_IMAGE_TYPES=jpg,jpeg,png

# CORS
CORS_ORIGIN=http://localhost:3000,https://agritech-astu.vercel.app
```

### Getting Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project → Project settings
3. Service accounts tab → Generate new private key
4. Copy JSON values to `.env`

---

## API Endpoints

All responses use an envelope pattern for consistency:

```json
// Success
{
  "success": true,
  "data": { /* payload */ },
  "message": "Operation completed successfully"
}

// Error
{
  "success": false,
  "error": {
    "code": "ERR_CODE",
    "message": "Human-readable error message"
  }
}
```

### Authentication Endpoints

| Method  | Endpoint         | Auth          | Description              |
| ------- | ---------------- | ------------- | ------------------------ |
| `POST`  | `/auth/register` | None          | Register new farmer      |
| `POST`  | `/auth/login`    | None          | Login, get JWT token     |
| `POST`  | `/auth/refresh`  | Refresh Token | Get new JWT token        |
| `GET`   | `/auth/me`       | Bearer JWT    | Get current user profile |
| `PATCH` | `/auth/me`       | Bearer JWT    | Update user profile      |

**Example: Register**

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Farmer",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "phone": "+251912345678",
    "location": "Addis Ababa"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "user123",
      "name": "John Farmer",
      "email": "john@example.com"
    }
  }
}
```

### Disease Diagnosis Endpoints

| Method   | Endpoint            | Auth       | Description                     |
| -------- | ------------------- | ---------- | ------------------------------- |
| `POST`   | `/diagnose`         | Bearer JWT | Submit leaf image for diagnosis |
| `GET`    | `/diagnose/history` | Bearer JWT | Get farmer's diagnosis history  |
| `GET`    | `/diagnose/:id`     | Bearer JWT | Get single diagnosis result     |
| `DELETE` | `/diagnose/:id`     | Bearer JWT | Delete a diagnosis              |

**Example: Submit Diagnosis**

```bash
curl -X POST http://localhost:5000/api/v1/diagnose \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -F "image=@leaf.jpg" \
  -F "cropType=maize"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "diagnosisId": "diag123",
    "disease": "Maize Grey Leaf Spot",
    "confidence": 0.94,
    "severity": "medium",
    "remedy": "Apply fungicide XYZ weekly for 3 weeks...",
    "prevention": "Ensure proper spacing and ventilation...",
    "imageUrl": "https://storage.firebase.com/...",
    "createdAt": "2026-04-25T10:30:00Z"
  }
}
```

### IoT Sensor Endpoints

| Method | Endpoint            | Auth             | Description               |
| ------ | ------------------- | ---------------- | ------------------------- |
| `POST` | `/sensors/readings` | API Key (header) | ESP32 posts sensor data   |
| `GET`  | `/sensors/latest`   | Bearer JWT       | Get latest sensor reading |
| `GET`  | `/sensors/history`  | Bearer JWT       | Get sensor history        |
| `GET`  | `/sensors/devices`  | Bearer JWT       | List farmer's devices     |
| `POST` | `/sensors/devices`  | Bearer JWT       | Register new device       |

**Example: ESP32 Posts Sensor Data**

```bash
curl -X POST http://localhost:5000/api/v1/sensors/readings \
  -H "Content-Type: application/json" \
  -H "x-device-key: device-api-key-123" \
  -d '{
    "deviceId": "esp32-farm-1",
    "soilMoisture": 65,
    "temperature": 28.5,
    "humidity": 72,
    "timestamp": "2026-04-25T10:30:00Z"
  }'
```

### Weather Endpoints

| Method | Endpoint            | Auth       | Description     |
| ------ | ------------------- | ---------- | --------------- |
| `GET`  | `/weather/current`  | Bearer JWT | Current weather |
| `GET`  | `/weather/forecast` | Bearer JWT | 5-day forecast  |

### Recommendation Endpoints

| Method | Endpoint                   | Auth       | Description                   |
| ------ | -------------------------- | ---------- | ----------------------------- |
| `GET`  | `/recommendations/current` | Bearer JWT | Get actionable recommendation |
| `GET`  | `/recommendations/history` | Bearer JWT | Get past recommendations      |

### Health & System Endpoints

| Method | Endpoint           | Auth | Description               |
| ------ | ------------------ | ---- | ------------------------- |
| `GET`  | `/health`          | None | API health check          |
| `GET`  | `/health/firebase` | None | Firebase connection check |

---

## Database Schema

### Firebase Realtime Database Structure

```
/users/{userId}/
  profile: {
    name: string
    email: string
    phone: string
    location: string
    createdAt: ISO 8601
  }
  devices: {
    [deviceId]: {
      name: string
      location: string
      apiKey: string (hashed)
      createdAt: ISO 8601
    }
  }

/sensorReadings/{deviceId}/{readingId}/
  soilMoisture: number (0-100 %)
  temperature: number (Celsius)
  humidity: number (0-100 %)
  timestamp: ISO 8601

/diagnoses/{userId}/{diagnosisId}/
  cropType: "maize" | "tomato" | "teff"
  disease: string
  confidence: number (0.0-1.0)
  severity: "low" | "medium" | "high" | "none"
  remedy: string
  prevention: string
  isHealthy: boolean
  imageUrl: string
  createdAt: ISO 8601

/recommendations/{userId}/{recId}/
  action: string
  reason: string
  sensorSnapshot: object
  weatherSnapshot: object
  createdAt: ISO 8601
```

### Firebase Security Rules

```javascript
{
  "rules": {
    "sensorReadings": {
      "{deviceId}": {
        "{reading}": {
          ".write": "root.child('users').child(auth.uid).child('devices').child($deviceId).exists() &&
                     request.auth.uid != null",
          ".read": "root.child('users').child(auth.uid).child('devices').child($deviceId).exists()"
        }
      }
    },
    "diagnoses": {
      "{userId}": {
        "{diagId}": {
          ".read": "auth.uid == $userId",
          ".write": "auth.uid == $userId"
        }
      }
    }
  }
}
```

---

## Development Guide

### Running the API

```bash
# Development (with hot reload via nodemon)
npm dev

# Production build
npm build

# Run production build
npm start

# Run tests
npm test

# Watch tests
npm test:watch

# Lint code
pnpm lint

# Type checking
pnpm type-check
```

## Authentication

### JWT Token Flow

1. User registers/logs in → Firebase Auth creates user
2. Backend generates JWT token (valid for 1 hour)
3. Frontend stores token in secure httpOnly cookie
4. Frontend includes token in `Authorization: Bearer <token>` header
5. Middleware verifies JWT signature and expiry
6. If expired, frontend calls `/auth/refresh` with refresh token

### Environment Variables (Production)

```env
PORT=5000
NODE_ENV=production
JWT_SECRET=production-secret-key-min-32-chars

FIREBASE_PROJECT_ID=smart-agri-prod
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xyz@smart-agri-prod.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://smart-agri-prod.firebasedatabase.app

GEMINI_API_KEY=AIzaSy...
OPENWEATHERMAP_API_KEY=...

CORS_ORIGIN=https://agritech-astu.vercel.app

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Render Deployment

1. **Connect Repository**
   - Go to [Render Dashboard](https://render.com)
   - Click "New" → "Web Service"
   - Select GitHub repository

2. **Configure Service**

   ```
   Name: smart-agri-api
   Environment: Node
   Build Command: npm run build
   Start Command: npm run start
   ```

3. **Add Environment Variables**
   - Copy all production env vars from `.env.example`
   - Add in Render dashboard

4. **Deploy**
   - Auto-deploy on push to `main` branch
   - Manual deploy via Render dashboard

### Production URL

```
https://api.agritech-astu.com
API Docs: https://api.agritech-astu.com/api/docs
Health: https://api.agritech-astu.com/api/v1/health
```

---

## Troubleshooting

| Issue                         | Solution                                                      |
| ----------------------------- | ------------------------------------------------------------- |
| **Firebase connection error** | Check `.env` vars, verify service account key is valid        |
| **Gemini API 401**            | Verify `GEMINI_API_KEY` is correct and not expired            |
| **Port 5000 already in use**  | Kill process: `lsof -ti:5000 \| xargs kill -9` or change PORT |
| **Tests failing**             | Clear cache: `npm run test -- --clearCache` and rebuild       |
| **Rate limit exceeded**       | Adjust `RATE_LIMIT_MAX_REQUESTS` in `.env`                    |
| **Multer file upload error**  | Check `MAX_FILE_SIZE` and `ALLOWED_IMAGE_TYPES` in `.env`     |
| **CORS error**                | Verify `CORS_ORIGIN` includes your frontend URL               |

---

## Performance & Security

### Security Best Practices

- ✅ Use environment variables for secrets (never commit `.env`)
- ✅ Hash passwords with bcrypt (minimum 10 rounds)
- ✅ Validate all inputs with Zod
- ✅ Implement rate limiting on public endpoints
- ✅ Use HTTPS in production (Render handles this)
- ✅ Set secure CORS headers
- ✅ Implement Firebase security rules
- ✅ Log security events (auth, errors, suspicious activity)

### Performance Tips

- ✅ Cache Firebase queries where appropriate
- ✅ Use indexes for frequently queried paths
- ✅ Implement pagination for large result sets
- ✅ Compress images before storing in Firebase Storage
- ✅ Use connection pooling for external APIs
- ✅ Monitor response times with logging

---

## Resources

- [Express.js Docs](https://expressjs.com/)
- [Firebase Admin SDK](https://firebase.google.com/docs/database/admin/start)
- [Zod Documentation](https://zod.dev/)
- [Swagger/OpenAPI](https://swagger.io/specification/)
- [JWT.io](https://jwt.io/)
- [Gemini API Docs](https://ai.google.dev/gemini-api/docs)

---

**Lead:** Bayisa Balcha Teka (@bayisa)  
**Questions?** Open an issue or contact the team.
