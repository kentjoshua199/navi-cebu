import { Client } from 'pg';

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.rmtajqtgrokwxogvyifi:Eventtimeline12345678project@aws-1-us-east-1.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  const res = await client.query("SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE typname = 'checkpoint_type'");
  console.log(res.rows);
  await client.end();
}
main();
