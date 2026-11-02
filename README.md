# API Atlas 🧭

> Production-oriented Visual API Explorer for OpenAPI & REST contracts.

API Atlas is a fast, privacy-first developer workspace for inspecting, visualizing, and testing OpenAPI (3.0 and 3.1) and Swagger 2.0 specifications. Built with **Astro (Node SSR)**, **React Islands**, **strict TypeScript**, and **Tailwind CSS**.

---

## 🏗️ Architecture & Philosophy

API Atlas employs a modular Astro-first architecture designed for fast loads and interactive capabilities:

```
src/
├── config/              # Typed configuration module & Zod environment validation
│   ├── env.ts           # Strict environment variable parser and fallback defaults
│   └── index.ts         # Centralized application constants & metadata
├── types/               # Shared TypeScript data models
│   ├── openapi.ts       # Parsed OpenAPI spec, endpoints, parameters, responses
│   ├── project.ts       # Project metadata, filters, and import inputs
│   ├── ui.ts            # Component variants, badges, tabs, and toast types
│   └── index.ts         # Shared type exports
├── schemas/             # Zod validation schemas
│   ├── project.ts       # Project creation and update schemas
│   ├── openapi.ts       # Specification validation schemas
│   ├── settings.ts      # Workspace settings schema
│   └── index.ts         # Schema barrel export
├── utils/               # Utilities & Helpers
│   ├── cn.ts            # Tailwind class merger (clsx + tailwind-merge)
│   ├── formatters.ts    # HTTP method badges, date and byte formatters
│   └── openapi/         # OpenAPI parsing & validation engine
│       ├── parser.ts    # Format detector, YAML/JSON parser, endpoint extractor
│       ├── validator.ts # Semantic OpenAPI validator (missing path params, etc.)
│       └── index.ts     # OpenAPI utility barrel
├── services/            # Server-side domain services
│   ├── projectService.ts # API project store and filtering service
│   ├── healthService.ts  # Runtime telemetry, memory, and engine health
│   └── index.ts         # Service exports
├── components/
│   ├── ui/              # Reusable design tokens & primitives
│   │   ├── Button.tsx   # Variants: primary, secondary, outline, ghost, danger, success
│   │   ├── Input.tsx    # Text inputs & Textarea with label, error, helper states
│   │   ├── Badge.tsx    # Color-coded badges & HTTP method pills (GET, POST, etc.)
│   │   ├── Card.tsx     # Card, CardHeader, CardTitle, CardDescription, CardContent
│   │   ├── Dialog.tsx   # Accessible modal with backdrop blur & ESC handler
│   │   ├── Tabs.tsx     # Keyboard-accessible tabs with active indicator & badges
│   │   ├── Toast.tsx    # Event-driven toast notification system & viewport
│   │   └── EmptyState.tsx # Realistic empty states with icon, description, and actions
│   ├── layout/          # Application shell primitives
│   │   ├── Navbar.tsx   # Top navigation, status indicator, spec importer trigger
│   │   └── Sidebar.tsx  # Navigation links, workspace selector, system diagnostics
│   ├── workspace/       # Interactive workspace React components
│   │   ├── WorkspaceExplorer.tsx # Split-pane endpoint inspector & cURL generator
│   │   └── ImportSpecModal.tsx   # Specification importer with live validator
│   ├── dashboard/       # Dashboard components
│   │   └── ProjectList.tsx       # Searchable project grid with realistic empty states
│   └── settings/        # Settings components
│       └── SettingsForm.tsx      # User preference form & telemetry stats
├── layouts/
│   ├── Layout.astro     # Root HTML document, SEO tags, dark theme tokens
│   └── AppShell.astro   # Standard workspace shell (Navbar, Sidebar, ToastContainer)
└── pages/
    ├── index.astro      # Modern landing page & feature overview
    ├── dashboard.astro  # API Project registry & stats overview
    ├── workspace/
    │   ├── index.astro  # Workspace explorer (empty state prompt)
    │   └── [id].astro   # Dynamic project workspace route
    ├── settings.astro   # User preferences & engine diagnostics
    └── api/             # Server API routes (Astro Node SSR)
        ├── health.ts    # GET /api/health - Engine diagnostic telemetry
        ├── openapi/
        │   └── validate.ts # POST /api/openapi/validate - Live spec validation
        └── projects/
            ├── index.ts # GET & POST /api/projects - Project CRUD
            └── [id].ts  # GET & DELETE /api/projects/[id]
```

---

## 🚀 Quick Start

### 1. Requirements

- Node.js `>= 22.22.0`
- npm `>= 10.0.0`

### 2. Installation

```bash
npm install
```

### 3. Environment Setup (Optional)

Copy the default environment configuration:

```bash
cp .env.example .env
```

Default configuration values:

```env
PORT=4321
HOST=localhost
NODE_ENV=development
PUBLIC_APP_NAME="API Atlas"
PUBLIC_APP_DESCRIPTION="Production Visual API Explorer"
API_ATLAS_DATA_DIR="./.api-atlas"
MAX_SPEC_SIZE_MB=10
ENABLE_MOCK_SERVER=true
```

### 4. Running the Development Server

Per the project guidelines, run the dev server in the background:

```bash
astro dev --background
```

Or use the standard npm script:

```bash
npm run dev
```

Open [http://localhost:4321](http://localhost:4321) in your browser.

---

## 📋 Available Routes

| Route                   | Description                                                       |
| :---------------------- | :---------------------------------------------------------------- |
| `/`                     | Landing page showcasing API Atlas features and value proposition  |
| `/dashboard`            | Dashboard listing registered API projects with search and filters |
| `/workspace`            | Default workspace explorer view with realistic empty state        |
| `/workspace/[id]`       | Dynamic interactive visual explorer for a specific API project    |
| `/settings`             | Workspace preferences, theme selection, and runtime telemetry     |
| `/api/health`           | Diagnostic health endpoint returning uptime, memory, and status   |
| `/api/projects`         | REST endpoints for listing and creating API projects              |
| `/api/projects/[id]`    | REST endpoints for inspecting and deleting API projects           |
| `/api/openapi/validate` | Endpoint for validating and extracting OpenAPI specifications     |

---

## 🛠️ NPM Scripts

| Script                 | Purpose                                                  |
| :--------------------- | :------------------------------------------------------- |
| `npm run dev`          | Starts the Astro development server                      |
| `npm run build`        | Builds the production server bundle with `@astrojs/node` |
| `npm run preview`      | Previews the production build locally                    |
| `npm run typecheck`    | Runs `tsc --noEmit` with strict TypeScript checks        |
| `npm run check`        | Runs `astro check` on all Astro components and pages     |
| `npm run test`         | Runs the Vitest test suite                               |
| `npm run test:watch`   | Runs Vitest in watch mode                                |
| `npm run lint`         | Runs ESLint (flat config)                                |
| `npm run format`       | Formats all files using Prettier                         |
| `npm run format:check` | Validates formatting consistency                         |

---

## 🧪 Testing

Run unit tests covering the OpenAPI parser, format detection, validator, and UI helpers:

```bash
npm test
```

---

## 🛡️ Production Build

Create an optimized standalone Node.js production build:

```bash
npm run build
```

Run the built application:

```bash
node dist/server/entry.mjs
```

Or:

```bash
npm run preview
```
