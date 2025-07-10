import express from 'express';
import cors from 'cors';
import pool from '../db/config';
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
    const configPath = path.join(__dirname, '../config/season_teams.json');
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
    const configPath = path.join(__dirname, '../config/current_premier_league_teams.json');
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

// Admin API Routes
app.post('/api/admin/update-odds', async (req, res) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ 
        success: false, 
        message: 'API key is required for updating odds' 
      });
    }

    // Import the OddsApiClient and OddsService
    const { OddsApiClient } = await import('./oddsApi');
    const { OddsService } = await import('../db/oddsService');

    const client = new OddsApiClient(apiKey);
    const oddsService = new OddsService();

    console.log('Fetching Premier League odds...');
    const plOdds = await client.getPremierLeagueOdds();
    
    let savedCount = 0;
    for (const game of plOdds) {
      await oddsService.saveGame(game);
      savedCount++;
    }

    res.json({ 
      success: true, 
      message: `Successfully updated odds for ${savedCount} games`,
      data: { gamesProcessed: savedCount }
    });
  } catch (error) {
    console.error('Error updating odds:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update odds: ' + (error as Error).message 
    });
  }
});

app.post('/api/admin/refresh-teams', async (req, res) => {
  try {
    // This would typically fetch current Premier League teams from an API
    // For now, we'll just return a success message
    res.json({ 
      success: true, 
      message: 'Team refresh completed (placeholder implementation)',
      data: { teamsUpdated: 20 }
    });
  } catch (error) {
    console.error('Error refreshing teams:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to refresh teams: ' + (error as Error).message 
    });
  }
});

app.post('/api/admin/cleanup-old-data', async (req, res) => {
  try {
    // Remove odds older than 30 days
    const result = await pool.query(`
      DELETE FROM match_odds 
      WHERE last_updated < NOW() - INTERVAL '30 days'
    `);

    // Remove games older than 90 days that have no odds
    const gamesResult = await pool.query(`
      DELETE FROM games 
      WHERE commence_time < NOW() - INTERVAL '90 days'
      AND id NOT IN (SELECT DISTINCT game_id FROM match_odds)
    `);

    res.json({ 
      success: true, 
      message: `Cleanup completed. Removed ${result.rowCount} old odds and ${gamesResult.rowCount} old games`,
      data: { 
        oddsRemoved: result.rowCount,
        gamesRemoved: gamesResult.rowCount
      }
    });
  } catch (error) {
    console.error('Error cleaning up old data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to cleanup old data: ' + (error as Error).message 
    });
  }
});

app.post('/api/admin/check-api-usage', async (req, res) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ 
        success: false, 
        message: 'API key is required to check usage' 
      });
    }

    // Make a test request to check API usage
    const { OddsApiClient } = await import('./oddsApi');
    const client = new OddsApiClient(apiKey);
    
    // Get a small amount of data to check usage
    const response = await fetch('https://api.the-odds-api.com/v4/sports', {
      headers: {
        'x-api-key': apiKey
      }
    });

    const remaining = response.headers.get('x-requests-remaining');
    const used = response.headers.get('x-requests-used');

    res.json({ 
      success: true, 
      message: 'API usage checked successfully',
      data: { 
        remaining: remaining ? parseInt(remaining) : 'Unknown',
        used: used ? parseInt(used) : 'Unknown'
      }
    });
  } catch (error) {
    console.error('Error checking API usage:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check API usage: ' + (error as Error).message 
    });
  }
});

app.post('/api/admin/test-connection', async (req, res) => {
  try {
    // Test database connection
    const result = await pool.query('SELECT NOW() as current_time');
    
    // Test basic queries
    const teamsCount = await pool.query('SELECT COUNT(*) as count FROM games');
    const oddsCount = await pool.query('SELECT COUNT(*) as count FROM match_odds');
    
    res.json({ 
      success: true, 
      message: 'Database connection test successful',
      data: { 
        currentTime: result.rows[0].current_time,
        gamesCount: teamsCount.rows[0].count,
        oddsCount: oddsCount.rows[0].count
      }
    });
  } catch (error) {
    console.error('Error testing database connection:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Database connection test failed: ' + (error as Error).message 
    });
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