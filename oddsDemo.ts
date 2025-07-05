import { OddsApiClient } from './oddsApi';
import { OddsService } from './db/oddsService';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Get API key from environment variables
const API_KEY = process.env.ODDS_API_KEY || '';

// Check if API key is available
if (!API_KEY || API_KEY === 'YOUR_API_KEY') {
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
    
    //Get Premier League in the sports list, key is soccer_epl
    const premierLeague = sports.find(sport => sport.key === 'soccer_epl');
    console.log('Premier League info:', premierLeague);
    
    //Get Premier League odds
    console.log('\nFetching Premier League odds for selected bookmakers...');
    const plOdds = await client.getPremierLeagueOdds();
    
    // Deduplicate games by team names
    const deduplicatedOdds = deduplicateGames(plOdds);
    
    //Display the odds for FanDuel and DraftKings (Could add whichever bookmaker I want in oddsApi.ts)
    console.log(`\nFound ${deduplicatedOdds.length} Premier League games with odds (after deduplication):`);
    
    // Save each game to the database
    for (const game of deduplicatedOdds) {
      console.log(`\nSaving ${game.home_team} vs ${game.away_team} to database...`);
      await oddsService.saveGame(game);
      
      // Display the odds
      console.log(`\n${game.home_team} vs ${game.away_team} (${new Date(game.commence_time).toLocaleString()})`);
      
      game.bookmakers.forEach((bookmaker: any) => {
        console.log(`  ${bookmaker.title} odds:`);
        
        bookmaker.markets.forEach((market: any) => {
          if (market.key === 'h2h') { // Can edit this to get other markets
            market.outcomes.forEach((outcome: any) => {
              console.log(`    ${outcome.name}: ${outcome.price}`);
            });
          }
        });
      });
    }
    
    //Save the deduplicated data to a JSON file as backup
    fs.writeFileSync('premier_league_odds.json', JSON.stringify(deduplicatedOdds, null, 2));
    console.log('\nSaved deduplicated odds data to premier_league_odds.json');
    
    // // Example: Query odds for a specific team - *******look at later
    // const teamName = 'Liverpool';
    // console.log(`\nQuerying odds for ${teamName}...`);
    // const liverpoolOdds = await oddsService.getTeamOdds(teamName);
    // console.log(`Found ${liverpoolOdds.length} odds entries for ${teamName}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main(); 