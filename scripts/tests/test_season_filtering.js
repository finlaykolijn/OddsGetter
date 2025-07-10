async function testSeasonFiltering() {
  try {
    console.log('Testing season filtering...\n');

    const seasons = ['2025-26', '2024-25', '2023-24'];
    
    for (const season of seasons) {
      console.log(`\n=== Testing Season: ${season} ===`);
      
      // Test teams endpoint
      try {
        const teamsResponse = await fetch(`http://localhost:5000/api/teams?season=${season}`);
        const teamsData = await teamsResponse.json();
        console.log(`Teams (${teamsData.length}):`, teamsData.map(t => t.team));
      } catch (error) {
        console.error(`Error fetching teams for ${season}:`, error.message);
      }
      
      // Test matches endpoint
      try {
        const matchesResponse = await fetch(`http://localhost:5000/api/matches?season=${season}`);
        const matchesData = await matchesResponse.json();
        console.log(`Matches (${matchesData.length}):`, matchesData.slice(0, 3).map(m => `${m.home_team} vs ${m.away_team}`));
      } catch (error) {
        console.error(`Error fetching matches for ${season}:`, error.message);
      }
    }

    // Test seasons endpoint
    console.log('\n=== Testing Seasons Endpoint ===');
    try {
      const seasonsResponse = await fetch('http://localhost:5000/api/seasons');
      const seasonsData = await seasonsResponse.json();
      console.log('Available seasons:', seasonsData);
    } catch (error) {
      console.error('Error fetching seasons:', error.message);
    }

  } catch (error) {
    console.error('Error in test:', error);
  }
}

testSeasonFiltering(); 