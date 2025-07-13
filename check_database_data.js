const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'odds_database',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function checkDatabaseData() {
  try {
    console.log('Checking database data...\n');
    
    // Check distinct sport_keys
    console.log('1. Distinct sport_keys in games table:');
    const sportKeysResult = await pool.query('SELECT DISTINCT sport_key, sport_title FROM games ORDER BY sport_key');
    console.log('Sport keys found:', sportKeysResult.rows);
    
    // Check sample games for each sport_key
    for (const row of sportKeysResult.rows) {
      console.log(`\n2. Sample games for ${row.sport_key} (${row.sport_title}):`);
      const gamesResult = await pool.query(
        'SELECT home_team, away_team, commence_time FROM games WHERE sport_key = $1 LIMIT 5',
        [row.sport_key]
      );
      console.log('Sample games:', gamesResult.rows.map(g => `${g.home_team} vs ${g.away_team}`));
    }
    
    // Check total count for each sport_key
    console.log('\n3. Total games per sport_key:');
    const countResult = await pool.query(
      'SELECT sport_key, sport_title, COUNT(*) as count FROM games GROUP BY sport_key, sport_title ORDER BY sport_key'
    );
    console.log('Counts:', countResult.rows);
    
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await pool.end();
  }
}

checkDatabaseData(); 