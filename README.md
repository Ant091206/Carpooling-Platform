<div align="center">

# 🚗 Enterprise Carpooling Platform

### Smart • Secure • Sustainable Corporate Mobility

A full-stack Enterprise Carpooling Platform that enables employees to share rides within an organization, reducing travel costs, parking congestion, and carbon emissions while providing a seamless and secure commuting experience.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![License](https://img.shields.io/badge/License-MIT-green)

</div>

---

# 📌 Overview

Enterprise Carpooling Platform is a modern corporate ride-sharing solution designed for organizations.

Employees can publish rides, search available rides, book seats, manage trips, track payments through an integrated wallet, and reduce commuting expenses while helping organizations achieve sustainability goals.

---

# ✨ Features

## 👤 Authentication

- Secure JWT Authentication
- Employee Login
- Role-Based Access
- Protected APIs

---

## 🚘 Vehicle Management

- Register Vehicles
- Update Vehicle Details
- Vehicle Verification
- Vehicle Availability

---

## 🛣 Ride Publishing

Drivers can

- Offer rides
- Select pickup & destination
- Set departure time
- Define available seats
- Manage published rides

---

## 🔍 Ride Search

Passengers can

- Search rides
- Filter by date
- Filter by destination
- Search nearby rides
- View ride details
- View driver details

---

## 📖 Booking Management

Passengers can

- Book rides
- View booking status
- Cancel bookings

Drivers can

- Accept bookings
- Reject bookings

---

## 🚍 Trips Management

- Upcoming Trips
- Ongoing Trips
- Completed Trips
- Trip Timeline
- Driver Trips
- Passenger Trips

---

## 💳 Wallet & Payments

- Digital Wallet
- Payment History
- Ride Payments
- Refund Handling
- Transaction History

---

## 🏢 Organization Management

- Employee Registration
- Organization Profiles
- Role Management

---

# 🏗 System Architecture

```text
Frontend (React + Vite)
          │
          ▼
REST APIs (Express.js)
          │
          ▼
Business Logic (Services)
          │
          ▼
Prisma ORM
          │
          ▼
MySQL Database
```

---

# 🛠 Tech Stack

## Frontend

- React.js
- Vite
- React Router
- Axios
- Tailwind CSS

## Backend

- Node.js
- Express.js
- Prisma ORM
- JWT Authentication
- bcrypt
- dotenv

## Database

- MySQL
- Prisma ORM

## Maps

- Mapbox GL JS *(or replace with Google Maps API if that's what your final project uses)*

---

# 📂 Project Structure

```text
Enterprise-Carpooling/

├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── utils/
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   ├── prisma/
│   ├── config/
│   └── utils/
│
└── README.md
```

---

# 🚀 Core Workflow

```text
Employee Login
        │
        ▼
Search / Publish Ride
        │
        ▼
Ride Booking
        │
        ▼
Trip Management
        │
        ▼
Wallet & Payments
        │
        ▼
Ride Completion
```

---

# 🔐 Security

- JWT Authentication
- Password Hashing (bcrypt)
- Protected Routes
- Role-Based Authorization
- Input Validation
- Centralized Error Handling

---

# ⚡ Installation

## Clone Repository

```bash
git clone <repository-url>
cd Enterprise-Carpooling
```

---

## Install Dependencies

```bash
npm install
```

or

```bash
npm run install:all
```

---

## Configure Environment Variables

Create `.env` files based on the provided `.env.example`.

Example backend variables:

```env
DATABASE_URL=
JWT_SECRET=
PORT=
```

---

## Start Development

Backend

```bash
npm run dev
```

Frontend

```bash
npm run dev
```

---

# 📡 API Modules

| Module | Description |
|---------|-------------|
| Authentication | Login & Security |
| Organization | Organization Management |
| Vehicle | Vehicle Management |
| Ride Search | Search Available Rides |
| Booking | Book & Manage Seats |
| Trips | Active & Completed Trips |
| Wallet | Payments & Transactions |

---

# 🌱 Future Enhancements

- Real-time ride tracking
- Google Maps / Mapbox navigation
- Push notifications
- Ride ratings & reviews
- AI-based ride recommendations
- Fare estimation
- Corporate analytics dashboard

---

# 🤝 Contributors

Developed as a collaborative hackathon project.

Special thanks to all team members for contributing to the frontend, backend, database design, API development, and testing.

---

# 📄 License

This project is licensed under the MIT License.

---

<div align="center">

### ⭐ If you like this project, consider giving it a star!

Made with ❤️ using React, Express, Prisma & MySQL

</div>
