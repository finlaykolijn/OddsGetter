const pool = require('./db/config').default;

async function checkDatabase() {
  try {
    console.log('Checking database contents...\n');

    // Check all teams in database
    console.log('=== All Teams in Database ===');
    const teamsResult = await pool.query(`
      SELECT DISTINCT home_team as team FROM games 
      UNION 
      SELECT DISTINCT away_team as team FROM games 
      ORDER BY team
    `);
    console.log(`Total teams: ${teamsResult.rows.length}`);
    console.log('Teams:', teamsResult.rows.map(r => r.team));

    // Check all games
    console.log('\n=== All Games in Database ===');
    const gamesResult = await pool.query(`
      SELECT home_team, away_team, commence_time 
      FROM games 
      ORDER BY commence_time DESC
      LIMIT 10
    `);
    console.log(`Total games: ${gamesResult.rows.length}`);
    gamesResult.rows.forEach(game => {
      console.log(`${game.home_team} vs ${game.away_team} - ${new Date(game.commence_time).toLocaleDateString()}`);
    });

    // Check match odds
    console.log('\n=== Match Odds Count ===');
    const oddsResult = await pool.query(`
      SELECT COUNT(*) as count FROM match_odds
    `);
    console.log(`Total match odds records: ${oddsResult.rows[0].count}`);

  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await pool.end();
  }
}

checkDatabase(); 