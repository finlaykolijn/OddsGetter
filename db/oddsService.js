"use strict";
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
exports.OddsService = void 0;
var config_1 = require("./config");
var OddsService = /** @class */ (function () {
    function OddsService() {
    }
    OddsService.prototype.saveGame = function (game) {
        return __awaiter(this, void 0, void 0, function () {
            var client, existingGameResult, gameId, existingGameId, existingGame, existingTime, newTime, timeDiff, hoursDiff, gameResult, _i, _a, bookmaker, bookmakerResult, bookmakerId, h2hMarket, homeWinOutcome, awayWinOutcome, drawOutcome, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, config_1.default.connect()];
                    case 1:
                        client = _b.sent();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 16, 18, 19]);
                        return [4 /*yield*/, client.query('BEGIN')];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, client.query("SELECT id, game_id, commence_time FROM games \n                 WHERE home_team = $1 AND away_team = $2 AND sport_key = $3", [game.home_team, game.away_team, game.sport_key])];
                    case 4:
                        existingGameResult = _b.sent();
                        gameId = void 0;
                        existingGameId = null;
                        if (!(existingGameResult.rows.length > 0)) return [3 /*break*/, 7];
                        existingGame = existingGameResult.rows[0];
                        gameId = existingGame.id;
                        existingGameId = existingGame.game_id;
                        existingTime = new Date(existingGame.commence_time);
                        newTime = new Date(game.commence_time);
                        timeDiff = Math.abs(newTime.getTime() - existingTime.getTime());
                        hoursDiff = timeDiff / (1000 * 60 * 60);
                        if (!(hoursDiff <= 24)) return [3 /*break*/, 6];
                        // Times are within 24 hours, update with the new time
                        return [4 /*yield*/, client.query("UPDATE games SET commence_time = $1 WHERE id = $2", [game.commence_time, gameId])];
                    case 5:
                        // Times are within 24 hours, update with the new time
                        _b.sent();
                        _b.label = 6;
                    case 6: return [3 /*break*/, 9];
                    case 7: return [4 /*yield*/, client.query("INSERT INTO games (game_id, sport_key, sport_title, commence_time, home_team, away_team)\n                     VALUES ($1, $2, $3, $4, $5, $6)\n                     RETURNING id", [game.id, game.sport_key, game.sport_title, game.commence_time, game.home_team, game.away_team])];
                    case 8:
                        gameResult = _b.sent();
                        gameId = gameResult.rows[0].id;
                        _b.label = 9;
                    case 9:
                        _i = 0, _a = game.bookmakers;
                        _b.label = 10;
                    case 10:
                        if (!(_i < _a.length)) return [3 /*break*/, 14];
                        bookmaker = _a[_i];
                        return [4 /*yield*/, client.query("INSERT INTO bookmakers (bookmaker_key, title, last_update)\n                     VALUES ($1, $2, $3)\n                     ON CONFLICT (bookmaker_key) DO UPDATE\n                     SET title = $2, last_update = $3\n                     RETURNING id", [bookmaker.key, bookmaker.title, bookmaker.last_update])];
                    case 11:
                        bookmakerResult = _b.sent();
                        bookmakerId = bookmakerResult.rows[0].id;
                        h2hMarket = bookmaker.markets.find(function (m) { return m.key === 'h2h'; });
                        if (!h2hMarket) return [3 /*break*/, 13];
                        homeWinOutcome = h2hMarket.outcomes.find(function (o) { return o.name === game.home_team; });
                        awayWinOutcome = h2hMarket.outcomes.find(function (o) { return o.name === game.away_team; });
                        drawOutcome = h2hMarket.outcomes.find(function (o) { return o.name === 'Draw'; });
                        if (!(homeWinOutcome && awayWinOutcome && drawOutcome)) return [3 /*break*/, 13];
                        // Insert or update match odds
                        return [4 /*yield*/, client.query("INSERT INTO match_odds \n                             (game_id, bookmaker_id, home_win_odds, draw_odds, away_win_odds, last_updated)\n                             VALUES ($1, $2, $3, $4, $5, $6)\n                             ON CONFLICT (game_id, bookmaker_id) DO UPDATE\n                             SET home_win_odds = $3, draw_odds = $4, away_win_odds = $5, last_updated = $6", [
                                gameId,
                                bookmakerId,
                                homeWinOutcome.price,
                                drawOutcome.price,
                                awayWinOutcome.price,
                                new Date()
                            ])];
                    case 12:
                        // Insert or update match odds
                        _b.sent();
                        _b.label = 13;
                    case 13:
                        _i++;
                        return [3 /*break*/, 10];
                    case 14: return [4 /*yield*/, client.query('COMMIT')];
                    case 15:
                        _b.sent();
                        return [3 /*break*/, 19];
                    case 16:
                        error_1 = _b.sent();
                        return [4 /*yield*/, client.query('ROLLBACK')];
                    case 17:
                        _b.sent();
                        throw error_1;
                    case 18:
                        client.release();
                        return [7 /*endfinally*/];
                    case 19: return [2 /*return*/];
                }
            });
        });
    };
    OddsService.prototype.getBestOddsForMatch = function (homeTeam, awayTeam) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, config_1.default.query("SELECT \n                g.home_team,\n                g.away_team,\n                g.commence_time,\n                b.title as bookmaker,\n                mo.home_win_odds,\n                mo.draw_odds,\n                mo.away_win_odds,\n                mo.last_updated\n            FROM games g\n            JOIN match_odds mo ON g.id = mo.game_id\n            JOIN bookmakers b ON mo.bookmaker_id = b.id\n            WHERE g.home_team = $1 \n                AND g.away_team = $2\n                AND g.commence_time > CURRENT_TIMESTAMP\n            ORDER BY mo.last_updated DESC", [homeTeam, awayTeam])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.rows];
                }
            });
        });
    };
    OddsService.prototype.getBestOddsForTeam = function (teamName) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, config_1.default.query("SELECT \n                g.home_team,\n                g.away_team,\n                g.commence_time,\n                b.title as bookmaker,\n                CASE \n                    WHEN g.home_team = $1 THEN mo.home_win_odds\n                    ELSE mo.away_win_odds\n                END as team_win_odds,\n                mo.draw_odds,\n                mo.last_updated\n            FROM games g\n            JOIN match_odds mo ON g.id = mo.game_id\n            JOIN bookmakers b ON mo.bookmaker_id = b.id\n            WHERE (g.home_team = $1 OR g.away_team = $1)\n                AND g.commence_time > CURRENT_TIMESTAMP\n            ORDER BY g.commence_time ASC, team_win_odds DESC", [teamName])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.rows];
                }
            });
        });
    };
    OddsService.prototype.getUpcomingMatches = function (leagueKey) {
        if (leagueKey === void 0) { leagueKey = 'soccer_epl'; }
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, config_1.default.query("SELECT \n                g.home_team,\n                g.away_team,\n                g.commence_time,\n                b.title as bookmaker,\n                mo.home_win_odds,\n                mo.draw_odds,\n                mo.away_win_odds,\n                mo.last_updated\n            FROM games g\n            JOIN match_odds mo ON g.id = mo.game_id\n            JOIN bookmakers b ON mo.bookmaker_id = b.id\n            WHERE g.sport_key = $1\n                AND g.commence_time > CURRENT_TIMESTAMP\n            ORDER BY g.commence_time ASC, b.title", [leagueKey])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.rows];
                }
            });
        });
    };
    // Backward compatibility method
    OddsService.prototype.getUpcomingPremierLeagueMatches = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getUpcomingMatches('soccer_epl')];
            });
        });
    };
    return OddsService;
}());
exports.OddsService = OddsService;
