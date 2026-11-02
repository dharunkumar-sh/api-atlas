import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';

const { Pool } = pg;

async function runMigration() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.log('[Migrate] No DATABASE_URL found. Skipping DB migration.');
    return;
  }

  const pool = new Pool({ connectionString });

  try {
    console.log('[Migrate] Connecting to PostgreSQL database...');
    const client = await pool.connect();

    const sqlPath = path.join(process.cwd(), 'src', 'db', 'migrations', '0001_auth_tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    console.log('[Migrate] Applying authentication tables migration...');
    await client.query(sql);

    const projectSqlPath = path.join(process.cwd(), 'src', 'db', 'migrations', '0002_project_tables.sql');
    if (fs.existsSync(projectSqlPath)) {
      const projectSql = fs.readFileSync(projectSqlPath, 'utf-8');
      console.log('[Migrate] Applying project tables migration...');
      await client.query(projectSql);
    }

    const res = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public'"
    );
    console.log('[Migrate] Migration successfully applied! Public tables:', res.rows.map(r => r.table_name));

    client.release();
  } catch (err) {
    console.error('[Migrate] Migration failed:', err);
  } finally {
    await pool.end();
  }
}

runMigration();
