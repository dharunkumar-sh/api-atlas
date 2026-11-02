# API Atlas Authentication Architecture & Security Guide

## Overview

API Atlas features a full-stack, server-side authentication engine tailored for Astro SSR (`output: 'server'` with `@astrojs/node` standalone). It provides secure user registration, email/password sign-in, session management, server-side route guards, rate limiting, and persistent storage via PostgreSQL and Drizzle ORM.

---

## Architecture Diagram

```mermaid
graph TD
    Client[Browser Client / UI Islands]
    AuthPopover[AuthPopover / SignInForm / SignUpForm]
    UserMenu[UserMenu Component]
    Middleware[Astro Middleware (src/middleware.ts)]
    AuthAPI[API Endpoints (/api/auth/*)]
    AuthService[Auth Service (src/services/authService.ts)]
    Crypto[Crypto Engine: scrypt + timingSafeEqual]
    RateLimiter[Rate Limiter: Sliding Window]
    DB[Drizzle ORM & PostgreSQL Database]

    Client --> AuthPopover
    Client --> UserMenu
    AuthPopover -->|POST credentials| AuthAPI
    UserMenu -->|GET session / POST sign-out| AuthAPI
    AuthAPI --> AuthService
    Middleware -->|Validate atlas_session cookie| AuthService
    AuthService --> Crypto
    AuthService --> RateLimiter
    AuthService --> DB
```

---

## Core Security Features

### 1. Password Hashing (OWASP-Compliant)
- **Algorithm**: `scrypt` via Node.js native `crypto.scrypt`
- **Parameters**: `N=16384, r=8, p=1`, 64-byte key length.
- **Salt**: 16 cryptographically secure random bytes generated per hash (`crypto.randomBytes(16)`).
- **Format**: `scrypt$v1$[salt_hex]$[key_hex]`. Plaintext passwords are never stored in memory or persistence.
- **Verification**: Timing-safe equality checks (`crypto.timingSafeEqual`) prevent timing side-channel analysis.

### 2. Session Management & Cookies
- **Cookie Name**: `atlas_session`
- **Cookie Settings**:
  - `httpOnly: true` (prevents JavaScript/XSS extraction)
  - `sameSite: 'lax'` (protects against CSRF)
  - `secure: import.meta.env.PROD` (enforces HTTPS in production)
  - `path: '/'`
  - `maxAge: 7 * 24 * 60 * 60` (7 days duration)
- **Session Tokens**: 32 cryptographically secure random bytes in hex (`crypto.randomBytes(32)`).

### 3. Server-Side Validation & Input Sanitization
- All registration and sign-in payloads are parsed and validated on the server using **Zod** schemas.
- Invalid emails, short passwords (<8 characters), or empty fields are rejected immediately with clean, non-sensitive error messages.
- Duplicate email registrations are handled gracefully with a standard, non-sensitive conflict notice.

### 4. Brute-Force Rate Limiting
- **Location**: `src/lib/auth/rateLimiter.ts`
- **Threshold**: Maximum 5 failed attempts per IP address within a 15-minute sliding window.
- **Lockout**: Exceeding the threshold locks out subsequent attempts and returns HTTP 429 with `Retry-After` headers and remaining lockout seconds.
- Successful authentication resets the failed attempts counter.

### 5. Server-Side Route & API Protection
- **Middleware**: `src/middleware.ts` executes on every request:
  - Validates `atlas_session` cookie against the database/store.
  - Automatically populates `Astro.locals.user` and `Astro.locals.session`.
  - **Protected Web Routes**: `/dashboard` and `/settings` require active authentication. Unauthenticated requests are redirected with a 302 to `/?auth=signin&redirect=[path]`.
  - **Protected API Mutations**: Mutating project endpoints (`POST`, `PUT`, `DELETE` under `/api/projects/*`) require active authentication; unauthenticated callers receive HTTP 401 Unauthorized.

---

## Persistent Storage: Drizzle ORM + PostgreSQL

### Schema Definition (`src/db/schema.ts`)
- **`users` Table**:
  - `id`: UUID primary key
  - `email`: Varchar(255) unique, indexed
  - `name`: Varchar(100)
  - `password_hash`: Text (scrypt hash string)
  - `role`: Varchar(20) default `'developer'`
  - `created_at`: Timestamp
  - `updated_at`: Timestamp
- **`sessions` Table**:
  - `id`: Varchar(128) primary key (session token)
  - `user_id`: UUID foreign key references `users(id)`
  - `expires_at`: Timestamp
  - `created_at`: Timestamp
  - `user_agent`: Text
  - `ip_address`: Varchar(45)

### Universal Persistence Adapter (`src/db/index.ts`)
- When `DATABASE_URL` is set, API Atlas connects via node-postgres pool to PostgreSQL using Drizzle ORM.
- For local development environments where PostgreSQL service is not yet provisioned, a resilient JSON file store (`.api-atlas/auth-store.json`) automatically provides instant offline persistence with the exact same security and cryptographic guarantees.

---

## Configuration & Environment Variables

Create or update `.env` in the project root:

```bash
# PostgreSQL Connection (Drizzle ORM)
DATABASE_URL="postgresql://postgres:password@localhost:5432/api_atlas"

# Session & Crypto Secret
AUTH_SECRET="your-32-byte-hex-or-base64-random-secret"

# Session Duration
SESSION_COOKIE_NAME="atlas_session"
SESSION_EXPIRATION_DAYS=7

# Rate Limiting
AUTH_RATE_LIMIT_MAX_ATTEMPTS=5
AUTH_RATE_LIMIT_WINDOW_MINUTES=15
```

---

## OAuth Providers Notice

GitHub and Google sign-in buttons inside `AuthPopover` and `login.astro` are explicitly labeled as **Integration Placeholders**. They do not simulate fake OAuth handshakes and will instruct developers to configure credentials and redirect URIs in production:

```bash
GITHUB_CLIENT_ID="your_client_id"
GITHUB_CLIENT_SECRET="your_client_secret"
GITHUB_CALLBACK_URL="https://your-domain.com/api/auth/callback/github"
```
