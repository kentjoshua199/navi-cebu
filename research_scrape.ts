import * as cheerio from 'cheerio';

async function fetchHtml(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  return await res.text();
}

async function analyzeRoute(url: string) {
  console.log(`\nAnalyzing ${url}...`);
  try {
    const html = await fetchHtml(url);
    const $ = cheerio.load(html);

    const h2s = $('h2').map((_, el) => $(el).text()).get();
    console.log(`Found H2s:`, h2s);

    const stops1 = $('.stops-wrapper ul li').length;
    console.log(`Stops using .stops-wrapper ul li: ${stops1}`);

    const stops2 = $('ul li').length;
    console.log(`Total ul li tags on page: ${stops2}`);

    let mapUrl = '';
    $('iframe').each((_, el) => {
      const src = $(el).attr('src');
      if (src && src.includes('google.com/maps')) {
        mapUrl = src;
      }
    });
    console.log(`Map URL found: ${mapUrl}`);

    let fareText = '';
    $('h2, h3, p').each((_, el) => {
      const text = $(el).text().toLowerCase();
      if (text.includes('fare') || text.includes('minimum')) {
        if (!fareText && text.includes('php') || text.includes('fare')) fareText = $(el).text().trim();
      }
    });
    console.log(`Fare info found: ${fareText}`);

  } catch (err) {
    console.error(`Error:`, err);
  }
}

async function analyzeIndex() {
  const html = await fetchHtml('https://ph.commutetour.com/travel/transport/jeep/cebu-city-jeep-route-code/');
  const $ = cheerio.load(html);
  $('a').each((_, el) => {
    const text = $(el).text();
    if (text.startsWith('07') || text.startsWith('08')) {
      console.log(`Link for ${text}:`, $(el).attr('href'));
    }
  });
}

async function main() {
  await analyzeIndex();
}
main();
