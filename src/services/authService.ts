import { z } from 'zod';
import { userRepository, sessionRepository, type User, type Session } from '@/db';
import { hashPassword, verifyPassword, generateSessionToken } from '@/lib/auth/crypto';
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from '@/lib/auth/rateLimiter';

// Validation Schemas
export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name cannot exceed 100 characters'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Invalid email address')
    .max(255, 'Email cannot exceed 255 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password cannot exceed 128 characters'),
});

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type SignInInput = z.infer<typeof signInSchema>;

export interface AuthResult {
  success: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    authMethod?: string | null;
  };
  session?: {
    id: string;
    expiresAt: Date;
  };
  error?: string;
  statusCode?: number;
}

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

class AuthService {
  /**
   * Register a new user with scrypt-hashed password
   */
  async register(
    input: RegisterInput,
    context?: { ip?: string; userAgent?: string }
  ): Promise<AuthResult> {
    const parseResult = registerSchema.safeParse(input);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || 'Invalid registration input';
      return {
        success: false,
        error: firstError,
        statusCode: 400,
      };
    }

    const { name, email, password } = parseResult.data;

    // Check for existing duplicate user
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      return {
        success: false,
        error: 'An account with this email address already exists. Please sign in.',
        statusCode: 409,
      };
    }

    // Hash password using OWASP-recommended scrypt
    const passwordHash = await hashPassword(password);
    const userId = `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;

    const user = await userRepository.create({
      id: userId,
      name,
      email,
      emailVerified: false,
      image: null,
      passwordHash,
      role: 'user',
      authMethod: 'email',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create session
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

    const session = await sessionRepository.create({
      id: sessionToken,
      userId: user.id,
      token: sessionToken,
      expiresAt,
      ipAddress: context?.ip,
      userAgent: context?.userAgent,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        authMethod: user.authMethod,
      },
      session: {
        id: session.id,
        expiresAt: session.expiresAt,
      },
    };
  }

  /**
   * Authenticate email and password with rate-limiting and timing-safe checks
   */
  async signIn(
    input: SignInInput & { clientIp?: string },
    context?: { ip?: string; userAgent?: string }
  ): Promise<AuthResult> {
    const parseResult = signInSchema.safeParse(input);
    if (!parseResult.success) {
      return {
        success: false,
        error: 'Please provide a valid email and password.',
        statusCode: 400,
      };
    }

    const { email, password } = parseResult.data;
    const rateLimitKey = `${input.clientIp || context?.ip || 'global'}_${email}`;

    // Rate Limiting Check
    const rateLimit = checkRateLimit(rateLimitKey);
    if (!rateLimit.allowed) {
      return {
        success: false,
        error: `Too many sign-in attempts. Please try again in ${rateLimit.resetSeconds} seconds.`,
        statusCode: 429,
      };
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      recordFailedAttempt(rateLimitKey);
      return {
        success: false,
        error: 'Invalid email or password.',
        statusCode: 401,
      };
    }

    if (!user.passwordHash) {
      return {
        success: false,
        error: 'This account was registered via OAuth (Google or GitHub). Please sign in using your OAuth provider.',
        statusCode: 400,
      };
    }

    const passwordMatches = await verifyPassword(password, user.passwordHash);
    if (!passwordMatches) {
      recordFailedAttempt(rateLimitKey);
      return {
        success: false,
        error: 'Invalid email or password.',
        statusCode: 401,
      };
    }

    // Reset rate limit on success
    resetRateLimit(rateLimitKey);

    // Ensure authMethod is recorded on sign-in
    await userRepository.updateAuthMethod(user.id, 'email');

    // Create session
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

    const session = await sessionRepository.create({
      id: sessionToken,
      userId: user.id,
      token: sessionToken,
      expiresAt,
      ipAddress: context?.ip,
      userAgent: context?.userAgent,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        authMethod: user.authMethod || 'email',
      },
      session: {
        id: session.id,
        expiresAt: session.expiresAt,
      },
    };
  }

  /**
   * Terminate active session
   */
  async signOut(sessionId: string): Promise<void> {
    if (!sessionId) return;
    await sessionRepository.deleteById(sessionId);
  }

  /**
   * Validate server-side session token
   */
  async validateSession(
    sessionId: string
  ): Promise<{ user: Omit<User, 'passwordHash'>; session: Session } | null> {
    if (!sessionId) return null;

    const session = await sessionRepository.findById(sessionId);
    if (!session) return null;

    const now = new Date();
    if (new Date(session.expiresAt) <= now) {
      await sessionRepository.deleteById(sessionId);
      return null;
    }

    const user = await userRepository.findById(session.userId);
    if (!user) {
      await sessionRepository.deleteById(sessionId);
      return null;
    }

    const { passwordHash: _, ...safeUser } = user;
    return {
      user: safeUser,
      session,
    };
  }
}

export const authService = new AuthService();
