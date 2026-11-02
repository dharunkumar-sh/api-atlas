# API Atlas OAuth Integration Guide (Google & GitHub)

This guide provides instructions for configuring **Google** and **GitHub** OAuth providers in API Atlas using **Better Auth**, **Astro SSR**, and **Drizzle ORM**.

---

## Architecture Overview

```mermaid
sequenceDiagram
    autonumber
    actor User as Developer / User
    participant Browser as Browser Client
    participant Popover as AuthPopover (React)
    participant Server as Better Auth Backend (/api/auth)
    participant Provider as OAuth Provider (Google / GitHub)
    participant DB as PostgreSQL (Drizzle ORM)

    User->>Popover: Clicks "Continue with GitHub" or "Google"
    Popover->>Server: POST /api/auth/sign-in/social { provider: "github", callbackURL: "/dashboard" }
    Server->>Server: Generate PKCE code_challenge & signed state cookie
    Server-->>Popover: Return { url: "https://provider.com/oauth/authorize?...", redirect: true }
    Popover->>Provider: Redirects browser to OAuth consent screen
    User->>Provider: Consents and grants account access
    Provider->>Server: Redirects to /api/auth/callback/[provider]?code=...&state=...
    Server->>Provider: Exchanges authorization code for access & ID tokens
    Server->>DB: Finds or creates user, links account, stores session
    Server-->>Browser: Sets secure HTTP-only session cookie & redirects to /dashboard
    Browser->>Server: Navigates to /dashboard (Middleware verifies session)
    Server-->>Browser: Renders authenticated Dashboard with user profile
```

> [!IMPORTANT]
> **Authentication is never simulated.** The backend does not issue sessions or report successful authentication until the OAuth provider flow has completed and the callback code has been exchanged and verified.

---

## Authorized Callback URLs

Configure the exact callback URLs in your provider dashboards based on your application origin:

| Environment | Application Origin | GitHub Callback URL | Google Redirect URI |
| :--- | :--- | :--- | :--- |
| **Local Development** | `http://localhost:4321` | `http://localhost:4321/api/auth/callback/github` | `http://localhost:4321/api/auth/callback/google` |
| **Production** | `https://your-domain.com` | `https://your-domain.com/api/auth/callback/github` | `https://your-domain.com/api/auth/callback/google` |

---

## 1. Setting Up GitHub OAuth Credentials

### Step 1: Open Developer Settings
1. Log in to [GitHub](https://github.com).
2. Click your profile avatar in the upper-right corner and select **Settings**.
3. In the left sidebar, scroll down and click **Developer settings**.
4. In the left sidebar, select **OAuth Apps**, then click **New OAuth App** (or **Register a new application**).

### Step 2: Register Application
Fill in the form details:
- **Application name**: `API Atlas` (or `API Atlas Dev`)
- **Homepage URL**:
  - Development: `http://localhost:4321`
  - Production: `https://your-domain.com`
- **Application description**: `Production Visual API Explorer & Contract Workspace`
- **Authorization callback URL**:
  - Development: `http://localhost:4321/api/auth/callback/github`
  - Production: `https://your-domain.com/api/auth/callback/github`

### Step 3: Generate Client Secret
1. Click **Register application**.
2. Copy the **Client ID** displayed on the screen.
3. Under **Client secrets**, click **Generate a new client secret**.
4. Copy the newly generated **Client Secret** immediately (it will not be shown again).

### Step 4: Add to `.env`
Add the values to your `.env` file:
```bash
GITHUB_CLIENT_ID="<your_github_client_id>"
GITHUB_CLIENT_SECRET="<your_github_client_secret>"
```

---

## 2. Setting Up Google OAuth Credentials

### Step 1: Create a Google Cloud Project
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown at the top and select **New Project**.
3. Enter Project Name (e.g., `API-Atlas-Production`) and click **Create**.

### Step 2: Configure OAuth Consent Screen
1. In the left navigation menu, go to **APIs & Services** > **OAuth consent screen**.
2. Choose User Type:
   - **External**: Available to any Google account user.
   - **Internal**: Restricted to users within your Google Workspace organization.
3. Click **Create**.
4. Fill in:
   - **App name**: `API Atlas`
   - **User support email**: Your support or administrator email.
   - **Developer contact information**: Your email address.
5. Click **Save and Continue**.
6. On the **Scopes** page, click **Add or Remove Scopes** and select:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`
7. Click **Save and Continue**, then finish the setup.

### Step 3: Create OAuth 2.0 Credentials
1. In the left menu, select **APIs & Services** > **Credentials**.
2. Click **Create Credentials** at the top and choose **OAuth client ID**.
3. Under **Application type**, select **Web application**.
4. Set **Name**: `API Atlas Web Client`.
5. Under **Authorized JavaScript origins**, click **+ Add URI**:
   - Development: `http://localhost:4321`
   - Production: `https://your-domain.com`
6. Under **Authorized redirect URIs**, click **+ Add URI**:
   - Development: `http://localhost:4321/api/auth/callback/google`
   - Production: `https://your-domain.com/api/auth/callback/google`
7. Click **Create**.
8. A modal will display your **Client ID** and **Client Secret**.

### Step 4: Add to `.env`
Add the values to your `.env` file:
```bash
GOOGLE_CLIENT_ID="<your_google_client_id>.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="<your_google_client_secret>"
```

---

## 3. Server Configuration & Environment Checklist

Ensure your server-side environment contains:

```bash
# Better Auth Configuration
BETTER_AUTH_URL="http://localhost:4321"
BETTER_AUTH_SECRET="<random_32_byte_secret>"

# PostgreSQL with Drizzle ORM
DATABASE_URL="postgresql://postgres:password@localhost:5432/api_atlas"

# GitHub OAuth
GITHUB_CLIENT_ID="<your_github_client_id>"
GITHUB_CLIENT_SECRET="<your_github_client_secret>"

# Google OAuth
GOOGLE_CLIENT_ID="<your_google_client_id>"
GOOGLE_CLIENT_SECRET="<your_google_client_secret>"
```

> [!CAUTION]
> - Never commit `.env` or any file containing real credentials to version control.
> - `.gitignore` is configured to exclude `.env`, `.env.local`, and `.env.production`.
> - Keep secrets strictly on the server side. Never prefix secrets with `PUBLIC_`.

---

## 4. Account Linking & Security Behavior

- **Automatic Account Linking**: When a user registers with email/password and later signs in with Google or GitHub using the exact same verified email address, Better Auth links the accounts under the same primary user identity.
- **Provider Status Diagnostics**: If a user clicks an OAuth button before server credentials have been provided, API Atlas catches the condition and displays an informative configuration notice rather than failing silently or issuing an invalid session.
- **Session Verification**: The Astro server middleware (`src/middleware.ts`) validates sessions on every incoming request. Protected pages (`/dashboard`, `/settings`) redirect unauthenticated requests directly to `/?auth=signin`.
