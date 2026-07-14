// Deploy SQL schema to Supabase via Management API
const fs = require('fs');
const path = require('path');

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'dwlswemrfgbqdogpgtia';
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || '';

if (!ACCESS_TOKEN) {
  console.error('Missing SUPABASE_ACCESS_TOKEN env var.');
  process.exit(1);
}
const API_URL = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

async function apiQuery(query) {
  const resp = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  const text = await resp.text();
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status}: ${text.slice(0, 300)}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function runSqlFile(filePath, label) {
  const sql = fs.readFileSync(filePath, 'utf8');
  console.log(`\n📄 ${label} (${sql.length} chars)...`);
  try {
    await apiQuery(sql);
    console.log(`   ✅ Done!`);
  } catch (err) {
    console.error(`   ❌ ${err.message}`);
    throw err;
  }
}

async function main() {
  try {
    // Step 1: Test connection
    console.log('🔌 Testing Management API...');
    const test = await apiQuery('SELECT 1 AS connected');
    console.log('✅ Connected!', JSON.stringify(test).slice(0, 100));

    // Step 2: Create tracking table
    console.log('\n📊 Setup migration tracking...');
    await apiQuery(`
      CREATE SCHEMA IF NOT EXISTS supabase_migrations;
      CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
        version text PRIMARY KEY,
        inserted_at timestamptz NOT NULL DEFAULT now()
      );
    `);
    console.log('   ✅ Done!');

    // Step 3: Run schema SQL
    const schemaFile = path.join(__dirname, '..', 'supabase', '001_schema.sql');
    await runSqlFile(schemaFile, '001_schema.sql (tables + RLS + functions)');

    // Step 4: Run seed SQL
    const seedFile = path.join(__dirname, '..', 'supabase', '002_seed.sql');
    await runSqlFile(seedFile, '002_seed.sql (default categories)');

    // Step 5: Record migrations
    await apiQuery(`
      INSERT INTO supabase_migrations.schema_migrations (version) VALUES
        ('20240101000000_schema.sql'),
        ('20240101000001_seed.sql')
      ON CONFLICT (version) DO NOTHING;
    `);

    // Step 6: Verify
    console.log('\n🔍 Verifying...');
    const tables = await apiQuery(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    );
    console.log('📋 Tables:', tables.map((r) => r.table_name).join(', '));

    const catCount = await apiQuery('SELECT count(*)::text AS cnt FROM categories');
    console.log(`📂 Categories: ${catCount[0].cnt} rows`);

    const funcs = await apiQuery(
      "SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' ORDER BY routine_name"
    );
    console.log('⚡ Functions:', funcs.map((r) => r.routine_name).join(', '));

    // Step 7: Update .env.local with real credentials already done
    console.log('\n🎉 DEPLOY COMPLETE! Supabase is ready.');
  } catch (err) {
    console.error('\n💥 Deploy failed:', err.message);
    process.exit(1);
  }
}

main();
