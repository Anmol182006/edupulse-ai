// scripts/github-push.js
// Uses GitHub Contents API to push all files (bypasses git HTTPS issues with fine-grained PAT)
const https = require('https');
const fs = require('fs');
const path = require('path');

const OWNER = 'Anmol182006';
const REPO = 'edupulse-ai';
const BRANCH = 'main';
const TOKEN = process.env.GITHUB_TOKEN || process.argv[2];

if (!TOKEN) {
  console.error('Usage: node scripts/github-push.js <GITHUB_TOKEN>');
  process.exit(1);
}

const FILES = [
  '.gitignore',
  '.env.example',
  'README.md',
  'package.json',
  'public/index.html',
  'scripts/migrate.js',
  'scripts/verify-db.js',
  'scripts/github-push.js',
  'server/server.js',
  'supabase/migrations/001_initial_schema.sql',
];

function apiRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'api.github.com',
      path, method,
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'EduPulse-AI-Pusher',
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    };
    const req = https.request(opts, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(raw) }); }
        catch(e) { resolve({ status: res.statusCode, data: raw }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function getFileSHA(filePath) {
  const r = await apiRequest('GET', `/repos/${OWNER}/${REPO}/contents/${filePath}?ref=${BRANCH}`);
  if (r.status === 200 && r.data.sha) return r.data.sha;
  return null;
}

async function pushFile(filePath, localPath) {
  const content = fs.readFileSync(localPath);
  const encoded = content.toString('base64');
  const sha = await getFileSHA(filePath);

  const body = {
    message: sha ? `update: ${filePath}` : `add: ${filePath}`,
    content: encoded,
    branch: BRANCH,
    ...(sha ? { sha } : {})
  };

  const r = await apiRequest('PUT', `/repos/${OWNER}/${REPO}/contents/${filePath}`, body);
  if (r.status === 200 || r.status === 201) {
    console.log(`  ✅ ${filePath}`);
    return true;
  } else {
    console.log(`  ❌ ${filePath} — ${r.status}: ${JSON.stringify(r.data?.message || r.data)}`);
    return false;
  }
}

async function main() {
  console.log(`\n🚀 EduPulse AI — GitHub Push\n   Repo: ${OWNER}/${REPO}\n`);
  const baseDir = path.join(__dirname, '..');
  let ok = 0, fail = 0;

  for (const file of FILES) {
    const localPath = path.join(baseDir, file);
    if (!fs.existsSync(localPath)) {
      console.log(`  ⚠️  Skipped (not found): ${file}`);
      continue;
    }
    const success = await pushFile(file, localPath);
    success ? ok++ : fail++;
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\n📊 Done: ${ok} pushed, ${fail} failed`);
  if (ok > 0) console.log(`\n🌐 View: https://github.com/${OWNER}/${REPO}`);
}

main().catch(console.error);
