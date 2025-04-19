import { OddsApiClient } from './oddsApi';
import * as fs from 'fs';

//Env variable is set up
const API_KEY = process.env.ODDS_API_KEY || 'YOUR_API_KEY';

async function main() {
  const client = new OddsApiClient(API_KEY);
  
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
    
    plOdds.forEach(game => {
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
    });
    
    //Save the data to a JSON file
    fs.writeFileSync('premier_league_odds.json', JSON.stringify(plOdds, null, 2));
    console.log('\nSaved odds data to premier_league_odds.json');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main(); 