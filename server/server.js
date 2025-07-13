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
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = require("fs");
const path_1 = require("path");
const config_1 = __importDefault(require("../db/config"));

// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;

// Define season date ranges
const SEASON_DATE_RANGES = {
    '2025-26': { start: '2025-08-01', end: '2026-05-31' },
    '2024-25': { start: '2024-08-01', end: '2025-05-31' },
    '2023-24': { start: '2023-08-01', end: '2024-05-31' },
};


// Load current Premier League teams configuration (for backward compatibility)
const loadCurrentTeams = () => {
    try {
        const configPath = (0, path_1.join)(__dirname, '../config/current_premier_league_teams.json');
        const configData = (0, fs_1.readFileSync)(configPath, 'utf8');
        return JSON.parse(configData);
    }
    catch (error) {
        console.error('Error loading team configuration:', error);
        return { current_teams: [] };
    }
};
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// API Routes
app.get('/api/seasons', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const seasons = [
            { id: '2025-26', name: '25/26', year: '2025/26', isCurrent: true },
            { id: '2024-25', name: '24/25', year: '2024/25', isCurrent: false },
            { id: '2023-24', name: '23/24', year: '2023/24', isCurrent: false }
        ];
        res.json(seasons);
    }
    catch (error) {
        console.error('Error fetching seasons:', error);
        res.status(500).json({ error: 'Failed to fetch seasons' });
    }
}));

app.get('/api/teams', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { season = '2025-26', league = 'soccer_epl' } = req.query;
        console.log(`API /api/teams called with: season=${season}, league=${league}`);
        
        const range = SEASON_DATE_RANGES[season];
        if (!range) {
            return res.status(400).json({ error: 'Invalid season' });
        }
        
        console.log(`Query params: start=${range.start}, end=${range.end}, league=${league}`);
        
        // Find all teams that played a game in the season's date range and league
        const result = yield config_1.default.query(`
      SELECT DISTINCT team FROM (
        SELECT home_team as team FROM games WHERE commence_time >= $1 AND commence_time <= $2 AND sport_key = $3
        UNION
        SELECT away_team as team FROM games WHERE commence_time >= $1 AND commence_time <= $2 AND sport_key = $3
      ) t
      ORDER BY team
    `, [range.start, range.end, league]);
        
        console.log(`Teams query returned ${result.rows.length} teams`);
        res.json(result.rows);
    }
    catch (error) {
        console.error('Error fetching teams:', error);
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
}));
app.get('/api/matches', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { homeTeam, awayTeam, season = '2025-26', league = 'soccer_epl' } = req.query;
        console.log(`API /api/matches called with: season=${season}, league=${league}, homeTeam=${homeTeam}, awayTeam=${awayTeam}`);
        
        const range = SEASON_DATE_RANGES[season];
        if (!range) {
            return res.status(400).json({ error: 'Invalid season' });
        }
        
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
      WHERE g.commence_time >= $1 AND g.commence_time <= $2 AND g.sport_key = $3
    `;
        const params = [range.start, range.end, league];
        
        console.log(`Query params: start=${range.start}, end=${range.end}, league=${league}`);
        
        if (homeTeam) {
            params.push(homeTeam);
            query += ` AND g.home_team = $${params.length}`;
        }
        if (awayTeam) {
            params.push(awayTeam);
            query += ` AND g.away_team = $${params.length}`;
        }
        query += ` ORDER BY g.commence_time ASC, mo.last_updated DESC`;
        
        console.log(`Final query: ${query}`);
        console.log(`Final params: ${JSON.stringify(params)}`);
        
        const result = yield config_1.default.query(query, params);
        console.log(`Query returned ${result.rows.length} rows`);
        
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
        const { league = 'soccer_epl' } = req.query;
        
        console.log(`API /api/odds called with: homeTeam=${homeTeam}, awayTeam=${awayTeam}, league=${league}`);
        
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
        AND g.sport_key = $3
        AND g.commence_time > CURRENT_TIMESTAMP
      ORDER BY mo.last_updated DESC
    `, [homeTeam, awayTeam, league]);
        
        console.log(`Odds query returned ${result.rows.length} rows`);
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
