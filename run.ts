import { initializeDatabase } from './db/init';
import { OddsService } from './db/oddsService';
import { OddsApiClient } from './oddsApi';
import * as fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
    try {
        // Initialize database
        console.log('Initializing database...');
        await initializeDatabase();
        console.log('Database initialized successfully!');

        // Initialize services
        const apiKey = process.env.ODDS_API_KEY || 'YOUR_API_KEY';
        const client = new OddsApiClient(apiKey);
        const oddsService = new OddsService();

        // Get Premier League odds
        console.log('\nFetching Premier League odds...');
        const plOdds = await client.getPremierLeagueOdds();
        console.log(`Found ${plOdds.length} Premier League games with odds:`);

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

        // Save backup JSON file
        fs.writeFileSync('premier_league_odds.json', JSON.stringify(plOdds, null, 2));
        console.log('\nSaved odds data to premier_league_odds.json');

        // Test query
        const teamName = 'Liverpool';
        console.log(`\nQuerying odds for ${teamName}...`);
        const liverpoolOdds = await oddsService.getTeamOdds(teamName);
        console.log(`Found ${liverpoolOdds.length} odds entries for ${teamName}`);
        
        if (liverpoolOdds.length > 0) {
            console.log('\nSample odds data from database:');
            console.log(JSON.stringify(liverpoolOdds[0], null, 2));
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

main(); 