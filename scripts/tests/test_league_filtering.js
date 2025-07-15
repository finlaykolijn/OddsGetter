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
    
    // Test Serie A matches
    console.log('\n4. Testing Serie A matches:');
    const serieAMatches = await testAPI('http://localhost:5000/api/matches?season=2025-26&league=soccer_italy_serie_a');
    console.log(`Serie A matches: ${serieAMatches.length} matches`);
    if (serieAMatches.length > 0) {
      console.log('Sample matches:', serieAMatches.slice(0, 3).map(m => `${m.home_team} vs ${m.away_team}`));
    }
    
    // Test Ligue 1 matches
    console.log('\n5. Testing Ligue 1 matches:');
    const ligue1Matches = await testAPI('http://localhost:5000/api/matches?season=2025-26&league=soccer_france_ligue_one');
    console.log(`Ligue 1 matches: ${ligue1Matches.length} matches`);
    if (ligue1Matches.length > 0) {
      console.log('Sample matches:', ligue1Matches.slice(0, 3).map(m => `${m.home_team} vs ${m.away_team}`));
    }
    
    // Test Champions League matches
    console.log('\n6. Testing Champions League matches:');
    const championsLeagueMatches = await testAPI('http://localhost:5000/api/matches?season=2025-26&league=soccer_uefa_champs_league');
    console.log(`Champions League matches: ${championsLeagueMatches.length} matches`);
    if (championsLeagueMatches.length > 0) {
      console.log('Sample matches:', championsLeagueMatches.slice(0, 3).map(m => `${m.home_team} vs ${m.away_team}`));
    }
    
    // Test teams for different leagues
    console.log('\n7. Testing teams for different leagues:');
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
    
    const serieATeams = await testAPI('http://localhost:5000/api/teams?season=2025-26&league=soccer_italy_serie_a');
    console.log(`Serie A teams: ${serieATeams.length} teams`);
    if (serieATeams.length > 0) {
      console.log('Sample teams:', serieATeams.slice(0, 5).map(t => t.team));
    }
    
    const ligue1Teams = await testAPI('http://localhost:5000/api/teams?season=2025-26&league=soccer_france_ligue_one');
    console.log(`Ligue 1 teams: ${ligue1Teams.length} teams`);
    if (ligue1Teams.length > 0) {
      console.log('Sample teams:', ligue1Teams.slice(0, 5).map(t => t.team));
    }
    
    const championsLeagueTeams = await testAPI('http://localhost:5000/api/teams?season=2025-26&league=soccer_uefa_champs_league');
    console.log(`Champions League teams: ${championsLeagueTeams.length} teams`);
    if (championsLeagueTeams.length > 0) {
      console.log('Sample teams:', championsLeagueTeams.slice(0, 5).map(t => t.team));
    }
    
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

testLeagueFiltering(); 