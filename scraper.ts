import * as fs from 'fs';
import * as cheerio from 'cheerio';

const BASE_URL = 'https://ph.commutetour.com';
const INDEX_URL = `${BASE_URL}/travel/transport/jeep/cebu-city-jeep-route-code/`;

async function fetchHtml(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  return await res.text();
}

let allRoutesData: { code: string, origin: string, destination: string, url: string, stops: string[], mapUrl: string }[] = [];

// Clean up stop text (remove "Info: Road", etc)
function cleanStopName(text: string) {
  return text.replace(/Info:\s*.*$/, '').replace(/Terminal:\s*.*$/, '').trim();
}

async function scrapeIndex() {
  console.log(`Fetching index: ${INDEX_URL}`);
  const html = await fetchHtml(INDEX_URL);
  const $ = cheerio.load(html);
  const routeLinks: { code: string; origin: string; destination: string; url: string }[] = [];

  $('a').each((_, el) => {
    const href = $(el).attr('href');
    const text = $(el).text().trim();
    if (href && href.includes('/ph/routes/cebu-routes/cebu-jeep/') && text.match(/^[0-9A-Z]{2,4}\s*–/)) {
      const match = text.match(/^([0-9A-Z]{2,4})\s*–\s*(.*?)\s*–\s*(.*)$/);
      if (match) {
        routeLinks.push({
          code: match[1].trim(),
          origin: match[2].trim(),
          destination: match[3].trim(),
          url: href.startsWith('http') ? href : `${BASE_URL}${href}`
        });
      }
    }
  });

  const uniqueRoutes = [];
  const seenCodes = new Set();
  for (const route of routeLinks) {
    if (!seenCodes.has(route.code)) {
      seenCodes.add(route.code);
      uniqueRoutes.push(route);
    }
  }
  return uniqueRoutes;
}

async function scrapeRouteDetails(route: any) {
  const stops: string[] = [];
  try {
    const html = await fetchHtml(route.url);
    const $ = cheerio.load(html);

    $('.stops-wrapper ul li').each((_, li) => {
      let stopText = $(li).find('h3').text();
      if (!stopText) {
        stopText = $(li).text();
      }
      stopText = cleanStopName(stopText);
      if (stopText && stopText.length > 2 && stopText.length < 50 && !stopText.includes('Commute Tour')) {
        stops.push(stopText);
      }
    });

    // Only filter CONSECUTIVE duplicates to preserve return paths
    const filteredStops = stops.filter((stop, idx) => idx === 0 || stop !== stops[idx - 1]);
    
    // Extract map URL
    let mapUrl = '';
    $('iframe').each((_, el) => {
      const src = $(el).attr('src');
      if (src && src.includes('google.com/maps')) {
        mapUrl = src;
      }
    });

    if (filteredStops.length > 0) {
      allRoutesData.push({
        code: route.code,
        origin: route.origin,
        destination: route.destination,
        url: route.url,
        stops: filteredStops,
        mapUrl
      });
    }
  } catch (err) {
    console.error(`Error scraping ${route.url}:`, err);
  }
}

async function generateSql() {
  const routes = await scrapeIndex();
  console.log(`Found ${routes.length} routes. Scraping details...`);
  
  for (const route of routes) {
    console.log(`Scraping ${route.code}...`);
    await scrapeRouteDetails(route);
    await new Promise(r => setTimeout(r, 500)); 
  }

  // Generate SQL string
  let sql = `-- MIGRATION: SEED ALL ROUTES FROM COMMUTETOUR\n\n`;

  // 1. Insert Checkpoints
  sql += `-- Insert Checkpoints\n`;
  const globalCheckpoints = new Set<string>();
  allRoutesData.forEach(r => r.stops.forEach(s => globalCheckpoints.add(s)));

  for (const cp of globalCheckpoints) {
    const safeName = cp.replace(/'/g, "''");
    sql += `INSERT INTO checkpoints (name, checkpoint_type, coordinates, radius_meters) VALUES ('${safeName}', 'LANDMARK', '{"lat":0,"lng":0}', 50) ON CONFLICT (name) DO NOTHING;\n`;
  }
  
  // 2. Insert Routes & Stop Settings
  sql += `\n-- Insert Routes and Stop Settings\n`;
  for (const route of allRoutesData) {
    const rcode = route.code.replace(/'/g, "''");
    const orig = route.origin.replace(/'/g, "''");
    const dest = route.destination.replace(/'/g, "''");
    const rname = `${orig} - ${dest}`;
    const safeMapUrl = route.mapUrl ? `'${route.mapUrl}'` : 'NULL';

    sql += `\n-- Route ${rcode}\n`;
    sql += `INSERT INTO routes (route_code, route_name, route_type, origin, destination, is_active, map_url) 
VALUES ('${rcode}', '${rname}', 'TRADITIONAL', '${orig}', '${dest}', true, ${safeMapUrl})
ON CONFLICT (route_code) DO UPDATE SET map_url = EXCLUDED.map_url;\n`;
    
    sql += `WITH r_id AS (SELECT id FROM routes WHERE route_code = '${rcode}')\n`;
    sql += `INSERT INTO stop_settings (route_id, checkpoint_id, stop_order, stop_type, waiting_time_minutes, estimated_time_minutes, distance_meters) VALUES\n`;
    
    const values = route.stops.map((stop, idx) => {
      const safeName = stop.replace(/'/g, "''");
      return `((SELECT id FROM r_id), (SELECT id FROM checkpoints WHERE name = '${safeName}'), ${idx + 1}, 'REGULAR', 2, 0, 0)`;
    });
    sql += values.join(',\n') + `\nON CONFLICT (route_id, checkpoint_id) DO NOTHING;\n`;
  }

  fs.writeFileSync('database/seed_all_routes.sql', sql);
  console.log('SQL generated: database/seed_all_routes.sql');
}

generateSql();

