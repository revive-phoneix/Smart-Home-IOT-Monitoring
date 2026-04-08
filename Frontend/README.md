# Frontend - Smart Home IoT Monitoring

This frontend is built with React and Vite, and provides the UI for authentication, dashboard analytics, device control, alerts, and user settings.

## UI Setup

### Stack
- React 19
- Vite
- React Router DOM
- Axios
- Chart.js + react-chartjs-2
- Lucide React

### Install Dependencies

From the Frontend folder:

```bash
npm install
```

### Backend API Requirement

The frontend currently calls backend APIs at:

- http://localhost:5000/api

If your backend runs on another host/port, update the Axios base URL in src/services/api.js.

### Google OAuth (Optional)

Create `Frontend/.env` with:

```env
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
```

This enables the Google Sign-In button on the authentication page.

## Folder Structure

```text
Frontend/
├── index.html
├── package.json
├── vite.config.js
├── public/
└── src/
	├── App.jsx
	├── main.jsx
	├── index.css
	├── assets/
	├── components/
	│   ├── DeviceCard.jsx
	│   ├── Navbar.jsx
	│   ├── PowerChart.jsx
	│   └── Sidebar.jsx
	├── layouts/
	│   └── MainLayout.jsx
	├── pages/
	│   ├── Authentication.jsx
	│   ├── Dashboard.jsx
	│   ├── Devices.jsx
	│   ├── AddDevice.jsx
	│   ├── Alerts.jsx
	│   ├── Settings.jsx
	│   ├── ChangePassword.jsx
	│   └── UserManual.jsx
	├── services/
	│   └── api.js
	└── styles/
```

## How To Run Frontend

From the Frontend folder:

```bash
npm run dev
```

Vite dev server default URL:

- http://localhost:5173

Make sure the backend is also running so API calls work correctly.

## Build and Preview

```bash
npm run build
npm run preview
```

## Available Scripts

- npm run dev: Start development server
- npm run build: Build production assets
- npm run preview: Preview production build
- npm run lint: Run ESLint checks
