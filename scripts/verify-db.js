// scripts/verify-db.js — Verify Supabase tables exist
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const EXPECTED_TABLES = [
  'schools','academic_years','terms','departments','teachers','students',
  'parents','student_parents','subjects','classes','class_enrollments',
  'courses','lecture_plans','lecture_completions','assessments','assessment_scores'
];

async function verify() {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  console.log('🔍 Verifying Supabase tables...\n');

  let found = 0;
  for (const table of EXPECTED_TABLES) {
    try {
      const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
      if (error) {
        console.log(`  ❌ ${table} — ${error.message}`);
      } else {
        console.log(`  ✅ ${table} — ${count || 0} rows`);
        found++;
      }
    } catch (e) {
      console.log(`  ❌ ${table} — ${e.message}`);
    }
  }

  console.log(`\n📊 Result: ${found}/${EXPECTED_TABLES.length} tables found`);
  if (found === EXPECTED_TABLES.length) {
    console.log('🎉 All tables verified! Database is ready.');
  } else {
    console.log('\n⚠️  Some tables are missing. Run the SQL migration:');
    console.log('   https://supabase.com/dashboard/project/pkpqlmckzeqfiikcjebq/sql/new');
  }
}

verify();
