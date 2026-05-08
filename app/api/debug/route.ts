import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || 'NOT SET';
  const nodeEnv = process.env.NODE_ENV || 'NOT SET';
  const cwd = process.cwd();
  
  // Check .env file content
  const envPath = path.join(cwd, '.env');
  const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : 'NOT FOUND';
  
  // Check if database file exists
  const dbFile = path.join(cwd, 'dev.db');
  const dbExists = fs.existsSync(dbFile);
  
  // Try to read schema to verify datasource
  const schemaPath = path.join(cwd, 'prisma', 'schema.prisma');
  const schemaContent = fs.existsSync(schemaPath) 
    ? fs.readFileSync(schemaPath, 'utf-8').substring(0, 500) 
    : 'NOT FOUND';
  
  return NextResponse.json({
    runtime: {
      DATABASE_URL: dbUrl,
      NODE_ENV: nodeEnv,
      cwd: cwd,
    },
    files: {
      envExists: fs.existsSync(envPath),
      envContent: envContent,
      dbExists: dbExists,
      dbPath: dbFile,
      schemaPath: schemaPath,
    },
    schema: schemaContent
  });
}
