# MarketDash

> Full-stack grocery delivery platform and administrative command center built with React, React Native (Expo), Node.js (Express), Prisma ORM, and PostgreSQL.

---

## Architecture Overview

MarketDash is an end-to-end e-commerce and logistics solution spanning desktop web, responsive mobile interfaces, and a high-throughput REST backend.

`
                  ┌───────────────────────────────┐
                  │    MarketDash Web Client      │
                  │   (React + TypeScript + Vite) │
                  └───────────────┬───────────────┘
                                  │
┌──────────────────────────────┐  │   ┌──────────────────────────────┐
│     Mobile App (Expo)        ├──┼───┤   Admin Operations Portal    │
│ (React Native + NativeWind)  │  │   │  (Catalog, Orders, Metrics)  │
└──────────────────────────────┘  │   └──────────────────────────────┘
                                  ▼
                  ┌───────────────────────────────┐
                  │      Express REST API         │
                  │    (Auth, Orders, Products)   │
                  └───────────────┬───────────────┘
                                  │
                                  ▼
                  ┌───────────────────────────────┐
                  │      Prisma ORM Layer         │
                  │   PostgreSQL / SQLite Storage │
                  └───────────────────────────────┘
`

---

## Features

### 🛒 Storefront & Customer Experience
- **Interactive Catalog**: Real-time product filtering, category navigation, and fuzzy search.
- **Cart & Checkout Lifecycle**: Persistent basket synchronization, promo calculations, and address validation.
- **Order Tracking**: Multi-stage delivery state transitions (PENDING → CONFIRMED → OUT_FOR_DELIVERY → DELIVERED).
- **User Authentication**: Secure JWT-based registration, login, and profile history.

### 📊 Admin Operations Dashboard
- **Catalog Management**: Add, update, and soft-delete products with instant image uploading and stock level tracking.
- **Order Dispatching**: Review incoming customer orders, manage fulfillment statuses, and inspect buyer metrics.
- **Category Hierarchy**: Organize inventory taxonomy dynamically without database migrations.

### 📱 Mobile Experience (Expo / React Native)
- Dedicated native mobile interface built with Expo and NativeWind for fast on-the-go browsing and ordering.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend (Web)** | React 19, TypeScript, Vite, Tailwind CSS, Zustand, TanStack Query, Lucide Icons |
| **Mobile** | React Native, Expo, NativeWind, TypeScript |
| **Backend API** | Node.js, Express, TypeScript, Express Validator, bcrypt, JSON Web Tokens (JWT) |
| **Database & ORM** | PostgreSQL 15+ (Production) / SQLite (Dev), Prisma ORM |
| **DevOps & Containers** | Docker, Docker Compose, pgAdmin |

---

## Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **PostgreSQL** (v15+) or **Docker**

### 2. Environment Setup

Copy example environment configurations:
`ash
cp .env.example .env
cp server/.env.example server/.env
`

**Root .env Configuration:**
`env
VITE_API_BASE_URL=http://localhost:4000/api
VITE_APP_NAME=MarketDash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/marketdash?schema=public
JWT_SECRET=your-super-secret-jwt-key
`

**Server server/.env Configuration:**
`env
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/marketdash?schema=public
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=development
`

---

### 3. Database Initialization & Seeding

`ash
cd server
npm install
npx prisma migrate dev --name init
npx prisma db seed
cd ..
`

Default seeded administrator credentials:
- **Email**: dmin@marketdash.com
- **Password**: dmin123

---

### 4. Running the Development Servers

**Web Storefront & Backend Server:**
`ash
# Install root dependencies
npm install

# Run backend API and frontend concurrently
npm run dev
`
- **Web Storefront**: http://localhost:3000
- **API Server**: http://localhost:4000/api
- **Admin Portal**: http://localhost:3000/admin/login

**Mobile App (Optional):**
`ash
cd mobile
npm install
npx expo start
`

---

## Docker Deployment

To launch the full ecosystem (PostgreSQL, Backend API, Web Frontend, and pgAdmin) via container orchestration:

`ash
docker-compose up -d --build
`

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **pgAdmin**: http://localhost:5050 (dmin@admin.com / dmin)

---

## Project Structure

`
Market-Dash/
├── prisma/                 # Prisma schema definitions and database seeders
│   ├── schema.prisma       # Data models (Users, Products, Orders, Cart)
│   └── seed.ts             # Default catalog and admin user seeder
├── server/                 # Express Node.js backend
│   ├── src/
│   │   ├── controllers/    # Route controllers (Auth, Cart, Orders, Products)
│   │   ├── middleware/     # JWT authentication and error handlers
│   │   ├── routes/         # REST API endpoint definitions
│   │   └── utils/          # Token generation and validation utilities
│   ├── Dockerfile          # Backend containerization
│   └── package.json
├── src/                    # React Web Frontend
│   ├── admin/              # Admin management portal (Catalog, Orders, Analytics)
│   ├── components/         # Atomic UI and layout components
│   ├── pages/              # Customer storefront, checkout, and detail views
│   ├── store/              # Zustand global client state (Auth, Cart)
│   └── api/                # Axios API client bindings
├── mobile/                 # React Native (Expo) mobile application
├── docker-compose.yml      # Multi-container orchestration
└── package.json            # Root configuration
`

---

## License
MIT License.
