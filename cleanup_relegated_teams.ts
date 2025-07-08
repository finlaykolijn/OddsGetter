import fs from 'fs';
import path from 'path';
import pool from './db/config';
import readline from 'readline';

interface TeamConfig {
  current_teams: string[];
  relegated_teams: string[];
  season: string;
  last_updated: string;
}

// Load current Premier League teams configuration
const loadCurrentTeams = (): TeamConfig => {
  try {
    const configPath = path.join(__dirname, 'current_premier_league_teams.json');
    const configData = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    console.error('Error loading team configuration:', error);
    return { current_teams: [], relegated_teams: [], season: '', last_updated: '' };
  }
};

async function cleanupRelegatedTeams(): Promise<void> {
  try {
    console.log('Starting cleanup of relegated teams...');
    
    const config = loadCurrentTeams();
    const relegatedTeams = config.relegated_teams || [];
    
    if (relegatedTeams.length === 0) {
      console.log('No relegated teams found in configuration.');
      return;
    }
    
    console.log('Relegated teams to remove:', relegatedTeams);
    
    // Find games involving relegated teams
    const relegatedTeamsPlaceholders = relegatedTeams.map((_, index) => `$${index + 1}`).join(',');
    
    const gamesQuery = `
      SELECT id, home_team, away_team, commence_time 
      FROM games 
      WHERE home_team IN (${relegatedTeamsPlaceholders}) 
         OR away_team IN (${relegatedTeamsPlaceholders})
    `;
    
    const gamesResult = await pool.query(gamesQuery, relegatedTeams);
    console.log(`Found ${gamesResult.rows.length} games involving relegated teams:`);
    
    gamesResult.rows.forEach((game: any) => {
      console.log(`  - ${game.home_team} vs ${game.away_team} (${new Date(game.commence_time).toLocaleDateString()})`);
    });
    
    if (gamesResult.rows.length === 0) {
      console.log('No games found involving relegated teams.');
      return;
    }
    
    // Ask for confirmation
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise<string>(resolve => {
      rl.question(`\nDo you want to delete these ${gamesResult.rows.length} games? (yes/no): `, resolve);
    });
    rl.close();
    
    if (answer.toLowerCase() !== 'yes') {
      console.log('Cleanup cancelled.');
      return;
    }
    
    // Delete match odds first (due to foreign key constraints)
    const gameIds = gamesResult.rows.map((game: any) => game.id);
    const gameIdsPlaceholders = gameIds.map((_, index) => `$${index + 1}`).join(',');
    
    console.log('Deleting match odds...');
    const deleteMatchOddsQuery = `
      DELETE FROM match_odds 
      WHERE game_id IN (${gameIdsPlaceholders})
    `;
    const matchOddsResult = await pool.query(deleteMatchOddsQuery, gameIds);
    console.log(`Deleted ${matchOddsResult.rowCount} match odds records.`);
    
    // Delete games
    console.log('Deleting games...');
    const deleteGamesQuery = `
      DELETE FROM games 
      WHERE id IN (${gameIdsPlaceholders})
    `;
    const gamesDeleteResult = await pool.query(deleteGamesQuery, gameIds);
    console.log(`Deleted ${gamesDeleteResult.rowCount} games.`);
    
    console.log('Cleanup completed successfully!');
    
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await pool.end();
  }
}

// Run the cleanup
cleanupRelegatedTeams(); 