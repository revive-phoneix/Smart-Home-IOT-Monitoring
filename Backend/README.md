# Backend - Smart Home IoT Monitoring

This backend provides REST APIs for authentication, devices, alerts, and dashboard stats.

## Tech Stack

- Node.js (ES Modules)
- Express
- MongoDB with Mongoose
- dotenv
- cors

## Project Structure

```text
Backend/
├── server.js
├── package.json
├── .env
├── controllers/
├── models/
├── routes/
├── middleware/
├── sockets/
├── migrateDevices.js
├── seedAlerts.js
└── seedPowerHistoryDashboard.js
```

## Environment Variables

Create a file named .env inside Backend with:

```env
MONGO_URI=mongodb://127.0.0.1:27017/smart-home-iot
JWT_SECRET=your-super-secret-key-change-in-production
ALLOWED_ORIGINS=http://localhost:5173
GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=optional-for-future-server-flows
MQTT_ENABLED=false
MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_CLIENT_ID=smarthome-backend
```

Notes:
- **MONGO_URI** is required for API server startup and seed/migration scripts.
- **JWT_SECRET** is used to sign and verify JWT tokens. Change this to a strong random string in production.
- **ALLOWED_ORIGINS** restricts CORS to trusted frontend origins (comma-separated). Default is http://localhost:5173 (Vite dev server).
- **GOOGLE_CLIENT_ID** is required for verifying Google ID tokens in `POST /api/auth/google`.
- **GOOGLE_CLIENT_SECRET** is optional in current implementation (kept for future authorization-code flow support).
- **MQTT_ENABLED** set to true to enable MQTT integration.
- **MQTT_BROKER_URL** MQTT broker URL, for example mqtt://localhost:1883.
- **MQTT_CLIENT_ID** backend MQTT client identifier.
- **MQTT_USERNAME** broker username if required.
- **MQTT_PASSWORD** broker password if required.
- The server currently runs on port 5000 in server.js.

## MQTT Integration

The backend includes MQTT support via [config/mqtt.js](config/mqtt.js).

When enabled, the backend subscribes to:
- `smarthome/devices/+/telemetry`
- `smarthome/devices/+/status`
- `smarthome/devices/+/alerts`
- `smarthome/alerts`

Supported behavior:
- Telemetry updates device power, energy, temperature, humidity, and status in MongoDB.
- Status messages update device online/offline state.
- Alert messages create ACTIVE alerts in MongoDB.
- Socket events are emitted so the frontend updates in real time.

## MongoDB Setup

Option 1: Local MongoDB
1. Install and start MongoDB locally.
2. Use a local URI such as:
   mongodb://127.0.0.1:27017/smart-home-iot

Option 2: MongoDB Atlas
1. Create a cluster in MongoDB Atlas.
2. Create a database user and allow your IP/network access.
3. Put the Atlas connection string in MONGO_URI.

## Install and Run

From Backend folder:

```bash
npm install
npm run dev
```

Backend starts at:
- http://localhost:5000

API base path:
- /api

## API Routes

All routes below are prefixed by /api.

### Auth Routes

Base: /auth

- POST /auth/signup
- POST /auth/login
- POST /auth/google
- GET /auth/profile
- PUT /auth/profile
- GET /auth/settings
- PUT /auth/settings
- POST /auth/settings/backup
- POST /auth/settings/clear-cache
- DELETE /auth/account

### Device Routes

Base: /devices

- GET /devices
- POST /devices
- PUT /devices/toggle/:id
- POST /devices/:deviceId/power-history
- GET /devices/:deviceId/power-history

### Alert Routes

Base: /alerts

- GET /alerts
- PUT /alerts/:id/resolve
- PUT /alerts/resolve-all
- DELETE /alerts/resolved
- DELETE /alerts/all

### Stats Routes

Base: /stats

- GET /stats

## Useful Scripts

From Backend folder:

```bash
npm run dev
npm run migrate:devices
npm run seed:powerhistory:dashboard
node seedAlerts.js
```

## Quick Health Check

1. Start backend with npm run dev.
2. Confirm MongoDB connected log appears.
3. Call one endpoint, for example:
   GET http://localhost:5000/api/stats
