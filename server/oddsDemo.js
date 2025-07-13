"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var oddsApi_1 = require("./oddsApi");
var oddsService_1 = require("../db/oddsService");
var fs = require("fs");
var dotenv = require("dotenv");
// Load environment variables from .env file
dotenv.config();
// Get API key from environment variables
var API_KEY = process.env.ODDS_API_KEY || '';
// Check if API key is available
if (!API_KEY) {
    console.error('Error: ODDS_API_KEY not found in environment variables or .env file');
    console.error('Please ensure you have a valid API key in your .env file: ODDS_API_KEY=your_actual_api_key');
    process.exit(1);
}
// Function to deduplicate games by team names
function deduplicateGames(games) {
    var _a;
    var gameMap = new Map();
    for (var _i = 0, games_1 = games; _i < games_1.length; _i++) {
        var game = games_1[_i];
        var key = "".concat(game.home_team, "_").concat(game.away_team);
        if (gameMap.has(key)) {
            // Game already exists, merge bookmakers
            var existingGame = gameMap.get(key);
            (_a = existingGame.bookmakers).push.apply(_a, game.bookmakers);
        }
        else {
            // New game, add to map
            gameMap.set(key, __assign({}, game));
        }
    }
    return Array.from(gameMap.values());
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var client, oddsService, sports, leagues, _loop_1, _i, leagues_1, league, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    client = new oddsApi_1.OddsApiClient(API_KEY);
                    oddsService = new oddsService_1.OddsService();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    //Get all available sports
                    console.log('Fetching available sports...');
                    return [4 /*yield*/, client.getSports()];
                case 2:
                    sports = _a.sent();
                    leagues = [
                        { name: 'Premier League', key: 'soccer_epl' },
                        { name: 'La Liga', key: 'soccer_spain_la_liga' },
                        { name: 'Bundesliga', key: 'soccer_germany_bundesliga' },
                    ];
                    _loop_1 = function (league) {
                        var leagueInfo, odds, deduplicatedOdds, _b, deduplicatedOdds_1, game, filename, error_2;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    console.log("\n=== Testing ".concat(league.name, " ==="));
                                    leagueInfo = sports.find(function (sport) { return sport.key === league.key; });
                                    if (!leagueInfo) {
                                        console.log("".concat(league.name, " not found in available sports"));
                                        return [2 /*return*/, "continue"];
                                    }
                                    console.log("".concat(league.name, " info:"), leagueInfo);
                                    // Get odds for this league
                                    console.log("\nFetching ".concat(league.name, " odds for selected bookmakers..."));
                                    _c.label = 1;
                                case 1:
                                    _c.trys.push([1, 7, , 8]);
                                    return [4 /*yield*/, client.getLeagueOdds(league.key)];
                                case 2:
                                    odds = _c.sent();
                                    if (odds.length === 0) {
                                        console.log("No ".concat(league.name, " games found with odds"));
                                        return [2 /*return*/, "continue"];
                                    }
                                    deduplicatedOdds = deduplicateGames(odds);
                                    console.log("\nFound ".concat(deduplicatedOdds.length, " ").concat(league.name, " games with odds (after deduplication):"));
                                    _b = 0, deduplicatedOdds_1 = deduplicatedOdds;
                                    _c.label = 3;
                                case 3:
                                    if (!(_b < deduplicatedOdds_1.length)) return [3 /*break*/, 6];
                                    game = deduplicatedOdds_1[_b];
                                    console.log("\nSaving ".concat(game.home_team, " vs ").concat(game.away_team, " to database..."));
                                    return [4 /*yield*/, oddsService.saveGame(game)];
                                case 4:
                                    _c.sent();
                                    // Display the odds
                                    console.log("\n".concat(game.home_team, " vs ").concat(game.away_team, " (").concat(new Date(game.commence_time).toLocaleString(), ")"));
                                    game.bookmakers.forEach(function (bookmaker) {
                                        console.log("  ".concat(bookmaker.title, " odds:"));
                                        bookmaker.markets.forEach(function (market) {
                                            if (market.key === 'h2h') {
                                                market.outcomes.forEach(function (outcome) {
                                                    console.log("    ".concat(outcome.name, ": ").concat(outcome.price));
                                                });
                                            }
                                        });
                                    });
                                    _c.label = 5;
                                case 5:
                                    _b++;
                                    return [3 /*break*/, 3];
                                case 6:
                                    filename = "".concat(league.name.toLowerCase().replace(/\s+/g, '_'), "_odds.json");
                                    fs.writeFileSync(filename, JSON.stringify(deduplicatedOdds, null, 2));
                                    console.log("\nSaved deduplicated odds data to ".concat(filename));
                                    return [3 /*break*/, 8];
                                case 7:
                                    error_2 = _c.sent();
                                    console.error("Error fetching ".concat(league.name, " odds:"), error_2);
                                    return [3 /*break*/, 8];
                                case 8: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, leagues_1 = leagues;
                    _a.label = 3;
                case 3:
                    if (!(_i < leagues_1.length)) return [3 /*break*/, 6];
                    league = leagues_1[_i];
                    return [5 /*yield**/, _loop_1(league)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [3 /*break*/, 8];
                case 7:
                    error_1 = _a.sent();
                    console.error('Error:', error_1);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
main();
