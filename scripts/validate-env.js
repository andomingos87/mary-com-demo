#!/usr/bin/env node
/**
 * Validates required environment variables are set
 * Run: node scripts/validate-env.js
 */

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

const requiredForProduction = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_APP_URL',
];

const optionalVars = [
  'ENVIRONMENT',
  'MAINTENANCE_MODE',
  'OPENAI_API_KEY',
  'BREVO_API_KEY',
  'Z_API_BASE_URL',
  'Z_API_INSTANCE_ID',
  'Z_API_TOKEN',
  'Z_API_CLIENT_TOKEN',
  'Z_API_TIMEOUT_MS',
  'Z_API_MAX_RETRIES',
  'Z_API_RETRY_BASE_DELAY_MS',
];

let hasErrors = false;
const isProduction = process.env.NODE_ENV === 'production' || process.env.ENVIRONMENT === 'production';

console.log('🔍 Validating environment variables...\n');
console.log(`Environment: ${isProduction ? 'PRODUCTION' : 'development'}\n`);

// Check required variables
console.log('📋 Required variables:');
requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    console.log(`❌ Missing required: ${varName}`);
    hasErrors = true;
  } else {
    console.log(`✅ ${varName} is set`);
  }
});

// Check production-required variables
if (isProduction) {
  console.log('\n📋 Production-required variables:');
  requiredForProduction.forEach(varName => {
    if (!process.env[varName]) {
      console.log(`❌ Missing required for production: ${varName}`);
      hasErrors = true;
    } else {
      console.log(`✅ ${varName} is set`);
    }
  });
}

// Check optional variables
console.log('\n📋 Optional variables:');
optionalVars.forEach(varName => {
  const status = process.env[varName] ? '✅' : '⚠️ ';
  console.log(`${status} ${varName}`);
});

// Final result
if (hasErrors) {
  console.log('\n❌ Environment validation failed!');
  console.log('Please check env.example (or .env.example) for required variables.\n');
  process.exit(1);
} else {
  console.log('\n✅ Environment validation passed!');
}
