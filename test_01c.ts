import { Client } from 'pg';

const connectionString = "postgres://postgres.rmtajqtgrokwxogvyifi:Vakkps4os6C51qlo@aws-1-us-east-1.pooler.supabase.com:6543/postgres";

async function main() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const res = await client.query(`
    SELECT r.route_code, r.route_name, c.name, ss.stop_order 
    FROM routes r 
    JOIN stop_settings ss ON ss.route_id = r.id 
    JOIN checkpoints c ON c.id = ss.checkpoint_id 
    WHERE r.route_code = '01C' 
    ORDER BY ss.stop_order
  `);

  console.log('Stops for 01C:');
  res.rows.forEach((row, i) => console.log(`  ${i+1}. ${row.name}`));

  await client.end();
}
main();
