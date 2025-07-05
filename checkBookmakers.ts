import { OddsApiClient } from './oddsApi';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const API_KEY = process.env.ODDS_API_KEY || 'YOUR_API_KEY';

async function checkBookmakers() {
  const client = new OddsApiClient(API_KEY);
  
  try {
    //Get all available sports to verify API connection works
    console.log('Fetching available sports...');
    const sports = await client.getSports();
    console.log(`Successfully connected to Odds API! Found ${sports.length} sports.`);
    
    //Create a map to store bookmakers by region
    const bookmakersByRegion: Record<string, Set<string>> = {};
    const bookmakerDetails: Record<string, {title: string, regions: string[]}> = {};
    
    //All regions that Odds API supports
    const regions = ['us', 'uk', 'eu', 'au'];
    
    //Setup for leagues I want to check
    const targetLeagues = [
      { name: 'Premier League', possibleKeys: ['soccer_epl', 'soccer_england_premier_league'] },
      { name: 'UEFA Champions League', possibleKeys: ['soccer_uefa_champs_league', 'soccer_champions_league'] },
      { name: 'UEFA Europa League', possibleKeys: ['soccer_uefa_europa_league', 'soccer_europa_league'] },
      //{ name: 'UEFA Europa Conference League', possibleKeys: ['soccer_uefa_europa_conf_league', 'soccer_europa_conf_league'] },
      //{ name: 'Bundesliga', possibleKeys: ['soccer_germany_bundesliga', 'soccer_bundesliga'] },
      //{ name: 'La Liga', possibleKeys: ['soccer_spain_la_liga', 'soccer_la_liga'] },
      //{ name: 'Serie A', possibleKeys: ['soccer_italy_serie_a', 'soccer_serie_a'] },
      //{ name: 'Ligue 1', possibleKeys: ['soccer_france_ligue_1', 'soccer_ligue_1'] },
      //{ name: 'Eredivisie', possibleKeys: ['soccer_netherlands_eredivisie', 'soccer_eredivisie'] },
      //{ name: 'MLS', possibleKeys: ['soccer_usa_mls', 'soccer_mls'] }
    ];
    
    //Find matches for target leagues from the sports list
    const leaguesToCheck: {name: string, key: string}[] = [];
    
    console.log('\nLooking for target leagues in available sports:');
    for (const targetLeague of targetLeagues) {
      let found = false;
      
      for (const possibleKey of targetLeague.possibleKeys) {
        const match = sports.find(sport => sport.key === possibleKey);
        if (match) {
          leaguesToCheck.push({ name: targetLeague.name, key: match.key });
          console.log(`✓ Found ${targetLeague.name} as "${match.title}" with key "${match.key}"`);
          found = true;
          break;
        }
      }
      
      if (!found) {
        console.log(`✗ Could not find ${targetLeague.name} in available sports`);
      }
    }
    
    //If no leagues were found, check all soccer leagues as a fallback
    if (leaguesToCheck.length === 0) {
      console.log('\nNo specific target leagues found. Checking all available soccer leagues instead:');
      
      const soccerLeagues = sports.filter(sport => 
        sport.key.includes('soccer') || sport.group.toLowerCase().includes('soccer')
      );
      
      for (const league of soccerLeagues) {
        leaguesToCheck.push({ name: league.title, key: league.key });
        console.log(`- ${league.title} (${league.key})`);
      }
    }
    
    //Process each league and get odds for each region
    for (const league of leaguesToCheck) {
      console.log(`\nChecking bookmakers for ${league.name} (${league.key})...`);
      
      for (const region of regions) {
        try {
          const odds = await client.getOdds(league.key, { regions: region });
          
          //No games might be available for this league/region
          if (odds.length === 0) {
            console.log(`  No games found for ${region} region in ${league.name}`);
            continue;
          }
          
          //Initialize region in map if not exists
          if (!bookmakersByRegion[region]) {
            bookmakersByRegion[region] = new Set<string>();
          }
          
          //Process each game to extract bookmakers
          for (const game of odds) {
            for (const bookmaker of game.bookmakers) {
              //Add to region map
              bookmakersByRegion[region].add(bookmaker.key);
              
              //Store bookmaker details
              if (!bookmakerDetails[bookmaker.key]) {
                bookmakerDetails[bookmaker.key] = {
                  title: bookmaker.title,
                  regions: []
                };
              }
              
              if (!bookmakerDetails[bookmaker.key].regions.includes(region)) {
                bookmakerDetails[bookmaker.key].regions.push(region);
              }
            }
          }
          
          console.log(`  Found ${bookmakersByRegion[region].size} bookmakers for ${region} region`);
          
        } catch (error) {
          console.log(`  Error getting odds for ${league.key} in ${region} region:`, error);
        }
      }
    }
    
    //Output all bookmakers organized by region
    console.log('\n\n==== BOOKMAKERS BY REGION ====');
    for (const region of regions) {
      const bookmakers = Array.from(bookmakersByRegion[region] || []).sort();
      console.log(`\n${region.toUpperCase()} REGION (${bookmakers.length} bookmakers):`);
      
      bookmakers.forEach(key => {
        console.log(`  - ${bookmakerDetails[key]?.title || key} (${key})`);
      });
    }
    
    //Check for specific bookmakers
    console.log('\n\n==== SPECIFIC BOOKMAKER CHECK ====');
    
    const checkForBookmaker = (partialName: string) => {
      const matches: string[] = [];
      
      Object.keys(bookmakerDetails).forEach(key => {
        const title = bookmakerDetails[key].title.toLowerCase();
        if (title.includes(partialName.toLowerCase()) || key.includes(partialName.toLowerCase())) {
          matches.push(`${bookmakerDetails[key].title} (${key}) - Available in regions: ${bookmakerDetails[key].regions.join(', ')}`);
        }
      });
      
      return matches;
    };
    
    //Check for Bet365
    const bet365Matches = checkForBookmaker('bet365');
    console.log('\nBet365 bookmakers:');
    if (bet365Matches.length > 0) {
      bet365Matches.forEach(match => console.log(`  ✓ ${match}`));
    } else {
      console.log('  ✗ No Bet365 bookmakers found');
    }
    
    //Check for PointsBet
    const pointsBetMatches = checkForBookmaker('pointsbet');
    console.log('\nPointsBet bookmakers:');
    if (pointsBetMatches.length > 0) {
      pointsBetMatches.forEach(match => console.log(`  ✓ ${match}`));
    } else {
      console.log('  ✗ No PointsBet bookmakers found');
    }
    
    //Check for FanDuel
    const fanduelMatches = checkForBookmaker('fanduel');
    console.log('\nFanDuel bookmakers:');
    if (fanduelMatches.length > 0) {
      fanduelMatches.forEach(match => console.log(`  ✓ ${match}`));
    } else {
      console.log('  ✗ No FanDuel bookmakers found');
    }
    
    //Check for DraftKings
    const draftkingsMatches = checkForBookmaker('draftkings');
    console.log('\nDraftKings bookmakers:');
    if (draftkingsMatches.length > 0) {
      draftkingsMatches.forEach(match => console.log(`  ✓ ${match}`));
    } else {
      console.log('  ✗ No DraftKings bookmakers found');
    }
    
    //Save to a JSON file
    const results = {
      bookmakersByRegion: Object.fromEntries(
        Object.entries(bookmakersByRegion).map(([region, bookmakers]) => 
          [region, Array.from(bookmakers)]
        )
      ),
      bookmakerDetails,
      checkedLeagues: leaguesToCheck.map(l => ({ name: l.name, key: l.key }))
    };
    
    fs.writeFileSync('available_bookmakers.json', JSON.stringify(results, null, 2));
    console.log('\nSaved full bookmaker details to available_bookmakers.json');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkBookmakers(); 