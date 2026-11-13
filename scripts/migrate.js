// scripts/migrate.js — Run initial schema migration
require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function migrate() {
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('[YOUR-DB-PASSWORD]')) {
    console.error('❌ DATABASE_URL not set. Please update .env with your Supabase DB password.');
    console.log('\n📝 Alternative: Run the SQL manually in Supabase Dashboard:');
    console.log('   https://supabase.com/dashboard/project/pkpqlmckzeqfiikcjebq/sql/new');
    console.log('   Copy content from: supabase/migrations/001_initial_schema.sql');
    process.exit(1);
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  const sqlFile = path.join(__dirname, '../supabase/migrations/001_initial_schema.sql');

  try {
    console.log('🔗 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!');

    const sql = fs.readFileSync(sqlFile, 'utf8');
    console.log('🚀 Running migration...');
    await client.query(sql);
    console.log('✅ Migration complete! All 16 tables created.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

migrate();
