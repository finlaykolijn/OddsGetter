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
const fs = __importStar(require("fs"));
// You would replace this with your actual API key
const API_KEY = process.env.ODDS_API_KEY || 'YOUR_API_KEY';
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new oddsApi_1.OddsApiClient(API_KEY);
        try {
            // First, let's get all available sports
            console.log('Fetching available sports...');
            const sports = yield client.getSports();
            // Find Premier League in the sports list
            const premierLeague = sports.find(sport => sport.key === 'soccer_epl');
            console.log('Premier League info:', premierLeague);
            // Get Premier League odds
            console.log('\nFetching Premier League odds for FanDuel and DraftKings...');
            const plOdds = yield client.getPremierLeagueOdds();
            // Display the odds
            console.log(`\nFound ${plOdds.length} Premier League games with odds:`);
            plOdds.forEach(game => {
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
            });
            // Save the data to a JSON file
            fs.writeFileSync('premier_league_odds.json', JSON.stringify(plOdds, null, 2));
            console.log('\nSaved odds data to premier_league_odds.json');
        }
        catch (error) {
            console.error('Error:', error);
        }
    });
}
main();
