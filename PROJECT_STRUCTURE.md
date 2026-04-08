# Smart Home IoT Monitoring - Project Structure

```text
Smart Home IoT Monitoring/
├── README.md
├── LICENSE
├── add_power_data.js
├── Google OAuth.json
├── Backend/
│   ├── package.json
│   ├── jest.config.js
│   ├── server.js
│   ├── migrateDevices.js
│   ├── seedAlerts.js
│   ├── seedPowerHistoryDashboard.js
│   ├── README.md
│   ├── .env.example
│   ├── __tests__/
│   │   ├── auth.test.js
│   │   └── devices.test.js
│   ├── config/
│   │   └── mqtt.js
│   ├── controllers/
│   │   ├── AlertControllers.js
│   │   ├── AuthControllers.js
│   │   ├── DeviceControllers.js
│   │   └── StatsControllers.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── Alerts.js
│   │   ├── Device.js
│   │   ├── PowerHistory.js
│   │   └── User.js
│   ├── routes/
│   │   ├── AlertRoutes.js
│   │   ├── AuthRoutes.js
│   │   ├── DeviceRoutes.js
│   │   └── StatsRoutes.js
│   ├── sockets/
│   │   └── socket.js
│   ├── conffiq/
│   └── coverage/
│       ├── clover.xml
│       ├── coverage-final.json
│       ├── lcov.info
│       └── lcov-report/
└── Frontend/
    ├── package.json
    ├── vite.config.js
    ├── eslint.config.js
    ├── index.html
    ├── README.md
    ├── public/
    └── src/
        ├── main.jsx
        ├── App.jsx
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
        │   ├── AddDevice.jsx
        │   ├── Alerts.jsx
        │   ├── Authentication.jsx
        │   ├── ChangePassword.jsx
        │   ├── Dashboard.jsx
        │   ├── Devices.jsx
        │   ├── Settings.jsx
        │   └── UserManual.jsx
        ├── services/
        │   ├── api.js
        │   └── socket.js
        └── styles/
            ├── AddDevice.css
            ├── Alerts.css
            ├── Authentication.css
            ├── ChangePassword.css
            ├── Dashboard.css
            ├── DeviceCard.css
            ├── Devices.css
            ├── Navbar.css
            ├── Settings.css
            ├── Sidebar.css
            └── UserManual.css
```

## Folder Breakdown

### Root
Holds the main project documentation, the top-level data import script, and the Google OAuth config file.

### Backend
Contains the Express API server, MongoDB models, auth/device/alert/stats logic, MQTT integration, tests, and seed/migration scripts.

### Backend/controllers
Business logic for API routes. These files process requests and return responses.

### Backend/routes
Defines the backend URL endpoints and connects them to controller functions.

### Backend/models
Mongoose schemas for database collections such as users, devices, alerts, and power history.

### Backend/middleware
Authentication and request-guard logic, such as verifying JWT tokens.

### Backend/config
Backend service configuration files, including MQTT setup.

### Backend/sockets
Socket.IO setup for real-time communication between backend and frontend.

### Backend/__tests__
Automated backend test files.

### Backend/coverage
Generated test coverage output.

### Frontend
Contains the React + Vite client application.

### Frontend/src
All frontend source code.

### Frontend/src/components
Reusable UI components like cards, charts, sidebar, and navbar.

### Frontend/src/layouts
Shared layout wrappers used by multiple pages.

### Frontend/src/pages
Full application screens such as login, dashboard, devices, alerts, settings, and manuals.

### Frontend/src/services
API helper functions and socket client setup.

### Frontend/src/styles
CSS files for pages and reusable components.

### Frontend/public
Static files served directly by Vite.
```