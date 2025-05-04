import { OddsApiClient } from './oddsApi';
import { OddsService } from './db/oddsService';
import * as fs from 'fs';

//Env variable is set up
const API_KEY = process.env.ODDS_API_KEY || 'YOUR_API_KEY';

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
    console.log('\nFetching Premier League odds for FanDuel and DraftKings...');
    const plOdds = await client.getPremierLeagueOdds();
    
    //Display the odds for FanDuel and DraftKings (Could add whichever bookmaker I want in oddsApi.ts)
    console.log(`\nFound ${plOdds.length} Premier League games with odds:`);
    
    // Save each game to the database
    for (const game of plOdds) {
      console.log(`\nSaving ${game.home_team} vs ${game.away_team} to database...`);
      await oddsService.saveGame(game);
      
      // Display the odds
      console.log(`\n${game.home_team} vs ${game.away_team} (${new Date(game.commence_time).toLocaleString()})`);
      
      game.bookmakers.forEach(bookmaker => {
        console.log(`  ${bookmaker.title} odds:`);
        
        bookmaker.markets.forEach(market => {
          if (market.key === 'h2h') {
            market.outcomes.forEach(outcome => {
              console.log(`    ${outcome.name}: ${outcome.price}`);
            });
          }
        });
      });
    }
    
    //Save the data to a JSON file as backup
    fs.writeFileSync('premier_league_odds.json', JSON.stringify(plOdds, null, 2));
    console.log('\nSaved odds data to premier_league_odds.json');
    
    // Example: Query odds for a specific team
    const teamName = 'Liverpool';
    console.log(`\nQuerying odds for ${teamName}...`);
    const liverpoolOdds = await oddsService.getTeamOdds(teamName);
    console.log(`Found ${liverpoolOdds.length} odds entries for ${teamName}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main(); 