# Smart Home IoT Monitoring System

A full-stack web application for monitoring smart home devices, tracking power and energy usage, and managing alerts from a single dashboard.

## Project Overview

This project provides a complete monitoring workflow for a smart-home environment:
- User authentication (login/signup) and profile/settings management
- Device management (create, list, and toggle device state)
- Power history tracking for each device
- Alert generation/review workflows
- Dashboard analytics for quick system insights

The application is split into:
- A React + Vite frontend for UI and visualization
- A Node.js + Express backend with MongoDB for APIs and persistence
- IoT/data simulation scripts for seeding and test data generation

## Features

- Authentication
  - Signup and login
  - User profile and settings endpoints
- Device Monitoring
  - Add new devices
  - View all devices
  - Toggle device ON/OFF state
- Power and Energy Tracking
  - Record power history per device
  - View device-wise power history
  - Chart-based dashboard visualization
- Alert Management
  - Get alerts
  - Resolve individual or all alerts
  - Clear resolved/all alerts
- Data Utilities
  - Migration and seed scripts for devices/alerts/power history
  - Frontend-compatible sample datasets

## Tech Stack

### Frontend
- React 19
- Vite
- React Router
- Chart.js + react-chartjs-2
- Axios

### Backend
- Node.js (ES Modules)
- Express
- MongoDB + Mongoose
- CORS + dotenv
- Optional libraries present for security/realtime workflows (helmet, jsonwebtoken, socket.io, mqtt)

### IoT / Data Simulation
- API-based simulation script: add_power_data.js
- Seed scripts in Backend for alert and power-history bootstrapping

## Folder Structure

```text
project-root/
├── README.md
├── add_power_data.js
├── Backend/
│   ├── server.js
│   ├── package.json
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   └── sockets/
├── Frontend/
│   ├── package.json
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   └── styles/
│   └── public/
├── Sample Data/
└── Lighthouse Summary/
```

## Prerequisites

- Node.js 18+ (recommended)
- npm 9+
- MongoDB (local or MongoDB Atlas)

## Setup Instructions

## 1) Clone and Install Dependencies

From project root, install frontend and backend dependencies separately.

```bash
cd Backend
npm install

cd ../Frontend
npm install
```

## 2) Backend Environment Setup

Create Backend/.env with at least:

```env
MONGO_URI=mongodb://127.0.0.1:27017/smart-home-iot
GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
```

If you use MongoDB Atlas, replace MONGO_URI with your Atlas connection string.

If you have a Google OAuth JSON file:
- Use `client_id` value for `GOOGLE_CLIENT_ID` (Backend) and `VITE_GOOGLE_CLIENT_ID` (Frontend).
- `client_secret` is not required for the current ID-token flow.

## 3) Frontend API Base URL

The frontend Axios client currently targets:

- http://localhost:5000/api

If your backend runs elsewhere, update Frontend/src/services/api.js accordingly.

## 4) Optional Data Bootstrapping

From Backend:

```bash
npm run migrate:devices
npm run seed:powerhistory:dashboard
```

Optional additional seed script:

```bash
node seedAlerts.js
```

## 5) IoT Simulation (Optional)

From project root, run:

```bash
node add_power_data.js
```

This script posts power data to the backend for predefined devices. Ensure:
- Backend is running on port 5000
- Device IDs in add_power_data.js exist in your database

## How To Run

## Start Backend

```bash
cd Backend
npm run dev
```

Default backend URL: http://localhost:5000

## Start Frontend

Open a second terminal:

```bash
cd Frontend
npm run dev
```

Default frontend URL (Vite): http://localhost:5173

## Access App

Open the frontend URL in your browser and log in/sign up to start monitoring devices.

## API Overview

Base URL: /api

- Auth: /auth/signup, /auth/login, /auth/profile, /auth/settings
- Devices: /devices, /devices/toggle/:id, /devices/:deviceId/power-history
- Alerts: /alerts, /alerts/:id/resolve, /alerts/resolve-all
- Stats: /stats

## Notes

- Current authentication flow is basic and intended for development/demo usage.
- CORS is enabled globally in backend server configuration.
- For production, add stronger auth/session handling, environment hardening, and deployment-specific configs.
