import express from 'express';
import cors from 'cors';
import pool from './db/config';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Load season teams configuration
const loadSeasonTeams = () => {
  try {
    const configPath = path.join(__dirname, 'season_teams.json');
    const configData = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    console.error('Error loading season teams configuration:', error);
    return {};
  }
};

// Load current Premier League teams configuration (for backward compatibility)
const loadCurrentTeams = () => {
  try {
    const configPath = path.join(__dirname, 'current_premier_league_teams.json');
    const configData = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    console.error('Error loading team configuration:', error);
    return { current_teams: [] };
  }
};

// Define season date ranges
const SEASON_DATE_RANGES: Record<string, { start: string; end: string }> = {
  '2025-26': { start: '2025-08-01', end: '2026-05-31' },
  '2024-25': { start: '2024-08-01', end: '2025-05-31' },
  '2023-24': { start: '2023-08-01', end: '2024-05-31' },
};

// API Routes
app.get('/api/seasons', async (req, res) => {
  try {
    const seasons = [
      { id: '2025-26', name: '25/26', year: '2025/26', isCurrent: true },
      { id: '2024-25', name: '24/25', year: '2024/25', isCurrent: false },
      { id: '2023-24', name: '23/24', year: '2023/24', isCurrent: false }
    ];
    res.json(seasons);
  } catch (error) {
    console.error('Error fetching seasons:', error);
    res.status(500).json({ error: 'Failed to fetch seasons' });
  }
});

app.get('/api/teams', async (req, res) => {
  try {
    const { season = '2025-26' } = req.query;
    const range = SEASON_DATE_RANGES[season as string];
    if (!range) {
      return res.status(400).json({ error: 'Invalid season' });
    }
    // Find all teams that played a game in the season's date range
    const result = await pool.query(
      `SELECT DISTINCT team FROM (
        SELECT home_team as team FROM games WHERE commence_time >= $1 AND commence_time <= $2
        UNION
        SELECT away_team as team FROM games WHERE commence_time >= $1 AND commence_time <= $2
      ) t
      ORDER BY team`
      , [range.start, range.end]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

app.get('/api/matches', async (req, res) => {
  try {
    const { homeTeam, awayTeam, season = '2025-26' } = req.query;
    const range = SEASON_DATE_RANGES[season as string];
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
      WHERE g.commence_time >= $1 AND g.commence_time <= $2
    `;
    const params: string[] = [range.start, range.end];
    if (homeTeam) {
      params.push(homeTeam as string);
      query += ` AND g.home_team = $${params.length}`;
    }
    if (awayTeam) {
      params.push(awayTeam as string);
      query += ` AND g.away_team = $${params.length}`;
    }
    query += ` ORDER BY g.commence_time ASC, mo.last_updated DESC`;
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

app.get('/api/bookmakers', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT title FROM bookmakers 
      ORDER BY title
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching bookmakers:', error);
    res.status(500).json({ error: 'Failed to fetch bookmakers' });
  }
});

app.get('/api/odds/:homeTeam/:awayTeam', async (req, res) => {
  try {
    const { homeTeam, awayTeam } = req.params;
    
    // Load current Premier League teams configuration
    const config = loadCurrentTeams();
    const currentTeams = new Set(config.current_teams);
    
    // Check if both teams are current Premier League teams
    if (!currentTeams.has(homeTeam) || !currentTeams.has(awayTeam)) {
      return res.status(400).json({ 
        error: 'One or both teams are not current Premier League teams' 
      });
    }
    
    const result = await pool.query(`
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
  } catch (error) {
    console.error('Error fetching odds:', error);
    res.status(500).json({ error: 'Failed to fetch odds' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 