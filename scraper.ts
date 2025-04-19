import { chromium, Page } from 'playwright';

async function scrapeOddsPortal() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('Navigating to main Premier League page...');
  await page.goto('https://www.oddsportal.com/football/england/premier-league/', {
    waitUntil: 'domcontentloaded',
    timeout: 15000
  });

  console.log('Waiting for event rows to load...');
  await page.waitForSelector('.eventRow', { timeout: 10000 });

  const matches = await page.$$eval('.eventRow', (rows: Element[]) =>
    rows.map(row => {
      const teams = Array.from(row.querySelectorAll('.participant-name'))
        .map(el => el.textContent?.trim() || '')
        .filter(Boolean);
      const odds = Array.from(row.querySelectorAll('p.height-content'))
        .map(el => el.textContent?.trim() || '')
        .slice(0, 3);

      const eventId = row.getAttribute('id');
      const href = row.querySelector('a[href*="premier-league"]')?.getAttribute('href') || '';
      const slugMatch = href.match(/\/premier-league\/(.+?)\//);
      const slug = slugMatch?.[1] || '';

      return {
        team1: teams[0] || null,
        team2: teams[1] || null,
        odds: {
          win: odds[0] || null,
          draw: odds[1] || null,
          lose: odds[2] || null,
        },
        slug,
        eventId
      };
    }).filter(m => m.team1 && m.team2 && m.slug && m.eventId)
  );

  console.log(`Found ${matches.length} matches.`);



  for (const match of matches as (typeof matches[0] & { bet365?: { win: string | null; draw: string | null; lose: string | null } })[]) {
    const matchPage = await browser.newPage();
    const url = `https://www.oddsportal.com/football/england/premier-league/${match.slug}/#1X2;2;`;
    console.log(`\nProcessing match: ${match.team1} vs ${match.team2} — ${url}`);

    try {
      await matchPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
      console.log(`Loaded match page for ${match.slug}`);

      match.bet365 = await getBet365OddsWithRetry(matchPage);
   
      console.log('Bet365 odds:', match.bet365);

    } catch (err) {
      console.warn(`Failed to load bet365 odds for ${match.slug} - ${match.eventId}`, err);
      match.bet365 = {
        win: null,
        draw: null,
        lose: null
      };
    }

    await matchPage.close();
  }

  await browser.close();
  console.log('\nDone scraping all matches!');
}

async function getBet365OddsWithRetry(page: Page): Promise<{ win: string | null; draw: string | null; lose: string | null }> {
  const attempt = async (): Promise<string[]> => {
    await page.waitForSelector('div.border-black-borders', { timeout: 7000 });

    return await page.$$eval('div.border-black-borders', (rows: Element[]) => {
      for (const row of rows) {
        const text = row.textContent?.toLowerCase();
        if (text && text.includes('bet365')) {
          const oddsEls = row.querySelectorAll('a[class*="text-color-black"][class*="underline"]');
          const odds = Array.from(oddsEls)
            .map(el => {
              const anchor = el as HTMLAnchorElement;
              const val = anchor.textContent?.trim();
              return val && !isNaN(Number(val)) ? val : null;
            })
            .filter((val): val is string => val !== null)
            .slice(0, 3);
          return odds;
        }
      }
      return [];
    });
  };

  let odds = await attempt();
  if (odds.length < 3) {
    console.warn('Odds missing or incomplete. Retrying in 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    odds = await attempt();
  }

  return {
    win: odds[0] || null,
    draw: odds[1] || null,
    lose: odds[2] || null
  };
}

scrapeOddsPortal().catch(err => {
  console.error('Unhandled error in scrapeOddsPortal:', err);
});
