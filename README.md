# SliceAPI

SliceAPI is a full LaaS **(Licensing as a Service)** platform built with Fastify, PostgreSQL, and a Next.js admin dashboard. It offers multi-tenant license management, API key authentication, usage tracking, and a TypeScript SDK for integration in client applications.

## Overview

SliceAPI provides a complete solution for software licensing, allowing you to:
- Manage products, plans, and licenses through a web dashboard
- Validate user licenses via a RESTful API
- Track activations and usage across devices
- Integrate licensing into your applications with a TypeScript SDK
- Handle multi-tenant scenarios where each business has isolated data

## Architecture

This repository is organized as a **monorepo** using pnpm workspaces, containing four main packages:

```
slice/
├── server/     # Backend API server
├── client/     # Next.js admin dashboard
├── sdk/        # TypeScript SDK for integrations
└── shared/     # Shared TypeScript types
```

## Packages

### 🖥️ Server (`/server`)

The backend API server built with **Fastify**, **TypeScript**, and **PostgreSQL** (via Prisma).

**Key Features:**
- RESTful API for license validation and management
- Multi-tenant architecture with tenant isolation
- API key authentication for tenants
- License validation endpoint (`POST /api/v1/validate`)
- Admin API for products, plans, licenses, and users
- Audit logging for all operations
- Redis caching (with in-memory fallback)
- Stripe integration for billing and subscriptions
- Email verification system

**Tech Stack:**
- Fastify (web framework)
- Prisma (ORM)
- PostgreSQL (database)
- Redis (caching)
- JWT (authentication)
- Stripe (billing)

**Getting Started:**
```bash
cd server
pnpm install
pnpm dev  # Starts on http://localhost:3001
```

See [`server/README.md`](./server/README.md) for detailed API documentation.

---

### 🎨 Client (`/client`)

A modern **Next.js** admin dashboard for managing the SliceAPI platform.

**Key Features:**
- Tenant authentication and session management
- Product and plan management
- License creation and assignment
- User management
- API key management
- Audit log viewing
- Analytics and reporting
- Stripe checkout integration
- Responsive design with Tailwind CSS

**Tech Stack:**
- Next.js 16 (React framework)
- TypeScript
- Tailwind CSS (styling)
- Radix UI (components)
- TanStack Query (data fetching)
- Recharts (analytics)

**Getting Started:**
```bash
cd client
pnpm install
pnpm dev  # Starts on http://localhost:3000
```

---

### 📦 SDK (`/sdk`)

A **TypeScript SDK** for integrating SliceAPI into your applications.

**Key Features:**
- Type-safe API client
- Cross-platform (Node.js 18+ and browsers)
- License validation methods
- User management
- License assignment and status updates
- Comprehensive error handling
- Built with native `fetch` API

**Installation:**
```bash
npm install @sliceapi/sdk
# or
pnpm add @sliceapi/sdk
```

**Quick Start:**
```typescript
import { SliceClient } from '@sliceapi/sdk';

const client = new SliceClient('sk_live_...', {
  baseUrl: 'https://api.example.com'
});

// Validate a user's license
const result = await client.validate.validate('user_123');

if (result.valid) {
  console.log('License is valid:', result.license);
} else {
  console.log('License invalid:', result.reason);
}
```

See [`sdk/README.md`](./sdk/README.md) for complete SDK documentation.

---

### 🔗 Shared (`/shared`)

Shared TypeScript types and interfaces used across all packages.

**Purpose:**
- Ensures type consistency between server, client, and SDK
- Defines API request/response types
- Contains core domain models (Tenant, User, License, Product, Plan, etc.)

**Usage:**
All packages import types from `@slice/shared` to maintain type safety across the monorepo.

---

## Getting Started

### Prerequisites

- **Node.js** 18+ (for native `fetch` support)
- **pnpm** (package manager)
- **PostgreSQL** (database)
- **Redis** (optional, for caching)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/xpydr/slice.git
   cd slice
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   
   Create a `.env` file in the `server/` directory:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/slice"
   
   # Server
   PORT=3001
   JWT_SECRET="your-secret-key"
   CORS_ORIGIN="*"
   
   # Redis (optional)
   REDIS_HOST=localhost
   REDIS_PORT=6379
   
   # Stripe (optional)
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   
   # Email (optional)
   RESEND_API_KEY="re_..."
   ```

4. **Set up the database:**
   ```bash
   cd server
   pnpm prisma:migrate
   pnpm prisma:generate
   ```

5. **Start development servers:**
   
   From the root directory:
   ```bash
   # Start server (port 3001)
   pnpm dev:server
   
   # Start client (port 3000)
   pnpm dev:client
   ```

   Or start individually:
   ```bash
   cd server && pnpm dev
   cd client && pnpm dev
   ```

## Development

### Available Scripts

From the root directory:

- `pnpm dev:server` - Start the server in development mode
- `pnpm dev:client` - Start the client in development mode
- `pnpm build` - Build all packages
- `pnpm lint` - Lint all packages

### Project Structure

```
slice/
├── client/              # Next.js admin dashboard
│   ├── src/
│   │   ├── app/         # Next.js app router pages
│   │   ├── components/  # React components
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities and API clients
│   └── package.json
├── server/              # Fastify API server
│   ├── src/
│   │   ├── routes/      # API route handlers
│   │   ├── services/    # Business logic services
│   │   ├── middleware/  # Auth, rate limiting, caching
│   │   └── index.ts     # Server entry point
│   ├── prisma/          # Database schema and migrations
│   └── package.json
├── sdk/                 # TypeScript SDK
│   ├── src/
│   │   ├── client.ts    # Main SDK client
│   │   ├── methods/     # API method implementations
│   │   └── types.ts     # SDK-specific types
│   └── package.json
├── shared/              # Shared types
│   ├── api-types.ts     # API request/response types
│   └── package.json
├── package.json         # Root workspace config
└── pnpm-workspace.yaml  # pnpm workspace definition
```

## Core Concepts

### Multi-Tenancy

SliceAPI is built as a **multi-tenant** platform:
- Each **Tenant** represents a business using the platform
- Tenants have isolated data (products, plans, licenses, users)
- Authentication via API keys (similar to Stripe)
- Each tenant can have multiple API keys

### License Model

- **Products**: Top-level entities (e.g., "My SaaS App")
- **Plans**: Subscription tiers with configuration (max seats, expiration, features)
- **Licenses**: Instances of plans, assigned to users
- **Users**: End-users identified by tenant's internal user ID
- **Activations**: Track when users activate licenses on devices

### Validation Flow

1. Tenant's application calls `POST /api/v1/validate` with API key + `userId`
2. Server validates API key and finds tenant
3. Server checks if user has an active license
4. Server returns validation result with license details and features

## Documentation

- **[Server API Documentation](./server/README.md)** - Complete API reference
- **[SDK Documentation](./sdk/README.md)** - SDK usage guide

## License

MIT

## Author

Rohan Puri <xpydrrr@gmail.com>

