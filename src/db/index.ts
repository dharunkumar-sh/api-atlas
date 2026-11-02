import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';
import fs from 'node:fs';
import path from 'node:path';

const { Pool } = pg;

export * from './schema';

const DATABASE_URL = process.env.DATABASE_URL;

let pgPool: pg.Pool | null = null;
let drizzleDb: ReturnType<typeof drizzle> | null = null;

if (DATABASE_URL) {
  try {
    pgPool = new Pool({
      connectionString: DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
    });
    drizzleDb = drizzle(pgPool, { schema });
  } catch (err) {
    console.warn('[DB] Failed to initialize PostgreSQL pool from DATABASE_URL:', err);
  }
}

export const db = drizzleDb;

// Persistent local file store fallback for development when DATABASE_URL is not set
const DATA_DIR = process.env.API_ATLAS_DATA_DIR || path.join(process.cwd(), '.api-atlas');
const STORE_PATH = path.join(DATA_DIR, 'auth-store.json');

interface FileStore {
  users: schema.User[];
  sessions: schema.Session[];
  projects: any[];
}

function ensureFileStore(): FileStore {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORE_PATH)) {
      const initial: FileStore = { users: [], sessions: [], projects: [] };
      fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const data = fs.readFileSync(STORE_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    if (!parsed.projects) parsed.projects = [];
    return parsed;
  } catch {
    return { users: [], sessions: [], projects: [] };
  }
}

function saveFileStore(store: FileStore): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Failed to save local file store:', err);
  }
}

/**
 * Universal Repository Layer
 * Translates queries to Drizzle PostgreSQL when DATABASE_URL is available,
 * or persistent local store when working offline.
 */
export const userRepository = {
  async findByEmail(email: string): Promise<schema.User | null> {
    const cleanEmail = email.trim().toLowerCase();
    if (drizzleDb) {
      try {
        const { eq } = await import('drizzle-orm');
        const rows = await drizzleDb
          .select()
          .from(schema.user)
          .where(eq(schema.user.email, cleanEmail))
          .limit(1);
        return rows[0] || null;
      } catch (err) {
        console.warn('[DB] Postgres query failed, falling back to local store:', err);
      }
    }

    const store = ensureFileStore();
    return store.users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
  },

  async findById(id: string): Promise<schema.User | null> {
    if (drizzleDb) {
      try {
        const { eq } = await import('drizzle-orm');
        const rows = await drizzleDb
          .select()
          .from(schema.user)
          .where(eq(schema.user.id, id))
          .limit(1);
        return rows[0] || null;
      } catch (err) {
        console.warn('[DB] Postgres query failed, falling back to local store:', err);
      }
    }

    const store = ensureFileStore();
    return store.users.find((u) => u.id === id) || null;
  },

  async create(userData: schema.NewUser): Promise<schema.User> {
    const now = new Date();
    const newUser: schema.User = {
      id: userData.id,
      name: userData.name,
      email: userData.email.toLowerCase().trim(),
      emailVerified: userData.emailVerified ?? false,
      image: userData.image ?? null,
      passwordHash: userData.passwordHash ?? null,
      role: userData.role || 'user',
      authMethod: userData.authMethod || 'email',
      createdAt: userData.createdAt || now,
      updatedAt: userData.updatedAt || now,
    };

    if (drizzleDb) {
      try {
        const rows = await drizzleDb.insert(schema.user).values(newUser).returning();
        if (rows[0]) return rows[0];
      } catch (err) {
        console.warn('[DB] Postgres insert failed, falling back to local store:', err);
      }
    }

    const store = ensureFileStore();
    store.users.push(newUser);
    saveFileStore(store);
    return newUser;
  },

  async updateAuthMethod(userId: string, authMethod: string): Promise<void> {
    const now = new Date();
    if (drizzleDb) {
      try {
        const { eq } = await import('drizzle-orm');
        await drizzleDb
          .update(schema.user)
          .set({ authMethod, updatedAt: now })
          .where(eq(schema.user.id, userId));
      } catch (err) {
        console.warn('[DB] Postgres updateAuthMethod failed, updating local store:', err);
      }
    }

    const store = ensureFileStore();
    const userItem = store.users.find((u) => u.id === userId);
    if (userItem) {
      userItem.authMethod = authMethod;
      userItem.updatedAt = now;
      saveFileStore(store);
    }
  },

  async count(): Promise<number> {
    if (drizzleDb) {
      try {
        const { count } = await import('drizzle-orm');
        const rows = await drizzleDb.select({ count: count() }).from(schema.user);
        return Number(rows[0]?.count || 0);
      } catch {
        // fallback
      }
    }
    return ensureFileStore().users.length;
  },
};

export const sessionRepository = {
  async findById(id: string): Promise<schema.Session | null> {
    if (drizzleDb) {
      try {
        const { eq } = await import('drizzle-orm');
        const rows = await drizzleDb
          .select()
          .from(schema.session)
          .where(eq(schema.session.id, id))
          .limit(1);
        return rows[0] || null;
      } catch (err) {
        console.warn('[DB] Postgres query failed, falling back to local store:', err);
      }
    }

    const store = ensureFileStore();
    return store.sessions.find((s) => s.id === id) || null;
  },

  async create(sessionData: schema.NewSession): Promise<schema.Session> {
    const now = new Date();
    const newSession: schema.Session = {
      id: sessionData.id,
      userId: sessionData.userId,
      token: sessionData.token || sessionData.id,
      expiresAt: sessionData.expiresAt,
      ipAddress: sessionData.ipAddress || null,
      userAgent: sessionData.userAgent || null,
      createdAt: sessionData.createdAt || now,
      updatedAt: sessionData.updatedAt || now,
    };

    if (drizzleDb) {
      try {
        const rows = await drizzleDb.insert(schema.session).values(newSession).returning();
        if (rows[0]) return rows[0];
      } catch (err) {
        console.warn('[DB] Postgres insert failed, falling back to local store:', err);
      }
    }

    const store = ensureFileStore();
    store.sessions.push(newSession);
    saveFileStore(store);
    return newSession;
  },

  async deleteById(id: string): Promise<void> {
    if (drizzleDb) {
      try {
        const { eq } = await import('drizzle-orm');
        await drizzleDb.delete(schema.session).where(eq(schema.session.id, id));
      } catch (err) {
        console.warn('[DB] Postgres delete failed, falling back to local store:', err);
      }
    }

    const store = ensureFileStore();
    store.sessions = store.sessions.filter((s) => s.id !== id);
    saveFileStore(store);
  },

  async deleteExpired(): Promise<void> {
    const now = new Date();
    if (drizzleDb) {
      try {
        const { lt } = await import('drizzle-orm');
        await drizzleDb.delete(schema.session).where(lt(schema.session.expiresAt, now));
      } catch (err) {
        console.warn('[DB] Postgres deleteExpired failed:', err);
      }
    }

    const store = ensureFileStore();
    store.sessions = store.sessions.filter((s) => new Date(s.expiresAt) > now);
    saveFileStore(store);
  },
};

import type { ApiProject } from '@/types';

function toApiProject(row: any): ApiProject {
  let tags: string[] = [];
  if (Array.isArray(row.tags)) {
    tags = row.tags;
  } else if (typeof row.tags === 'string') {
    try {
      const parsed = JSON.parse(row.tags);
      if (Array.isArray(parsed)) tags = parsed;
    } catch {
      tags = [];
    }
  }

  let parsedSpec = undefined;
  if (row.parsedSpec) {
    if (typeof row.parsedSpec === 'string') {
      try {
        parsedSpec = JSON.parse(row.parsedSpec);
      } catch {
        parsedSpec = undefined;
      }
    } else if (typeof row.parsedSpec === 'object') {
      parsedSpec = row.parsedSpec;
    }
  }

  return {
    id: String(row.id),
    name: String(row.name),
    description: row.description || '',
    version: row.version || '1.0.0',
    specType: (row.specType || 'unknown') as ApiProject['specType'],
    specFormat: (row.specFormat === 'yaml' ? 'yaml' : 'json') as 'json' | 'yaml',
    endpointsCount: typeof row.endpointsCount === 'number' ? row.endpointsCount : parseInt(String(row.endpointsCount || 0), 10),
    serversCount: typeof row.serversCount === 'number' ? row.serversCount : parseInt(String(row.serversCount || 0), 10),
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt || new Date().toISOString()),
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt || new Date().toISOString()),
    tags,
    rawSpec: row.rawSpec || '',
    parsedSpec,
  };
}

export const projectRepository = {
  async list(): Promise<ApiProject[]> {
    if (drizzleDb) {
      try {
        const { desc } = await import('drizzle-orm');
        const rows = await drizzleDb
          .select()
          .from(schema.project)
          .orderBy(desc(schema.project.updatedAt));
        return rows.map(toApiProject);
      } catch (err) {
        console.warn('[DB] Postgres project list failed, falling back to local store:', err);
      }
    }
    const store = ensureFileStore();
    return (store.projects || []).map(toApiProject).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },

  async findById(id: string): Promise<ApiProject | null> {
    if (drizzleDb) {
      try {
        const { eq } = await import('drizzle-orm');
        const rows = await drizzleDb
          .select()
          .from(schema.project)
          .where(eq(schema.project.id, id))
          .limit(1);
        return rows[0] ? toApiProject(rows[0]) : null;
      } catch (err) {
        console.warn('[DB] Postgres project findById failed, falling back to local store:', err);
      }
    }
    const store = ensureFileStore();
    const row = store.projects?.find((p: any) => p.id === id);
    return row ? toApiProject(row) : null;
  },

  async create(projectData: ApiProject, userId?: string): Promise<ApiProject> {
    const now = new Date();
    const dbPayload = {
      id: projectData.id,
      userId: userId || null,
      name: projectData.name,
      description: projectData.description || '',
      version: projectData.version,
      specType: projectData.specType,
      specFormat: projectData.specFormat,
      endpointsCount: String(projectData.endpointsCount ?? 0),
      serversCount: String(projectData.serversCount ?? 0),
      tags: JSON.stringify(projectData.tags || []),
      rawSpec: projectData.rawSpec || '',
      parsedSpec: projectData.parsedSpec ? JSON.stringify(projectData.parsedSpec) : null,
      createdAt: projectData.createdAt ? new Date(projectData.createdAt) : now,
      updatedAt: projectData.updatedAt ? new Date(projectData.updatedAt) : now,
    };

    if (drizzleDb) {
      try {
        const rows = await drizzleDb.insert(schema.project).values(dbPayload).returning();
        if (rows[0]) return toApiProject(rows[0]);
      } catch (err) {
        console.warn('[DB] Postgres project insert failed, falling back to local store:', err);
      }
    }

    const store = ensureFileStore();
    store.projects.push(dbPayload);
    saveFileStore(store);
    return toApiProject(dbPayload);
  },

  async deleteById(id: string): Promise<boolean> {
    if (drizzleDb) {
      try {
        const { eq } = await import('drizzle-orm');
        await drizzleDb.delete(schema.project).where(eq(schema.project.id, id));
        return true;
      } catch (err) {
        console.warn('[DB] Postgres project delete failed, falling back to local store:', err);
      }
    }
    const store = ensureFileStore();
    const initialLen = store.projects.length;
    store.projects = store.projects.filter((p: any) => p.id !== id);
    saveFileStore(store);
    return store.projects.length < initialLen;
  },

  async count(): Promise<number> {
    if (drizzleDb) {
      try {
        const { count } = await import('drizzle-orm');
        const rows = await drizzleDb.select({ count: count() }).from(schema.project);
        return Number(rows[0]?.count || 0);
      } catch {
        // fallback
      }
    }
    return ensureFileStore().projects?.length || 0;
  },
};
