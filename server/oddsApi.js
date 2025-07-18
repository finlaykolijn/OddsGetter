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
exports.OddsApiClient = void 0;
var axios_1 = require("axios");
var OddsApiClient = /** @class */ (function () {
    function OddsApiClient(apiKey) {
        this.apiKey = apiKey;
    }
    //Gets list of all available sports
    OddsApiClient.prototype.getSports = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1.default.get('https://api.the-odds-api.com/v4/sports', {
                                params: {
                                    apiKey: this.apiKey
                                }
                            })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 2:
                        error_1 = _a.sent();
                        this.handleApiError(error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @param sportKey The sport key
     * @param options Options for the API request
     */
    OddsApiClient.prototype.getOdds = function (sportKey_1) {
        return __awaiter(this, arguments, void 0, function (sportKey, options) {
            var _a, regions, _b, markets, _c, oddsFormat, _d, dateFormat, bookmakers, response, error_2;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _a = options.regions, regions = _a === void 0 ? 'us' : _a, _b = options.markets, markets = _b === void 0 ? 'h2h' : _b, _c = options.oddsFormat, oddsFormat = _c === void 0 ? 'decimal' : _c, _d = options.dateFormat, dateFormat = _d === void 0 ? 'iso' : _d, bookmakers = options.bookmakers;
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1.default.get("https://api.the-odds-api.com/v4/sports/".concat(sportKey, "/odds"), {
                                params: {
                                    apiKey: this.apiKey,
                                    regions: regions,
                                    markets: markets,
                                    oddsFormat: oddsFormat,
                                    dateFormat: dateFormat,
                                    bookmakers: bookmakers
                                }
                            })];
                    case 2:
                        response = _e.sent();
                        console.log('Remaining requests:', response.headers['x-requests-remaining']);
                        console.log('Used requests:', response.headers['x-requests-used']);
                        return [2 /*return*/, response.data];
                    case 3:
                        error_2 = _e.sent();
                        this.handleApiError(error_2);
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get odds for a specific league by its sport key
     */
    OddsApiClient.prototype.getLeagueOdds = function (leagueKey) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getOdds(leagueKey, {
                        regions: 'us',
                        markets: 'h2h',
                        bookmakers: 'fanduel,draftkings', // Can edit this to get other bookmakers
                    })];
            });
        });
    };
    // Deprecated: Use getLeagueOdds instead
    OddsApiClient.prototype.getPremierLeagueOdds = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getLeagueOdds('soccer_epl')];
            });
        });
    };
    OddsApiClient.prototype.handleApiError = function (error) {
        if (error.response) {
            console.error('Error status:', error.response.status);
            console.error('Error data:', error.response.data);
        }
        else {
            console.error('Error:', error.message);
        }
    };
    return OddsApiClient;
}());
exports.OddsApiClient = OddsApiClient;
