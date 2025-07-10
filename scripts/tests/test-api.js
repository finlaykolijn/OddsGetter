const axios = require('axios');

async function testAPI() {
  console.log('Testing OddsGetter API...\n');

  try {
    // Test teams endpoint
    console.log('1. Testing /api/teams...');
    const teamsResponse = await axios.get('http://localhost:5000/api/teams');
    console.log(`Teams endpoint working! Found ${teamsResponse.data.length} teams`);
    console.log(`   Sample teams: ${teamsResponse.data.slice(0, 3).map(t => t.team).join(', ')}...\n`);

    // Test matches endpoint
    console.log('2. Testing /api/matches...');
    const matchesResponse = await axios.get('http://localhost:5000/api/matches');
    console.log(`Matches endpoint working! Found ${matchesResponse.data.length} matches`);
    if (matchesResponse.data.length > 0) {
      const sampleMatch = matchesResponse.data[0];
      console.log(`   Sample match: ${sampleMatch.home_team} vs ${sampleMatch.away_team}`);
    }
    console.log('');

    // Test specific match odds
    console.log('3. Testing specific match odds...');
    const oddsResponse = await axios.get('http://localhost:5000/api/matches?homeTeam=Arsenal&awayTeam=Chelsea');
    console.log(`Specific odds endpoint working! Found ${oddsResponse.data.length} odds entries`);
    console.log('');

    console.log('All API tests passed! Your backend is working correctly.');
    console.log('\nFrontend should be available at: http://localhost:3001');
    console.log('Backend API is running at: http://localhost:5000');

  } catch (error) {
    console.error('API test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testAPI(); 