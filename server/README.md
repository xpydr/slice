# SliceAPI Server

The backend API server for SliceAPI, a multi-tenant Licensing as a Service (LaaS) platform. Built with **Fastify**, **TypeScript**, **PostgreSQL**, and **Prisma**.

## Overview

The SliceAPI server provides a RESTful API for managing software licenses in a multi-tenant architecture. Each tenant (business) has isolated data including products, plans, licenses, and users. The platform supports license validation, activation tracking, and comprehensive audit logging.

## Features

- ✅ **Multi-Tenant Architecture** - Complete tenant isolation with API key authentication
- ✅ **License Validation API** - Validate user licenses via `/api/v1/validate`
- ✅ **Product & Plan Management** - Create products and define subscription plans
- ✅ **License Management** - Generate, assign, and manage licenses
- ✅ **User Management** - Manage end-users with external ID mapping
- ✅ **Activation Tracking** - Track license activations across devices
- ✅ **API Key Management** - Secure API key generation and management
- ✅ **Audit Logging** - Comprehensive logging of all operations
- ✅ **Stripe Integration** - Billing and subscription management
- ✅ **Email Verification** - Email verification system for tenants
- ✅ **Session Management** - JWT-based session authentication for dashboard
- ✅ **Rate Limiting** - Per-tenant rate limiting middleware
- ✅ **Caching** - Redis caching with in-memory fallback
- ✅ **Password Authentication** - Secure password hashing with Argon2

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Fastify
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Caching**: Redis (optional, with in-memory fallback)
- **Authentication**: JWT, API Keys, Argon2
- **Billing**: Stripe
- **Email**: Resend

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Redis (optional, for caching)
- pnpm package manager

### Installation

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   
   Create a `.env` file in the `server/` directory:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/slice"
   
   # Server Configuration
   PORT=3001
   JWT_SECRET="your-secret-key-change-in-production"
   CORS_ORIGIN="*"
   
   # Redis (Optional - falls back to in-memory cache)
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=
   REDIS_DB=0
   REDIS_KEY_PREFIX=slice:cache:
   
   # Cache Configuration
   CACHE_TTL=300000  # 5 minutes in milliseconds
   
   # Admin API Key (for platform admin operations)
   ADMIN_API_KEY="admin-secret-key"
   
   # Stripe (Optional - for billing)
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   
   # Email (Optional - for verification)
   RESEND_API_KEY="re_..."
   FROM_EMAIL="noreply@example.com"
   ```

3. **Set up the database:**
   ```bash
   # Generate Prisma client
   pnpm prisma:generate
   
   # Run migrations
   pnpm prisma:migrate
   
   # (Optional) Open Prisma Studio to view data
   pnpm prisma:studio
   ```

4. **Start the server:**
   ```bash
   pnpm dev
   ```

   The server will start on `http://localhost:3001`

## Project Structure

```
server/
├── src/
│   ├── index.ts              # Server entry point
│   ├── db.ts                 # Database layer (Prisma client wrapper)
│   ├── types.ts              # TypeScript type definitions
│   ├── routes/               # API route handlers
│   │   ├── validate.ts       # License validation endpoint
│   │   ├── admin.ts          # Admin API endpoints
│   │   └── billing.ts        # Stripe billing endpoints
│   ├── services/             # Business logic services
│   │   ├── laas-license-service.ts
│   │   ├── subscription-license-service.ts
│   │   ├── api-key-service.ts
│   │   ├── jwt-service.ts
│   │   ├── password-service.ts
│   │   ├── email-service.ts
│   │   ├── stripe-service.ts
│   │   └── verification-code-service.ts
│   ├── middleware/           # Request middleware
│   │   ├── tenant-auth.ts    # API key & session authentication
│   │   ├── admin-auth.ts     # Admin API key authentication
│   │   ├── rate-limit.ts     # Rate limiting
│   │   └── cache.ts          # Response caching
│   └── lib/
│       └── redis.ts          # Redis client
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Database migrations
└── package.json
```

## API Documentation

### Base URL

All API endpoints are prefixed with `/api/v1` (except health check).

### Authentication

The API supports two authentication methods:

1. **API Key Authentication** (for programmatic access)
   ```
   Authorization: Bearer sk_live_...
   ```

2. **Session Authentication** (for dashboard access)
   ```
   Cookie: session=...
   ```

### Health Check

```
GET /health
```

Returns server status and cache information.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "cache": {
    "type": "redis",
    "redis": {
      "connected": true,
      "host": "localhost",
      "port": 6379
    }
  }
}
```

---

## License Validation API

### Validate User License

The main LaaS endpoint for validating user licenses.

```
POST /api/v1/validate
Authorization: Bearer sk_live_...
Content-Type: application/json

{
  "userId": "user_123"
}
```

**Response (Valid):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "license": {
      "id": "license-uuid",
      "status": "active",
      "expiresAt": null,
      "features": ["feature1", "feature2"]
    },
    "activation": {
      "id": "activation-uuid",
      "activatedAt": "2024-01-01T00:00:00.000Z"
    },
    "features": ["feature1", "feature2"]
  }
}
```

**Response (Invalid):**
```json
{
  "success": true,
  "data": {
    "valid": false,
    "reason": "expired" | "revoked" | "suspended" | "exceeded_seats" | "no_license" | "user_not_found"
  }
}
```

---

## Admin API

All admin endpoints are prefixed with `/api/v1/admin` and require authentication.

### Authentication Endpoints

#### Register Tenant
```
POST /api/v1/admin/auth/register
Content-Type: application/json

{
  "name": "My Company",
  "email": "admin@company.com",
  "password": "secure-password",
  "website": "https://company.com"
}
```

#### Login
```
POST /api/v1/admin/auth/login
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "secure-password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tenant": { ... },
    "requiresVerification": false
  }
}
```

#### Get Current Tenant
```
GET /api/v1/admin/auth/me
Cookie: session=...
```

#### Send Verification Code
```
POST /api/v1/admin/auth/send-verification-code
Cookie: session=...
```

#### Verify Email
```
POST /api/v1/admin/auth/verify-email
Content-Type: application/json

{
  "code": "123456"
}
```

#### Logout
```
POST /api/v1/admin/auth/logout
Cookie: session=...
```

---

### Product Management

#### Create Product
```
POST /api/v1/admin/products
Cookie: session=...
Content-Type: application/json

{
  "name": "My SaaS App",
  "description": "Optional description"
}
```

#### Get All Products
```
GET /api/v1/admin/products
Cookie: session=...
```

#### Get Product
```
GET /api/v1/admin/products/:id
Cookie: session=...
```

---

### Plan Management

#### Create Plan
```
POST /api/v1/admin/plans
Cookie: session=...
Content-Type: application/json

{
  "productId": "product-uuid",
  "name": "Pro Plan",
  "description": "Optional description",
  "maxSeats": 5,              // Optional: max concurrent activations
  "expiresInDays": 365,       // Optional: license expiration in days
  "features": ["feature1", "feature2"]  // Optional: feature flags
}
```

#### Get All Plans
```
GET /api/v1/admin/plans?productId=uuid  // Optional filter
Cookie: session=...
```

#### Get Plan
```
GET /api/v1/admin/plans/:id
Cookie: session=...
```

---

### License Management

#### Create License
```
POST /api/v1/admin/licenses
Cookie: session=...
Content-Type: application/json

{
  "planId": "plan-uuid",
  "expiresInDays": 365  // Optional: override plan default
}
```

#### Get All Licenses
```
GET /api/v1/admin/licenses?planId=uuid  // Optional filter
Cookie: session=...
```

#### Get License Usage
```
GET /api/v1/admin/licenses/:id
Cookie: session=...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "license": { ... },
    "activations": [ ... ],
    "totalActivations": 5,
    "activeSeats": 3
  }
}
```

#### Update License Status
```
PATCH /api/v1/admin/licenses/:id/status
Cookie: session=...
Content-Type: application/json

{
  "status": "active" | "suspended" | "revoked" | "expired"
}
```

#### Assign License to User
```
POST /api/v1/admin/licenses/:id/assign
Cookie: session=...
Content-Type: application/json

{
  "userId": "user-uuid",
  "metadata": {}  // Optional
}
```

---

### User Management

#### Create User
```
POST /api/v1/admin/users
Cookie: session=...
Content-Type: application/json

{
  "externalId": "user_123",  // Required: Tenant's internal user ID
  "email": "user@example.com",  // Optional
  "name": "John Doe",  // Optional
  "metadata": {}  // Optional
}
```

#### Get All Users
```
GET /api/v1/admin/users?externalId=user_123  // Optional filter
Cookie: session=...
```

---

### API Key Management

#### Get All API Keys
```
GET /api/v1/admin/api-keys
Cookie: session=...
```

#### Create API Key
```
POST /api/v1/admin/api-keys
Cookie: session=...
Content-Type: application/json

{
  "name": "Production Key",  // Optional
  "expiresInDays": 365  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "apiKey": "sk_live_...",  // Store this securely! Only shown once.
    "apiKeyRecord": { ... }
  }
}
```

---

### Audit Logs

#### Get Audit Logs
```
GET /api/v1/admin/audit-logs?entityType=license&entityId=uuid
Cookie: session=...
```

Query parameters:
- `entityType` (optional): Filter by entity type (`tenant`, `api_key`, `user`, `license`, `product`, `plan`, `activation`)
- `entityId` (optional): Filter by specific entity ID

---

### Stripe Plan Mappings

#### Create Stripe Plan Mapping
```
POST /api/v1/admin/stripe-plan-mappings
Cookie: session=...
Content-Type: application/json

{
  "stripePriceId": "price_...",
  "name": "Pro Plan",
  "maxLicenses": 100,
  "description": "Optional description"
}
```

#### Get Stripe Plan Mapping
```
GET /api/v1/admin/stripe-plan-mappings/:priceId
Cookie: session=...
```

---

## Billing API

All billing endpoints are prefixed with `/api/v1/billing` and require session authentication.

### Create Checkout Session
```
POST /api/v1/billing/create-checkout-session
Cookie: session=...
Content-Type: application/json

{
  "priceId": "price_..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "clientSecret": "cs_...",
    "sessionId": "cs_..."
  }
}
```

### Get Subscription
```
GET /api/v1/billing/subscription
Cookie: session=...
```

### Cancel Subscription
```
POST /api/v1/billing/cancel-subscription
Cookie: session=...
Content-Type: application/json

{
  "subscriptionId": "sub_..."
}
```

### Stripe Webhook
```
POST /api/v1/billing/webhook
```

Handles Stripe webhook events for subscription updates.

---

## Database

### Schema Overview

The database uses Prisma ORM with PostgreSQL. Key models:

- **Tenant** - Businesses using the platform
- **TenantApiKey** - API keys for tenant authentication
- **TenantSession** - JWT sessions for dashboard access
- **Product** - Products belonging to tenants
- **Plan** - Subscription plans
- **License** - License instances
- **User** - End-users (identified by external ID)
- **UserLicense** - User-license assignments
- **Activation** - License activation tracking
- **AuditLog** - Operation audit logs
- **EmailVerificationCode** - Email verification codes
- **StripePlanMapping** - Stripe price to plan mappings
- **SubscriptionLicenseTracking** - Subscription license tracking

### Migrations

```bash
# Create a new migration
pnpm prisma:migrate

# Apply migrations (production)
pnpm prisma:migrate:deploy

# Generate Prisma client
pnpm prisma:generate

# Open Prisma Studio
pnpm prisma:studio
```

---

## Services

### License Service (`laas-license-service.ts`)

Core service for license validation and management:
- `validateUserLicense()` - Validates a user's license
- `assignLicenseToUser()` - Assigns a license to a user
- `updateLicenseStatus()` - Updates license status

### Subscription License Service (`subscription-license-service.ts`)

Manages licenses tied to Stripe subscriptions:
- Automatic license creation/revocation based on subscription status
- License count management based on subscription plan

### API Key Service (`api-key-service.ts`)

Handles API key generation and validation:
- Secure key generation with prefix (`sk_live_`, `sk_test_`)
- Key hashing and verification
- Key expiration management

### JWT Service (`jwt-service.ts`)

Manages JWT sessions for dashboard authentication:
- Session creation and validation
- Token hashing and storage
- Session revocation

### Password Service (`password-service.ts`)

Secure password handling:
- Argon2 password hashing
- Password verification

### Email Service (`email-service.ts`)

Email sending via Resend:
- Verification code emails
- Transactional emails

### Stripe Service (`stripe-service.ts`)

Stripe integration:
- Customer management
- Checkout session creation
- Subscription management
- Webhook handling

### Verification Code Service (`verification-code-service.ts`)

Email verification code management:
- Code generation and hashing
- Code verification
- Expiration handling

---

## Middleware

### Tenant Authentication (`tenant-auth.ts`)

Two authentication methods:

1. **API Key Authentication** (`authenticateTenant`)
   - Validates API key from `Authorization` header
   - Attaches tenant to request object

2. **Session Authentication** (`authenticateTenantSession`)
   - Validates JWT session from cookie
   - Attaches tenant to request object

### Admin Authentication (`admin-auth.ts`)

Validates admin API key from `ADMIN_API_KEY` environment variable.

### Rate Limiting (`rate-limit.ts`)

Per-tenant rate limiting:
- Configurable limits per tenant
- Rate limit headers in responses
- Redis-backed (with in-memory fallback)

### Caching (`cache.ts`)

Response caching middleware:
- Redis caching (with in-memory fallback)
- Cache invalidation by tags
- Configurable TTL

---

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | - | Yes |
| `PORT` | Server port | `3001` | No |
| `JWT_SECRET` | Secret for JWT signing | - | Yes (production) |
| `CORS_ORIGIN` | CORS allowed origin | `*` | No |
| `ADMIN_API_KEY` | Admin API key for platform operations | - | No |
| `REDIS_HOST` | Redis host | `localhost` | No |
| `REDIS_PORT` | Redis port | `6379` | No |
| `REDIS_PASSWORD` | Redis password | - | No |
| `CACHE_TTL` | Cache TTL in milliseconds | `300000` | No |
| `STRIPE_SECRET_KEY` | Stripe secret key | - | No |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | - | No |
| `RESEND_API_KEY` | Resend API key | - | No |
| `FROM_EMAIL` | From email address | - | No |

---

## Development

### Scripts

```bash
# Development
pnpm dev              # Start development server with hot reload

# Build
pnpm build            # Compile TypeScript

# Production
pnpm start            # Start production server

# Database
pnpm prisma:generate  # Generate Prisma client
pnpm prisma:migrate   # Run migrations
pnpm prisma:studio    # Open Prisma Studio
```

### Architecture

The server follows a layered architecture:

1. **HTTP Layer** (`index.ts`) - Fastify server setup, middleware registration
2. **Route Layer** (`routes/`) - HTTP request/response handling
3. **Service Layer** (`services/`) - Business logic
4. **Database Layer** (`db.ts`) - Prisma client wrapper

### Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message"
}
```

### Logging

The server uses Fastify's built-in logger. All requests and errors are logged automatically.

---

## Security

- **API Keys**: Hashed using secure hashing algorithm
- **Passwords**: Hashed using Argon2
- **JWT Tokens**: Signed with secret, stored as hashes
- **Rate Limiting**: Per-tenant rate limiting to prevent abuse
- **CORS**: Configurable CORS origins
- **Input Validation**: Request body validation
- **SQL Injection**: Protected by Prisma ORM

---

## License

MIT

