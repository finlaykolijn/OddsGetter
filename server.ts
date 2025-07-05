import express from 'express';
import cors from 'cors';
import pool from './db/config';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.get('/api/teams', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT home_team as team FROM games 
      UNION 
      SELECT DISTINCT away_team as team FROM games 
      ORDER BY team
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

app.get('/api/matches', async (req, res) => {
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
    
    const params: string[] = [];
    
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