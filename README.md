# EduPulse AI - Database & Migrations

This folder contains the complete database setup for **EduPulse AI** on **Supabase Cloud PostgreSQL**.

## Structure

```
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql    # Complete tables, enums, triggers, RLS, & seed data
├── scripts/
│   ├── migrate.js                    # Automated migration runner script
│   └── verify-db.js                  # Database health & table verification utility
├── .env.example                      # Environment variables template
└── package.json                      # Migration runner dependencies (pg, @supabase/supabase-js, dotenv)
```

## How to Apply Migrations to Supabase

### Option 1: Automated Node.js Migration Runner (Recommended)

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. In your `.env` file, set your Supabase database connection string:
   ```env
   DATABASE_URL=postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
   > **Tip:** In the Supabase Dashboard, go to **Project Settings** -> **Database** -> **Connection string** -> Select **URI** (Mode: Session or Transaction Pooler).

3. Run the migration:
   ```bash
   npm run migrate
   ```

4. Verify your tables:
   ```bash
   npm run migrate:check
   ```

---

### Option 2: Direct Supabase SQL Editor (No CLI / Connection String Needed)

1. Open your project on [Supabase Dashboard](https://supabase.com/dashboard).
2. Click on the **SQL Editor** tab on the left navigation bar.
3. Click **+ New Query**.
4. Copy the entire contents of [001_initial_schema.sql](./supabase/migrations/001_initial_schema.sql).
5. Paste it into the query editor and click **Run**.
6. All 16 tables, custom types, triggers, RLS policies, and seed data will be created immediately!
