<div align="center">

# 🚗 Enterprise Carpooling Platform

**A production-ready carpooling system built for corporate campuses — connect drivers and passengers, plan routes on live maps, split costs, and cut your organization's carbon footprint.**

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express.js-4-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](#license)

[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [Project Structure](#-project-structure) · [API](#-api-overview) · [Contributing](#-contributing)

</div>

---

## 📖 Overview

**Enterprise Carpooling Platform** helps organizations coordinate secure, cost-effective employee commutes. Employees can offer or find rides within their organization, track routes in real time on interactive maps, manage in-app wallets and payments, and administrators get full visibility through dashboards, analytics, and system health monitoring.

Built as a full-stack monorepo with a React 19 frontend and a Node.js/Express backend, it's designed to be secure, scalable, and easy to self-host.

---

## ✨ Features

### 👤 For Employees
- 🔐 **Secure authentication** — JWT-based login/register with OTP verification and password recovery
- 🚙 **Offer & find rides** — publish rides as a driver or search and book as a passenger
- 🗺️ **Live route mapping** — interactive maps for route planning and tracking
- 🚘 **Vehicle management** — register and manage your vehicles
- 💰 **In-app wallet** — recharge, track transactions, and view balance history
- 💳 **Payments** — integrated payment processing for ride bookings
- ⭐ **Ratings & reviews** — rate co-riders and drivers after each trip
- 🔔 **Notifications** — real-time alerts with configurable preferences
- 📍 **Saved places** — quick-access frequent pickup/drop locations
- 📜 **Ride & trip history** — full history of past rides, bookings, and transactions

### 🛠️ For Administrators
- 🏢 **Organization management** — onboard and manage corporate organizations
- 📊 **Analytics dashboard** — usage, adoption, and cost-savings insights
- 📈 **Reports** — generate and review custom reports
- 🩺 **System health & logs** — monitor uptime, errors, and activity logs
- ⚙️ **System settings** — centralized platform configuration
- 🧑‍💼 **Admin activity tracking** — full audit trail of administrative actions

---

## 🧰 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, React Router DOM v6, Tailwind CSS, Axios, TanStack Query, React Hook Form + Zod, Framer Motion, Lucide Icons, Recharts, Socket.IO Client, React Hot Toast |
| **Backend** | Node.js, Express.js, Prisma ORM, MySQL 8, JWT Authentication, bcrypt.js, Helmet, Morgan, express-validator, Multer, Swagger |
| **Maps** | Mapbox GL JS |
| **Payments** | Razorpay integration |
| **Tooling** | ESLint, Prettier, Nodemon, Concurrently |

---

## 📁 Project Structure

```
Carpooling-Platform/
├── client/                      # React 19 frontend
│   ├── src/
│   │   ├── assets/              # Static media, icons, logos
│   │   ├── components/          # Reusable UI components
│   │   ├── context/             # React Context providers (AuthContext, etc.)
│   │   ├── hooks/                # Custom React hooks
│   │   ├── layouts/             # Page layouts (RootLayout, Sidebar)
│   │   ├── pages/                # Views (Dashboard, Rides, Wallet, Admin, System, ...)
│   │   ├── routes/               # Routing & auth-protected route guards
│   │   ├── services/             # Axios API service modules
│   │   └── utils/                # Formatters, date helpers
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/                     # Express.js REST API
│   ├── config/                   # Database & app configuration
│   ├── controllers/              # Route handlers (auth, ride, booking, wallet, ...)
│   ├── middleware/               # Auth, validation, error handling
│   ├── models/ / repositories/   # Data access layer
│   ├── prisma/                   # Prisma schema, migrations, seed script
│   ├── routes/                   # Express route definitions
│   ├── services/                 # Business logic
│   ├── utils/                    # Logger, response helpers
│   └── server.js                 # Entry point
│
└── package.json                 # Monorepo workspace command coordinator
```

> **Note:** The repository also contains `server/` and `frontend/` directories, kept as earlier iterations of the API/client. The actively maintained stack is `backend/` (Prisma + MySQL) and `client/` (React 19 + Vite).

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18 or higher
- **MySQL** 8.x (local or remote instance)
- A **Mapbox** access token ([get one here](https://www.mapbox.com/))
- (Optional) **Razorpay** API keys for payment features

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/Carpooling-Platform.git
cd Carpooling-Platform
```

### 2. Configure environment variables

**Backend** — copy `backend/.env.example` to `backend/.env` and fill in the values:
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=enterprise_carpool

DATABASE_URL="mysql://root:your_password@localhost:3306/enterprise_carpool"

JWT_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret

UPLOAD_PATH=uploads/
MAPBOX_ACCESS_TOKEN=your_mapbox_token
```

**Client** — copy `client/.env.example` to `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_RAZORPAY_KEY=your_razorpay_key_id
```

### 3. Create the database
```sql
CREATE DATABASE enterprise_carpool;
```

### 4. Install dependencies
```bash
npm run install:all
```

### 5. Run database migrations & seed (Prisma)
```bash
cd backend
npx prisma migrate dev
npx prisma db seed
cd ..
```

### 6. Start the app
```bash
npm run dev
```
- 🌐 Frontend → `http://localhost:3000` (or `5173` for Vite default)
- 🔗 Backend API → `http://localhost:5000`

---

## 📜 Available Scripts

Run from the project root:

| Script | Description |
|---|---|
| `npm run install:all` | Install dependencies for both client and server |
| `npm run dev` | Run frontend and backend concurrently in dev mode |
| `npm run dev:server` | Start the backend with hot-reload (nodemon) |
| `npm run dev:client` | Start the Vite frontend dev server |
| `npm run db:prep` | Prepare/seed the database before startup |
| `npm start` | Prep the database and launch both apps |

---

## 🔌 API Overview

The backend exposes a RESTful API (mounted at `/api`) organized into resource-based routers:

| Resource | Endpoint Prefix | Covers |
|---|---|---|
| Auth | `/api/auth` | Register, login, OTP verification, token refresh |
| Users | `/api/users` | Profile, saved places |
| Organizations | `/api/organizations` | Org onboarding & management |
| Vehicles | `/api/vehicles` | Vehicle CRUD |
| Rides | `/api/rides` | Publish, search, update, and cancel rides |
| Bookings | `/api/bookings` | Ride booking & booking history |
| Wallet | `/api/wallet` | Wallet balance & transactions |
| Payments | `/api/payments` | Payment processing & history |

Postman collections for key modules (Ride Publishing, Vehicle Management, Wallet & Payments) are included in `backend/` for quick API testing. Interactive Swagger docs are also available via `swagger-jsdoc` / `swagger-ui-express`.

---

## 🗄️ Data Model Highlights

Powered by **Prisma ORM**, the schema includes: `Organization`, `User`, `Vehicle`, `Ride`, `Booking`, `Wallet` & `WalletTransaction`, `Payment`, `RideReview`, `RideHistory`, `Notification` & `NotificationPreference`, `SavedPlace`, `RouteMatch` & `MatchPreference`, plus admin/audit models like `SystemLog`, `AdminActivity`, and `Report`.

---

## 🤝 Contributing

Contributions are welcome! To get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to your branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please run `npm run lint` before submitting a PR.

---

## 📄 License

This project is licensed under the **ISC License**.

---

<div align="center">

Made with ❤️ to make corporate commutes smarter, cheaper, and greener.

</div>
