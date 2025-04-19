"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const playwright_1 = require("playwright");
//Launch browser
function scrapeOddsPortal() {
    return __awaiter(this, void 0, void 0, function* () {
        const browser = yield playwright_1.chromium.launch({ headless: true });
        const page = yield browser.newPage();
        console.log('Navigating to main Premier League page...');
        yield page.goto('https://www.oddsportal.com/football/england/premier-league/', {
            waitUntil: 'domcontentloaded',
            timeout: 15000
        });
        console.log('Waiting for event rows to load...');
        yield page.waitForSelector('.eventRow', { timeout: 10000 });
        //Get all the matches
        const matches = yield page.$$eval('.eventRow', (rows) => rows.map(row => {
            var _a;
            //Scrape the teams and odds
            const teams = Array.from(row.querySelectorAll('.participant-name'))
                .map(el => { var _a; return ((_a = el.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || ''; })
                .filter(Boolean);
            const odds = Array.from(row.querySelectorAll('p.height-content'))
                .map(el => { var _a; return ((_a = el.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || ''; })
                .slice(0, 3);
            //Get the event ID and slug
            //The slug is the part of the URL that identifies the match
            const eventId = row.getAttribute('id');
            const href = ((_a = row.querySelector('a[href*="premier-league"]')) === null || _a === void 0 ? void 0 : _a.getAttribute('href')) || '';
            const slugMatch = href.match(/\/premier-league\/(.+?)\//);
            const slug = (slugMatch === null || slugMatch === void 0 ? void 0 : slugMatch[1]) || '';
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
        }).filter(m => m.team1 && m.team2 && m.slug && m.eventId));
        console.log(`Found ${matches.length} matches.`);
        //Go through each match
        for (const match of matches) {
            const matchPage = yield browser.newPage();
            const url = `https://www.oddsportal.com/football/england/premier-league/${match.slug}/#1X2;2;`;
            console.log(`\nProcessing match: ${match.team1} vs ${match.team2} — ${url}`);
            try {
                yield matchPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
                console.log(`Loaded match page for ${match.slug}`);
                match.bet365 = yield getBet365OddsWithRetry(matchPage);
                console.log('Bet365 odds:', match.bet365);
            }
            catch (err) {
                console.warn(`Failed to load bet365 odds for ${match.slug} - ${match.eventId}`, err);
                match.bet365 = {
                    win: null,
                    draw: null,
                    lose: null
                };
            }
            yield matchPage.close();
        }
        yield browser.close();
        console.log('\nDone scraping all matches!');
    });
}
//Scrape the odds for each match from bet365
function getBet365OddsWithRetry(page) {
    return __awaiter(this, void 0, void 0, function* () {
        const attempt = () => __awaiter(this, void 0, void 0, function* () {
            yield page.waitForSelector('div.border-black-borders', { timeout: 7000 });
            return yield page.$$eval('div.border-black-borders', (rows) => {
                var _a;
                for (const row of rows) {
                    const text = (_a = row.textContent) === null || _a === void 0 ? void 0 : _a.toLowerCase();
                    if (text && text.includes('bet365')) {
                        const oddsEls = row.querySelectorAll('a[class*="text-color-black"][class*="underline"]');
                        const odds = Array.from(oddsEls)
                            .map(el => {
                            var _a;
                            const anchor = el;
                            const val = (_a = anchor.textContent) === null || _a === void 0 ? void 0 : _a.trim();
                            return val && !isNaN(Number(val)) ? val : null;
                        })
                            .filter((val) => val !== null)
                            .slice(0, 3);
                        return odds;
                    }
                }
                return [];
            });
        });
        let odds = yield attempt();
        if (odds.length < 3) {
            console.warn('Odds missing or incomplete. Retrying in 2 seconds...');
            yield new Promise(resolve => setTimeout(resolve, 2000));
            odds = yield attempt();
        }
        return {
            win: odds[0] || null,
            draw: odds[1] || null,
            lose: odds[2] || null
        };
    });
}
scrapeOddsPortal().catch(err => {
    console.error('Unhandled error in scrapeOddsPortal:', err);
});
