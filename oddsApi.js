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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OddsApiClient = void 0;
const axios_1 = __importDefault(require("axios"));
class OddsApiClient {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }
    /**
     * Get a list of available sports
     */
    getSports() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get('https://api.the-odds-api.com/v4/sports', {
                    params: {
                        apiKey: this.apiKey
                    }
                });
                return response.data;
            }
            catch (error) {
                this.handleApiError(error);
                throw error;
            }
        });
    }
    /**
     * Get odds for a specific sport
     * @param sportKey - The sport key (e.g., 'soccer_epl' for Premier League)
     * @param options - Options for the API request
     */
    getOdds(sportKey_1) {
        return __awaiter(this, arguments, void 0, function* (sportKey, options = {}) {
            const { regions = 'us', markets = 'h2h', oddsFormat = 'decimal', dateFormat = 'iso', bookmakers } = options;
            try {
                const response = yield axios_1.default.get(`https://api.the-odds-api.com/v4/sports/${sportKey}/odds`, {
                    params: {
                        apiKey: this.apiKey,
                        regions,
                        markets,
                        oddsFormat,
                        dateFormat,
                        bookmakers
                    }
                });
                console.log('Remaining requests:', response.headers['x-requests-remaining']);
                console.log('Used requests:', response.headers['x-requests-used']);
                return response.data;
            }
            catch (error) {
                this.handleApiError(error);
                throw error;
            }
        });
    }
    /**
     * Get Premier League odds specifically for FanDuel and DraftKings
     */
    getPremierLeagueOdds() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getOdds('soccer_epl', {
                regions: 'us',
                markets: 'h2h', // Win/Draw/Lose odds
                bookmakers: 'fanduel,draftkings'
            });
        });
    }
    handleApiError(error) {
        if (error.response) {
            console.error('Error status:', error.response.status);
            console.error('Error data:', error.response.data);
        }
        else {
            console.error('Error:', error.message);
        }
    }
}
exports.OddsApiClient = OddsApiClient;
// Example usage:
// const client = new OddsApiClient('YOUR_API_KEY');
// client.getPremierLeagueOdds().then(data => console.log(data)); 
