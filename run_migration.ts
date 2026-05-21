import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

// Connection string from .env.local without the query params
const connectionString = "postgres://postgres.rmtajqtgrokwxogvyifi:Vakkps4os6C51qlo@aws-1-us-east-1.pooler.supabase.com:6543/postgres";

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  try {
    await client.connect();
    console.log("Connected to PostgreSQL.");

    const sqlFile = fs.readFileSync(path.join(process.cwd(), 'database', 'seed_all_routes.sql'), 'utf8');

    console.log("Running massive route import SQL...");
    
    await client.query(sqlFile);
    console.log("Migration executed successfully!");
    
    // Also run NOTIFY pgrst to reload the schema cache so the API sees the new columns immediately!
    await client.query('NOTIFY pgrst, \'reload schema\';');
    console.log("Notified PostgREST to reload schema cache.");

  } catch (err) {
    console.error("Error executing migration:", err);
  } finally {
    await client.end();
  }
}

runMigration();
