"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const oddsApi_1 = require("./oddsApi");
const oddsService_1 = require("../db/oddsService");
const fs = __importStar(require("fs"));
const dotenv = __importStar(require("dotenv"));
// Load environment variables from .env file
dotenv.config();
// Get API key from environment variables
const API_KEY = process.env.ODDS_API_KEY || '';

// Check if API key is available
if (!API_KEY) {
  console.error('Error: ODDS_API_KEY not found in environment variables or .env file');
  console.error('Please ensure you have a valid API key in your .env file: ODDS_API_KEY=your_actual_api_key');
  process.exit(1);
}
// Function to deduplicate games by team names
function deduplicateGames(games) {
    const gameMap = new Map();
    for (const game of games) {
        const key = `${game.home_team}_${game.away_team}`;
        if (gameMap.has(key)) {
            // Game already exists, merge bookmakers
            const existingGame = gameMap.get(key);
            existingGame.bookmakers.push(...game.bookmakers);
        }
        else {
            // New game, add to map
            gameMap.set(key, Object.assign({}, game));
        }
    }
    return Array.from(gameMap.values());
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new oddsApi_1.OddsApiClient(API_KEY);
        const oddsService = new oddsService_1.OddsService();
        try {
            //Get all available sports
            console.log('Fetching available sports...');
            const sports = yield client.getSports();
            //Get Premier League in the sports list, key is soccer_epl
            const premierLeague = sports.find(sport => sport.key === 'soccer_epl');
            console.log('Premier League info:', premierLeague);
            //Get Premier League odds
            console.log('\nFetching Premier League odds for selected bookmakers...');
            const plOdds = yield client.getPremierLeagueOdds();
            // Deduplicate games by team names
            const deduplicatedOdds = deduplicateGames(plOdds);
            //Display the odds for FanDuel and DraftKings (Could add whichever bookmaker I want in oddsApi.ts)
            console.log(`\nFound ${deduplicatedOdds.length} Premier League games with odds (after deduplication):`);
            // Save each game to the database
            for (const game of deduplicatedOdds) {
                console.log(`\nSaving ${game.home_team} vs ${game.away_team} to database...`);
                yield oddsService.saveGame(game);
                // Display the odds
                console.log(`\n${game.home_team} vs ${game.away_team} (${new Date(game.commence_time).toLocaleString()})`);
                game.bookmakers.forEach((bookmaker) => {
                    console.log(`  ${bookmaker.title} odds:`);
                    bookmaker.markets.forEach((market) => {
                        if (market.key === 'h2h') { // Can edit this to get other markets
                            market.outcomes.forEach((outcome) => {
                                console.log(`    ${outcome.name}: ${outcome.price}`);
                            });
                        }
                    });
                });
            }
            //Save the deduplicated data to a JSON file as backup
            fs.writeFileSync('premier_league_odds.json', JSON.stringify(deduplicatedOdds, null, 2));
            console.log('\nSaved deduplicated odds data to premier_league_odds.json');
            // // Example: Query odds for a specific team - *******look at later
            // const teamName = 'Liverpool';
            // console.log(`\nQuerying odds for ${teamName}...`);
            // const liverpoolOdds = await oddsService.getTeamOdds(teamName);
            // console.log(`Found ${liverpoolOdds.length} odds entries for ${teamName}`);
        }
        catch (error) {
            console.error('Error:', error);
        }
    });
}
main();
