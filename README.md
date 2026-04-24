# MarketDash

MarketDash is a modern, full-stack grocery delivery application built with React, Node.js, Express, and PostgreSQL.

## Features

- **Storefront**: Browse categories, view products, add to cart, and checkout.
- **User Accounts**: Registration, login, order history, and saved addresses.
- **Admin Dashboard**: Manage products, categories, orders, and view customer statistics.
- **Responsive Design**: Works seamlessly on desktop and mobile devices.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Zustand, React Query, React Router, Lucide Icons.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, JSON Web Tokens (JWT), bcrypt.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v15 or higher)
- Docker and Docker Compose (optional, for containerized deployment)

## Local Development Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd marketdash
```

### 2. Environment Variables

Create `.env` files based on the provided examples.

**Root directory (`/.env`):**
```env
VITE_API_BASE_URL="http://localhost:3000/api"
VITE_APP_NAME="MarketDash"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/marketdash?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
```

**Server directory (`/server/.env`):**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/marketdash?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=4000
UPLOAD_DIR="src/uploads"
NODE_ENV="development"
```

### 3. Database Setup

Ensure PostgreSQL is running and the `marketdash` database exists.

```bash
cd server
npm install
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Run the Application

**Run both frontend and backend concurrently (from the root directory):**
```bash
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000` and the backend API at `http://localhost:3000/api`.

## Default Admin Credentials

After running the database seed (`npx prisma db seed`), an admin user is created automatically:

- **Email**: admin@marketdash.com
- **Password**: admin123

You can use these credentials to log in to the admin dashboard at `/admin/login`.

## Docker Deployment

To run the entire stack (PostgreSQL, Backend Server, Frontend Client, and pgAdmin) using Docker Compose:

```bash
docker-compose up -d --build
```

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:4000`
- **pgAdmin**: `http://localhost:5050` (Login: admin@admin.com / admin)

## Folder Structure

```
marketdash/
├── prisma/                 # Prisma schema and migrations
├── server/                 # Node.js/Express backend
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth and error middleware
│   │   ├── utils/          # Helper functions
│   │   └── uploads/        # Uploaded images
│   ├── Dockerfile          # Backend Docker config
│   └── package.json
├── src/                    # React frontend
│   ├── admin/              # Admin dashboard components and pages
│   ├── components/         # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Storefront pages
│   ├── store/              # Zustand state management
│   └── api.ts              # Axios instance setup
├── Dockerfile              # Frontend Docker config
├── docker-compose.yml      # Multi-container orchestration
└── package.json            # Root configuration
```
