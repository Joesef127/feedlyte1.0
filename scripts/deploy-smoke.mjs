import { URL } from 'node:url';

const requiredPaths = [
  '/',
  '/auth',
  '/widget',
];

const url = process.env.SITE_URL || process.env.VERCEL_URL || process.env.NEXT_PUBLIC_APP_URL;

if (!url) {
  console.error('Missing deployment URL. Set SITE_URL, VERCEL_URL, or NEXT_PUBLIC_APP_URL before running the deploy smoke check.');
  process.exit(1);
}

const target = new URL(url);
const normalized = `${target.origin}`;

const checks = requiredPaths.map((path) => `${normalized}${path}`);

for (const check of checks) {
  try {
    const response = await fetch(check, { redirect: 'follow' });
    if (response.status >= 400) {
      console.error(`Smoke check failed for ${check}: HTTP ${response.status}`);
      process.exit(1);
    }
    console.log(`OK ${check} -> ${response.status}`);
  } catch (error) {
    console.error(`Smoke check failed for ${check}: ${(error instanceof Error ? error.message : String(error))}`);
    process.exit(1);
  }
}

console.log(`Deploy smoke checks passed for ${normalized}`);
