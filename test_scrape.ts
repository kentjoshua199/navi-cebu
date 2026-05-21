import * as fs from 'fs';
import * as cheerio from 'cheerio';

async function testScrape() {
  const url = 'https://ph.commutetour.com/ph/routes/cebu-routes/cebu-jeep/07a/';
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);

  const stops: string[] = [];

  $('.stops-wrapper ul li').each((_, li) => {
    let stopText = $(li).find('h3').text();
    if (!stopText) {
      stopText = $(li).text();
    }
    stopText = stopText.trim().replace(/Info:\s*.*$/, '').replace(/Terminal:\s*.*$/, '').trim();
    if (stopText && stopText.length > 2 && stopText.length < 50) {
      stops.push(stopText);
    }
  });

  console.log("Extracted stops:", stops);

    // Map URL
    const iframe = $('iframe');
    const mapUrls: string[] = [];
    iframe.each((_, el) => {
      const src = $(el).attr('src');
      if (src && src.includes('google.com/maps')) {
        mapUrls.push(src);
      }
    });
    console.log("Found Maps:", mapUrls.length);

    // Fare
    let fareText = '';
    $('h2, h3, p').each((_, el) => {
      const text = $(el).text().toLowerCase();
      if (text.includes('fare') && text.includes('minimum')) {
        fareText = $(el).text();
      }
    });
    console.log("Fare Info:", fareText);

    // Stops check (what if they don't use .stops-wrapper?)
    let altStops: string[] = [];
    if (stops.length === 0) {
      $('ul li').each((_, li) => {
        if ($(li).find('a').length === 0) {
          const t = $(li).text().trim();
          if (t.length > 3 && t.length < 50) {
             altStops.push(t);
          }
        }
      });
      console.log("Alternative stops found:", altStops.length);
    }
}

testScrape();
