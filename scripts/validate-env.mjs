import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const hasEnvFile = fs.existsSync(path.join(cwd, '.env')) || fs.existsSync(path.join(cwd, '.env.local'));
const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

const requiredInProduction = ['DATABASE_URL', 'AUTH_SECRET'];
const optionalButRecommended = ['NEXT_PUBLIC_APP_URL', 'NEXTAUTH_URL', 'RESEND_API_KEY', 'RESEND_FROM_EMAIL', 'CRON_SECRET'];
const missingRequired = requiredInProduction.filter((key) => !process.env[key]);
const warnings = [];

for (const key of optionalButRecommended) {
  if (!process.env[key]) {
    warnings.push(`${key} not set; using defaults or skipping optional feature validation.`);
  }
}

if (missingRequired.length > 0) {
  if (isProd) {
    console.error(`Production environment validation failed. Missing required values: ${missingRequired.join(', ')}`);
    process.exit(1);
  }

  console.warn(`Local/development mode: missing production vars ${missingRequired.join(', ')}. This is acceptable for local iteration.`);
}

if (!hasEnvFile && !isProd) {
  console.warn('No .env file detected; rely on shell env or local defaults during development.');
}

if (warnings.length > 0) {
  console.warn(warnings.join('\n'));
}

console.log(`Environment validation passed for ${process.env.NODE_ENV || 'development'} mode.`);
