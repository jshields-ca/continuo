#!/usr/bin/env node

/**
 * Database Migration Script for Railway Production
 * 
 * This script helps run Prisma migrations on the Railway production database.
 * Run this after connecting to the Railway API service.
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🗄️  Running Continuo Database Migrations...\n');

try {
  // Change to API directory
  process.chdir(path.join(__dirname, '../api'));
  
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('🔄 Running database migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  
  console.log('✅ Database migrations completed successfully!');
  console.log('\n🎉 Your Continuo application is now ready for production use!');
  
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
} 