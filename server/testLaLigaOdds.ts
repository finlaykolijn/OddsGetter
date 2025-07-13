import { OddsApiClient } from './oddsApi';
import * as dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.ODDS_API_KEY || '';

if (!API_KEY) {
  console.error('Error: ODDS_API_KEY not found in environment variables or .env file');
  process.exit(1);
}

async function main() {
  const client = new OddsApiClient(API_KEY);
  try {
    console.log('Fetching La Liga odds...');
    const odds = await client.getLeagueOdds('soccer_spain_la_liga');
    console.log(`Found ${odds.length} La Liga games with odds.`);
    if (odds.length > 0) {
      console.log('Sample game:', JSON.stringify(odds[0], null, 2));
    } else {
      console.log('No La Liga games found with odds.');
    }
  } catch (error) {
    console.error('Error fetching La Liga odds:', error);
  }
}

main(); 