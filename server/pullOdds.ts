import { OddsApiClient } from './oddsApi';
import { OddsService } from '../db/oddsService';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Get API key from environment variables
const API_KEY = process.env.ODDS_API_KEY || '';

// Check if API key is available
if (!API_KEY) {
  console.error('Error: ODDS_API_KEY not found in environment variables or .env file');
  console.error('Please ensure you have a valid API key in your .env file: ODDS_API_KEY=your_actual_api_key');
  process.exit(1);
}

// Function to deduplicate games by team names
function deduplicateGames(games: any[]): any[] {
  const gameMap = new Map<string, any>();
  
  for (const game of games) {
    const key = `${game.home_team}_${game.away_team}`;
    
    if (gameMap.has(key)) {
      // Game already exists, merge bookmakers
      const existingGame = gameMap.get(key);
      existingGame.bookmakers.push(...game.bookmakers);
    } else {
      // New game, add to map
      gameMap.set(key, { ...game });
    }
  }
  
  return Array.from(gameMap.values());
}

async function main() {
  const client = new OddsApiClient(API_KEY);
  const oddsService = new OddsService();
  
  try {
    //Get all available sports
    console.log('Fetching available sports...');
    const sports = await client.getSports();
    
    // Define leagues to test
    const leagues = [
      { name: 'Premier League', key: 'soccer_epl' },
      { name: 'La Liga', key: 'soccer_spain_la_liga' },
      { name: 'Bundesliga', key: 'soccer_germany_bundesliga' },
      { name: 'Serie A', key: 'soccer_italy_serie_a' },
      { name: 'Ligue 1', key: 'soccer_france_ligue_one' },
      { name: 'Champions League', key: 'soccer_uefa_champs_league' },
    ];
    
    for (const league of leagues) {
      console.log(`\n=== Testing ${league.name} ===`);
      
      // Check if league exists in available sports
      const leagueInfo = sports.find(sport => sport.key === league.key);
      if (!leagueInfo) {
        console.log(`${league.name} not found in available sports`);
        continue;
      }
      
      console.log(`${league.name} info:`, leagueInfo);
      
      // Get odds for this league
      console.log(`\nFetching ${league.name} odds for selected bookmakers...`);
      try {
        const odds = await client.getLeagueOdds(league.key);
        
        if (odds.length === 0) {
          console.log(`No ${league.name} games found with odds`);
          continue;
        }
        
        // Deduplicate games by team names
        const deduplicatedOdds = deduplicateGames(odds);
        
        console.log(`\nFound ${deduplicatedOdds.length} ${league.name} games with odds (after deduplication):`);
        
        // Save each game to the database
        for (const game of deduplicatedOdds) {
          console.log(`\nSaving ${game.home_team} vs ${game.away_team} to database...`);
          await oddsService.saveGame(game);
          
          // Display the odds
          console.log(`\n${game.home_team} vs ${game.away_team} (${new Date(game.commence_time).toLocaleString()})`);
          
          game.bookmakers.forEach((bookmaker: any) => {
            console.log(`  ${bookmaker.title} odds:`);
            
            bookmaker.markets.forEach((market: any) => {
              if (market.key === 'h2h') {
                market.outcomes.forEach((outcome: any) => {
                  console.log(`    ${outcome.name}: ${outcome.price}`);
                });
              }
            });
          });
        }
        
        //Save the deduplicated data to a JSON file as backup
        const filename = `${league.name.toLowerCase().replace(/\s+/g, '_')}_odds.json`;
        fs.writeFileSync(filename, JSON.stringify(deduplicatedOdds, null, 2));
        console.log(`\nSaved deduplicated odds data to ${filename}`);
        
      } catch (error) {
        console.error(`Error fetching ${league.name} odds:`, error);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main(); 