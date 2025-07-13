"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OddsService = void 0;
const config_1 = require("./config");
class OddsService {
    async saveGame(game) {
        const client = await config_1.default.connect();
        try {
            await client.query('BEGIN');
            // First, check if a game with the same teams already exists
            const existingGameResult = await client.query(`SELECT id, game_id, commence_time FROM games 
                 WHERE home_team = $1 AND away_team = $2 AND sport_key = $3`, [game.home_team, game.away_team, game.sport_key]);
            let gameId;
            let existingGameId = null;
            if (existingGameResult.rows.length > 0) {
                // Game already exists, use the existing game ID
                const existingGame = existingGameResult.rows[0];
                gameId = existingGame.id;
                existingGameId = existingGame.game_id;
                // Update the commence_time if the new time is more recent (within 24 hours)
                const existingTime = new Date(existingGame.commence_time);
                const newTime = new Date(game.commence_time);
                const timeDiff = Math.abs(newTime.getTime() - existingTime.getTime());
                const hoursDiff = timeDiff / (1000 * 60 * 60);
                if (hoursDiff <= 24) {
                    // Times are within 24 hours, update with the new time
                    await client.query(`UPDATE games SET commence_time = $1 WHERE id = $2`, [game.commence_time, gameId]);
                }
            }
            else {
                // No existing game found, insert new game
                const gameResult = await client.query(`INSERT INTO games (game_id, sport_key, sport_title, commence_time, home_team, away_team)
                     VALUES ($1, $2, $3, $4, $5, $6)
                     RETURNING id`, [game.id, game.sport_key, game.sport_title, game.commence_time, game.home_team, game.away_team]);
                gameId = gameResult.rows[0].id;
            }
            // Process each bookmaker
            for (const bookmaker of game.bookmakers) {
                // Insert or get bookmaker
                const bookmakerResult = await client.query(`INSERT INTO bookmakers (bookmaker_key, title, last_update)
                     VALUES ($1, $2, $3)
                     ON CONFLICT (bookmaker_key) DO UPDATE
                     SET title = $2, last_update = $3
                     RETURNING id`, [bookmaker.key, bookmaker.title, bookmaker.last_update]);
                const bookmakerId = bookmakerResult.rows[0].id;
                // Find the h2h market
                const h2hMarket = bookmaker.markets.find(m => m.key === 'h2h');
                if (h2hMarket) {
                    // Extract home win, draw, and away win odds
                    const homeWinOutcome = h2hMarket.outcomes.find(o => o.name === game.home_team);
                    const awayWinOutcome = h2hMarket.outcomes.find(o => o.name === game.away_team);
                    const drawOutcome = h2hMarket.outcomes.find(o => o.name === 'Draw');
                    if (homeWinOutcome && awayWinOutcome && drawOutcome) {
                        // Insert or update match odds
                        await client.query(`INSERT INTO match_odds 
                             (game_id, bookmaker_id, home_win_odds, draw_odds, away_win_odds, last_updated)
                             VALUES ($1, $2, $3, $4, $5, $6)
                             ON CONFLICT (game_id, bookmaker_id) DO UPDATE
                             SET home_win_odds = $3, draw_odds = $4, away_win_odds = $5, last_updated = $6`, [
                            gameId,
                            bookmakerId,
                            homeWinOutcome.price,
                            drawOutcome.price,
                            awayWinOutcome.price,
                            new Date()
                        ]);
                    }
                }
            }
            await client.query('COMMIT');
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async getBestOddsForMatch(homeTeam, awayTeam) {
        const result = await config_1.default.query(`SELECT 
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
            ORDER BY mo.last_updated DESC`, [homeTeam, awayTeam]);
        return result.rows;
    }
    async getBestOddsForTeam(teamName) {
        const result = await config_1.default.query(`SELECT 
                g.home_team,
                g.away_team,
                g.commence_time,
                b.title as bookmaker,
                CASE 
                    WHEN g.home_team = $1 THEN mo.home_win_odds
                    ELSE mo.away_win_odds
                END as team_win_odds,
                mo.draw_odds,
                mo.last_updated
            FROM games g
            JOIN match_odds mo ON g.id = mo.game_id
            JOIN bookmakers b ON mo.bookmaker_id = b.id
            WHERE (g.home_team = $1 OR g.away_team = $1)
                AND g.commence_time > CURRENT_TIMESTAMP
            ORDER BY g.commence_time ASC, team_win_odds DESC`, [teamName]);
        return result.rows;
    }
    async getUpcomingPremierLeagueMatches() {
        const result = await config_1.default.query(`SELECT 
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
            WHERE g.sport_key = 'soccer_epl'
                AND g.commence_time > CURRENT_TIMESTAMP
            ORDER BY g.commence_time ASC, b.title`);
        return result.rows;
    }
}
exports.OddsService = OddsService;
