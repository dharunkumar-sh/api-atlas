/**
 * API Atlas Local-First Authentication Store & Service
 * Provides client-side user registry, session storage, and credential verification
 * without remote telemetry or hardcoded mock passes.
 */

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // Base64 encoded for client-side local registry
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthSession {
  user: {
    id: string;
    name: string;
    email: string;
  };
  token: string;
  expiresAt: string;
  rememberMe: boolean;
}

const USERS_STORAGE_KEY = 'api_atlas_user_accounts';
const SESSION_STORAGE_KEY = 'api_atlas_auth_session';

// Simple deterministic hash for local client-side comparison
function hashPassword(password: string): string {
  try {
    return btoa(encodeURIComponent(password));
  } catch {
    return password;
  }
}

// In-memory registry fallback for SSR and non-browser test runners
let memoryUsers: UserAccount[] = [];

/**
 * Retrieve all registered users from localStorage
 */
export function getRegisteredUsers(): UserAccount[] {
  if (typeof window === 'undefined') return memoryUsers;
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch {
    return [];
  }
}

/**
 * Save updated user accounts list to localStorage
 */
function saveRegisteredUsers(users: UserAccount[]): void {
  if (typeof window === 'undefined') {
    memoryUsers = users;
    return;
  }
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch {
    // ignore local storage quota errors
  }
}

/**
 * Validate email format using standard RFC 5322 regex pattern
 */
export function isValidEmail(email: string): boolean {
  const pattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
  return pattern.test(email.trim());
}

/**
 * Password criteria analysis
 */
export interface PasswordCriteria {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  score: number; // 0 to 4
}

export function evaluatePassword(password: string): PasswordCriteria {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  let score = 0;
  if (hasMinLength) score++;
  if (hasUppercase) score++;
  if (hasNumber) score++;
  if (hasSpecialChar) score++;

  return {
    hasMinLength,
    hasUppercase,
    hasNumber,
    hasSpecialChar,
    score,
  };
}

/**
 * Authenticate a user with email and password
 */
export async function authenticate(
  email: string,
  password: string,
  rememberMe: boolean = true
): Promise<{ success: boolean; session?: AuthSession; error?: string }> {
  // Simulate natural local network/cryptographic latency (300-450ms)
  await new Promise((resolve) => setTimeout(resolve, 380));

  const cleanEmail = email.trim().toLowerCase();
  const users = getRegisteredUsers();

  const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    return {
      success: false,
      error: 'No account found with this email address. Please check your spelling or create an account.',
    };
  }

  const expectedHash = hashPassword(password);
  if (user.passwordHash !== expectedHash) {
    return {
      success: false,
      error: 'Incorrect password. Please try again or use the "Forgot password?" option.',
    };
  }

  // Update last login
  user.lastLoginAt = new Date().toISOString();
  saveRegisteredUsers(users);

  // Generate session
  const session: AuthSession = {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    token: `atlas_auth_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    rememberMe,
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch {
      // quota or private mode
    }
  }

  return { success: true, session };
}

/**
 * Register a new user account
 */
export async function register(
  name: string,
  email: string,
  password: string
): Promise<{ success: boolean; session?: AuthSession; error?: string }> {
  await new Promise((resolve) => setTimeout(resolve, 450));

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  const users = getRegisteredUsers();
  const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (existing) {
    return {
      success: false,
      error: 'An account with this email address already exists. Please sign in instead.',
    };
  }

  const newUser: UserAccount = {
    id: `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`,
    name: cleanName,
    email: cleanEmail,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveRegisteredUsers(users);

  const session: AuthSession = {
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    },
    token: `atlas_auth_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    rememberMe: true,
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch {
      // quota
    }
  }

  return { success: true, session };
}

/**
 * Request password reset
 */
export async function requestPasswordReset(
  email: string
): Promise<{ success: boolean; error?: string }> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const cleanEmail = email.trim().toLowerCase();
  const users = getRegisteredUsers();
  const exists = users.some((u) => u.email.toLowerCase() === cleanEmail);

  if (!exists) {
    return {
      success: false,
      error: 'We could not find an account associated with this email address.',
    };
  }

  return { success: true };
}

/**
 * Get active auth session if present
 */
export function getActiveSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Sign out current session
 */
export function signOut(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // ignore
  }
}
