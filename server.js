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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const config_1 = __importDefault(require("./db/config"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// API Routes
app.get('/api/teams', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield config_1.default.query(`
      SELECT DISTINCT home_team as team FROM games 
      UNION 
      SELECT DISTINCT away_team as team FROM games 
      ORDER BY team
    `);
        res.json(result.rows);
    }
    catch (error) {
        console.error('Error fetching teams:', error);
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
}));
app.get('/api/matches', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { homeTeam, awayTeam } = req.query;
        let query = `
      SELECT 
        g.home_team,
        g.away_team,
        g.commence_time,
        b.title as bookmaker,
        mo.home_win_odds,
        mo.draw_odds,
        mo.away_win_odds,
        mo.last_updated
      FROM games g
      JOIN match_odds mo ON g.id = mo.game_id
      JOIN bookmakers b ON mo.bookmaker_id = b.id
      WHERE g.commence_time > CURRENT_TIMESTAMP
    `;
        const params = [];
        if (homeTeam) {
            params.push(homeTeam);
            query += ` AND g.home_team = $${params.length}`;
        }
        if (awayTeam) {
            params.push(awayTeam);
            query += ` AND g.away_team = $${params.length}`;
        }
        query += ` ORDER BY g.commence_time ASC, mo.last_updated DESC`;
        const result = yield config_1.default.query(query, params);
        res.json(result.rows);
    }
    catch (error) {
        console.error('Error fetching matches:', error);
        res.status(500).json({ error: 'Failed to fetch matches' });
    }
}));
app.get('/api/bookmakers', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield config_1.default.query(`
      SELECT DISTINCT title FROM bookmakers 
      ORDER BY title
    `);
        res.json(result.rows);
    }
    catch (error) {
        console.error('Error fetching bookmakers:', error);
        res.status(500).json({ error: 'Failed to fetch bookmakers' });
    }
}));
app.get('/api/odds/:homeTeam/:awayTeam', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { homeTeam, awayTeam } = req.params;
        const result = yield config_1.default.query(`
      SELECT 
        g.home_team,
        g.away_team,
        g.commence_time,
        b.title as bookmaker,
        mo.home_win_odds,
        mo.draw_odds,
        mo.away_win_odds,
        mo.last_updated
      FROM games g
      JOIN match_odds mo ON g.id = mo.game_id
      JOIN bookmakers b ON mo.bookmaker_id = b.id
      WHERE g.home_team = $1 
        AND g.away_team = $2
        AND g.commence_time > CURRENT_TIMESTAMP
      ORDER BY mo.last_updated DESC
    `, [homeTeam, awayTeam]);
        res.json(result.rows);
    }
    catch (error) {
        console.error('Error fetching odds:', error);
        res.status(500).json({ error: 'Failed to fetch odds' });
    }
}));
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
