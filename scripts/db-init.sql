-- Local-dev Postgres bootstrap.
-- Runs once on first container start (Postgres official image runs every
-- *.sql in /docker-entrypoint-initdb.d/ in alphabetical order, against the
-- POSTGRES_DB database). Idempotent so it is also safe to re-run manually.
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
