const { Pool } = require('pg');
require('dotenv').config();

// Check if required environment variables are set
if (!process.env.DB_PASSWORD) {
  console.error('Error: DB_PASSWORD environment variable is required');
  console.error('Please set DB_PASSWORD in your .env file');
  process.exit(1);
}

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'odds_database',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function checkDatabase() {
  try {
    console.log('=== DATABASE ANALYSIS ===\n');
    
    // 1. Total games count
    const totalGames = await pool.query('SELECT COUNT(*) as count FROM games');
    console.log(`1. Total games in database: ${totalGames.rows[0].count}`);
    
    // 2. Games by season (using date ranges)
    const seasonRanges = {
      '2025-26': { start: '2025-08-01', end: '2026-05-31' },
      '2024-25': { start: '2024-08-01', end: '2025-05-31' },
      '2023-24': { start: '2023-08-01', end: '2024-05-31' },
    };
    
    console.log('\n2. Games by season:');
    for (const [season, range] of Object.entries(seasonRanges)) {
      const result = await pool.query(
        'SELECT COUNT(*) as count FROM games WHERE commence_time >= $1 AND commence_time <= $2',
        [range.start, range.end]
      );
      console.log(`   ${season}: ${result.rows[0].count} games`);
    }
    
    // 3. Games with match_odds
    const gamesWithOdds = await pool.query(`
      SELECT COUNT(DISTINCT g.id) as count 
      FROM games g 
      JOIN match_odds mo ON g.id = mo.game_id
    `);
    console.log(`\n3. Games with match odds: ${gamesWithOdds.rows[0].count}`);
    
    // 4. Games by season WITH match_odds
    console.log('\n4. Games by season WITH match odds:');
    for (const [season, range] of Object.entries(seasonRanges)) {
      const result = await pool.query(`
        SELECT COUNT(DISTINCT g.id) as count 
        FROM games g 
        JOIN match_odds mo ON g.id = mo.game_id
        WHERE g.commence_time >= $1 AND g.commence_time <= $2
      `, [range.start, range.end]);
      console.log(`   ${season}: ${result.rows[0].count} games`);
    }
    
    // 5. Sample of recent games
    console.log('\n5. 10 most recent games:');
    const recentGames = await pool.query(`
      SELECT 
        home_team, 
        away_team, 
        commence_time, 
        sport_title,
        created_at
      FROM games 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    recentGames.rows.forEach((game, index) => {
      console.log(`   ${index + 1}. ${game.home_team} vs ${game.away_team} (${game.commence_time})`);
    });
    
    // 6. Check what the API query would return for 2025-26
    console.log('\n6. API query result for 2025-26 season:');
    const apiQuery = await pool.query(`
      SELECT 
        g.home_team,
        g.away_team,
        g.commence_time,
        b.title as bookmaker,
        mo.home_win_odds,
        mo.draw_odds,
        mo.away_win_odds,
        mo.last_updated
      FROM games g
      JOIN match_odds mo ON g.id = mo.game_id
      JOIN bookmakers b ON mo.bookmaker_id = b.id
      WHERE g.commence_time >= '2025-08-01' AND g.commence_time <= '2026-05-31'
      ORDER BY g.commence_time ASC, mo.last_updated DESC
    `);
    console.log(`   Games returned by API: ${apiQuery.rows.length}`);
    
    // Group by unique matches
    const uniqueMatches = new Set();
    apiQuery.rows.forEach(row => {
      uniqueMatches.add(`${row.home_team} vs ${row.away_team} (${row.commence_time})`);
    });
    console.log(`   Unique matches: ${uniqueMatches.size}`);
    
    // 7. DETAILED ANALYSIS - Show exactly what's in the database vs what the API returns
    console.log('\n7. DETAILED ANALYSIS:');
    
    // All games in 2025-26 season
    const allGames2025 = await pool.query(`
      SELECT id, home_team, away_team, commence_time
      FROM games 
      WHERE commence_time >= '2025-08-01' AND commence_time <= '2026-05-31'
      ORDER BY commence_time
    `);
    console.log(`   All games in 2025-26 season: ${allGames2025.rows.length}`);
    allGames2025.rows.forEach((game, index) => {
      console.log(`     ${index + 1}. ${game.home_team} vs ${game.away_team} (ID: ${game.id})`);
    });
    
    // Games WITH match_odds in 2025-26 season
    const gamesWithOdds2025 = await pool.query(`
      SELECT DISTINCT g.id, g.home_team, g.away_team, g.commence_time
      FROM games g 
      JOIN match_odds mo ON g.id = mo.game_id
      WHERE g.commence_time >= '2025-08-01' AND g.commence_time <= '2026-05-31'
      ORDER BY g.commence_time
    `);
    console.log(`\n   Games WITH match_odds in 2025-26 season: ${gamesWithOdds2025.rows.length}`);
    gamesWithOdds2025.rows.forEach((game, index) => {
      console.log(`     ${index + 1}. ${game.home_team} vs ${game.away_team} (ID: ${game.id})`);
    });
    
    // Games WITHOUT match_odds in 2025-26 season
    const gamesWithoutOdds2025 = await pool.query(`
      SELECT g.id, g.home_team, g.away_team, g.commence_time
      FROM games g 
      LEFT JOIN match_odds mo ON g.id = mo.game_id
      WHERE g.commence_time >= '2025-08-01' 
        AND g.commence_time <= '2026-05-31'
        AND mo.game_id IS NULL
      ORDER BY g.commence_time
    `);
    console.log(`\n   Games WITHOUT match_odds in 2025-26 season: ${gamesWithoutOdds2025.rows.length}`);
    gamesWithoutOdds2025.rows.forEach((game, index) => {
      console.log(`     ${index + 1}. ${game.home_team} vs ${game.away_team} (ID: ${game.id})`);
    });
    
    // 8. Check 2024-25 season specifically
    console.log('\n8. 2024-25 SEASON ANALYSIS:');
    const games2024 = await pool.query(`
      SELECT id, home_team, away_team, commence_time
      FROM games 
      WHERE commence_time >= '2024-08-01' AND commence_time <= '2025-05-31'
      ORDER BY commence_time
    `);
    console.log(`   All games in 2024-25 season: ${games2024.rows.length}`);
    
    const gamesWithOdds2024 = await pool.query(`
      SELECT DISTINCT g.id, g.home_team, g.away_team, g.commence_time
      FROM games g 
      JOIN match_odds mo ON g.id = mo.game_id
      WHERE g.commence_time >= '2024-08-01' AND g.commence_time <= '2025-05-31'
      ORDER BY g.commence_time
    `);
    console.log(`   Games WITH match_odds in 2024-25 season: ${gamesWithOdds2024.rows.length}`);
    gamesWithOdds2024.rows.forEach((game, index) => {
      console.log(`     ${index + 1}. ${game.home_team} vs ${game.away_team} (ID: ${game.id})`);
    });
    
    console.log('\n=== END ANALYSIS ===');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkDatabase(); 