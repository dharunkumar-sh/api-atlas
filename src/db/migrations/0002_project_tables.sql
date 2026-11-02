-- API Atlas Project Registry Migration
CREATE TABLE IF NOT EXISTS "project" (
  "id" TEXT PRIMARY KEY,
  "user_id" TEXT REFERENCES "user"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "description" TEXT DEFAULT '',
  "version" TEXT NOT NULL DEFAULT '1.0.0',
  "spec_type" TEXT NOT NULL DEFAULT 'unknown',
  "spec_format" TEXT NOT NULL DEFAULT 'json',
  "endpoints_count" TEXT NOT NULL DEFAULT '0',
  "servers_count" TEXT NOT NULL DEFAULT '0',
  "tags" TEXT NOT NULL DEFAULT '[]',
  "raw_spec" TEXT,
  "parsed_spec" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "project_user_id_idx" ON "project" ("user_id");
CREATE INDEX IF NOT EXISTS "project_updated_at_idx" ON "project" ("updated_at" DESC);

