# Enterprise Carpooling Platform

A production-ready Enterprise Carpooling Platform designed for corporate environments. It connects corporate passengers and drivers to coordinate secure commutes, save costs, track routes using Mapbox GL JS, and reduce corporate carbon footprints.

---

## Technical Architecture

### Tech Stack
- **Frontend**: React 19, Vite, React Router DOM v6, Tailwind CSS, Axios, Lucide React Icons, Framer Motion, React Hook Form, React Hot Toast.
- **Backend**: Node.js, Express.js, MySQL 8 (mysql2 with pools), JWT Authentication, bcrypt, dotenv, helmet, morgan, express-validator.
- **Maps**: Mapbox GL JS API Integration.

### Folder Structure
```
d:/Car_Poolinng/
├── client/                      # React 19 Frontend Web Client
│   ├── src/
│   │   ├── assets/              # Static media, icons, and logo assets
│   │   ├── components/          # Reusable shared components
│   │   ├── context/             # React Context Providers (AuthContext, etc.)
│   │   ├── hooks/               # Custom reusable React hooks
│   │   ├── layouts/             # Page layouts (RootLayout, Sidebar)
│   │   ├── pages/               # Views / Page Components (Home, Login, Dashboard)
│   │   ├── routes/              # Routing configurations and auth protection shields
│   │   ├── services/            # API call modules (Axios client config)
│   │   └── utils/               # Formatting, date helpers
│   ├── tailwind.config.js       # Tailwind configuration
│   └── vite.config.js           # Vite server settings & proxy config
│
├── server/                      # Express.js Rest API
│   ├── config/                  # Database connections
│   ├── controllers/             # Request handlers / Controller layer
│   ├── database/                # Schema tables and DDL
│   ├── middleware/              # Auth, error, validator middlewares
│   ├── models/                  # SQL Query / Database wrappers
│   ├── routes/                  # Express route paths definitions
│   ├── services/                # Business logic helper layers
│   ├── utils/                   # Helpers: logger, response formatters
│   └── server.js                # Server entry point
│
└── package.json                 # Monorepo Workspace command coordinator
```

---

## Installation & Setup

### 1. Prerequisites
- Node.js installed (v18+ recommended)
- MySQL Server 8 running locally or remotely

### 2. Configure Environment Variables
1. **Backend**: Setup environment properties in `server/.env` based on `server/.env.example`
2. **Frontend**: Setup client properties in `client/.env` based on `client/.env.example`

### 3. Database Initialization
Create your database inside MySQL:
```sql
CREATE DATABASE enterprise_carpool;
```

### 4. Install Dependencies
Run from the project workspace root:
```bash
npm run install:all
```

### 5. Running the Application
To run both the server and client concurrently in development mode:
```bash
npm run dev
```
- Frontend will open at `http://localhost:3000`
- Backend API will run at `http://localhost:5000`

---

## Scripts List
- `npm run install:all` - Install packages for client and server.
- `npm run dev` - Start development servers concurrently for React and Express.
- `npm run dev:server` - Launch backend API in watcher mode (nodemon).
- `npm run dev:client` - Run React client compiler in watcher mode.
