const pool = require('../../db/config').default;

async function testSeasons() {
  try {
    console.log('Testing season data...\n');

    // Test teams endpoint for different seasons
    console.log('=== Testing Teams ===');
    
    const seasons = ['2025-26', '2024-25', '2023-24'];
    
    for (const season of seasons) {
      console.log(`\n--- Season: ${season} ---`);
      
      // Test teams
      const teamsResponse = await fetch(`http://localhost:5000/api/teams?season=${season}`);
      const teamsData = await teamsResponse.json();
      console.log(`Teams (${teamsData.length}):`, teamsData.map(t => t.team).slice(0, 5), '...');
      
      // Test matches
      const matchesResponse = await fetch(`http://localhost:5000/api/matches?season=${season}`);
      const matchesData = await matchesResponse.json();
      console.log(`Matches (${matchesData.length}):`, matchesData.slice(0, 3).map(m => `${m.home_team} vs ${m.away_team}`));
    }

    // Test seasons endpoint
    console.log('\n=== Testing Seasons Endpoint ===');
    const seasonsResponse = await fetch('http://localhost:5000/api/seasons');
    const seasonsData = await seasonsResponse.json();
    console.log('Available seasons:', seasonsData);

  } catch (error) {
    console.error('Error testing seasons:', error);
  } finally {
    await pool.end();
  }
}

testSeasons(); 