const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('Testing API endpoints...');
    
    // Test teams endpoint for Bundesliga
    console.log('\n1. Testing /api/teams for Bundesliga:');
    const teamsResponse = await fetch('http://localhost:5000/api/teams?season=2025-26&league=soccer_germany_bundesliga');
    const teamsData = await teamsResponse.json();
    console.log(`Bundesliga teams: ${teamsData.length} teams`);
    console.log('First 5 teams:', teamsData.slice(0, 5));
    
    // Test matches endpoint for Bundesliga
    console.log('\n2. Testing /api/matches for Bundesliga:');
    const matchesResponse = await fetch('http://localhost:5000/api/matches?season=2025-26&league=soccer_germany_bundesliga');
    const matchesData = await matchesResponse.json();
    console.log(`Bundesliga matches: ${matchesData.length} matches`);
    console.log('First 3 matches:', matchesData.slice(0, 3));
    
    // Test matches endpoint for Premier League
    console.log('\n3. Testing /api/matches for Premier League:');
    const eplMatchesResponse = await fetch('http://localhost:5000/api/matches?season=2025-26&league=soccer_epl');
    const eplMatchesData = await eplMatchesResponse.json();
    console.log(`Premier League matches: ${eplMatchesData.length} matches`);
    console.log('First 3 matches:', eplMatchesData.slice(0, 3));
    
    // Test matches endpoint for La Liga
    console.log('\n4. Testing /api/matches for La Liga:');
    const laligaMatchesResponse = await fetch('http://localhost:5000/api/matches?season=2025-26&league=soccer_spain_la_liga');
    const laligaMatchesData = await laligaMatchesResponse.json();
    console.log(`La Liga matches: ${laligaMatchesData.length} matches`);
    console.log('First 3 matches:', laligaMatchesData.slice(0, 3));
    
    // Test matches endpoint for Serie A
    console.log('\n5. Testing /api/matches for Serie A:');
    const serieAMatchesResponse = await fetch('http://localhost:5000/api/matches?season=2025-26&league=soccer_italy_serie_a');
    const serieAMatchesData = await serieAMatchesResponse.json();
    console.log(`Serie A matches: ${serieAMatchesData.length} matches`);
    console.log('First 3 matches:', serieAMatchesData.slice(0, 3));
    
    // Test matches endpoint for Ligue 1
    console.log('\n6. Testing /api/matches for Ligue 1:');
    const ligue1MatchesResponse = await fetch('http://localhost:5000/api/matches?season=2025-26&league=soccer_france_ligue_one');
    const ligue1MatchesData = await ligue1MatchesResponse.json();
    console.log(`Ligue 1 matches: ${ligue1MatchesData.length} matches`);
    console.log('First 3 matches:', ligue1MatchesData.slice(0, 3));
    
    // Test matches endpoint for Champions League
    console.log('\n7. Testing /api/matches for Champions League:');
    const championsLeagueMatchesResponse = await fetch('http://localhost:5000/api/matches?season=2025-26&league=soccer_uefa_champs_league');
    const championsLeagueMatchesData = await championsLeagueMatchesResponse.json();
    console.log(`Champions League matches: ${championsLeagueMatchesData.length} matches`);
    console.log('First 3 matches:', championsLeagueMatchesData.slice(0, 3));
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testAPI(); 