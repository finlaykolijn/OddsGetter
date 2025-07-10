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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const init_1 = require("../db/init");
const oddsService_1 = require("../db/oddsService");
const oddsApi_1 = require("./oddsApi");
const fs = __importStar(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Initialize database
            console.log('Initializing database...');
            yield (0, init_1.initializeDatabase)();
            console.log('Database initialized successfully!');
            // Initialize services
            const apiKey = process.env.ODDS_API_KEY;

            if (!apiKey) {
              console.error('Error: ODDS_API_KEY environment variable is required');
              console.error('Please set ODDS_API_KEY in your .env file');
              process.exit(1);
            }

            const client = new oddsApi_1.OddsApiClient(apiKey);
            const oddsService = new oddsService_1.OddsService();
            // Get Premier League odds
            console.log('\nFetching Premier League odds...');
            const plOdds = yield client.getPremierLeagueOdds();
            console.log(`Found ${plOdds.length} Premier League games with odds:`);
            // Save each game to the database
            for (const game of plOdds) {
                console.log(`\nSaving ${game.home_team} vs ${game.away_team} to database...`);
                yield oddsService.saveGame(game);
                // Display the odds
                console.log(`\n${game.home_team} vs ${game.away_team} (${new Date(game.commence_time).toLocaleString()})`);
                game.bookmakers.forEach(bookmaker => {
                    console.log(`  ${bookmaker.title} odds:`);
                    bookmaker.markets.forEach(market => {
                        if (market.key === 'h2h') {
                            market.outcomes.forEach(outcome => {
                                console.log(`    ${outcome.name}: ${outcome.price}`);
                            });
                        }
                    });
                });
            }
            // Save backup JSON file
            fs.writeFileSync('premier_league_odds.json', JSON.stringify(plOdds, null, 2));
            console.log('\nSaved odds data to premier_league_odds.json');
            // Test query
            // const teamName = 'Liverpool';
            // console.log(`\nQuerying odds for ${teamName}...`);
            // const liverpoolOdds = await oddsService.getTeamOdds(teamName);
            // console.log(`Found ${liverpoolOdds.length} odds entries for ${teamName}`);
            // if (liverpoolOdds.length > 0) {
            //     console.log('\nSample odds data from database:');
            //     console.log(JSON.stringify(liverpoolOdds[0], null, 2));
            // }
        }
        catch (error) {
            console.error('Error:', error);
        }
    });
}
main();
