const http = require('http');

function testAPI(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

async function testLeagueFiltering() {
  try {
    console.log('Testing league filtering...\n');
    
    // Test Bundesliga matches
    console.log('1. Testing Bundesliga matches:');
    const bundesligaMatches = await testAPI('http://localhost:5000/api/matches?season=2025-26&league=soccer_germany_bundesliga');
    console.log(`Bundesliga matches: ${bundesligaMatches.length} matches`);
    if (bundesligaMatches.length > 0) {
      console.log('Sample matches:', bundesligaMatches.slice(0, 3).map(m => `${m.home_team} vs ${m.away_team}`));
    }
    
    // Test Premier League matches
    console.log('\n2. Testing Premier League matches:');
    const eplMatches = await testAPI('http://localhost:5000/api/matches?season=2025-26&league=soccer_epl');
    console.log(`Premier League matches: ${eplMatches.length} matches`);
    if (eplMatches.length > 0) {
      console.log('Sample matches:', eplMatches.slice(0, 3).map(m => `${m.home_team} vs ${m.away_team}`));
    }
    
    // Test La Liga matches
    console.log('\n3. Testing La Liga matches:');
    const laligaMatches = await testAPI('http://localhost:5000/api/matches?season=2025-26&league=soccer_spain_la_liga');
    console.log(`La Liga matches: ${laligaMatches.length} matches`);
    if (laligaMatches.length > 0) {
      console.log('Sample matches:', laligaMatches.slice(0, 3).map(m => `${m.home_team} vs ${m.away_team}`));
    }
    
    // Test teams for different leagues
    console.log('\n4. Testing teams for different leagues:');
    const bundesligaTeams = await testAPI('http://localhost:5000/api/teams?season=2025-26&league=soccer_germany_bundesliga');
    console.log(`Bundesliga teams: ${bundesligaTeams.length} teams`);
    if (bundesligaTeams.length > 0) {
      console.log('Sample teams:', bundesligaTeams.slice(0, 5).map(t => t.team));
    }
    
    const eplTeams = await testAPI('http://localhost:5000/api/teams?season=2025-26&league=soccer_epl');
    console.log(`Premier League teams: ${eplTeams.length} teams`);
    if (eplTeams.length > 0) {
      console.log('Sample teams:', eplTeams.slice(0, 5).map(t => t.team));
    }
    
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

testLeagueFiltering(); 