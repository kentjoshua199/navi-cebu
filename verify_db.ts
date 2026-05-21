import { Client } from 'pg';

const connectionString = "postgres://postgres.rmtajqtgrokwxogvyifi:Vakkps4os6C51qlo@aws-1-us-east-1.pooler.supabase.com:6543/postgres";

async function main() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  await client.query("ALTER TABLE routes ADD COLUMN IF NOT EXISTS map_url TEXT");
  console.log('Added map_url column');

  await client.end();
}
main();
