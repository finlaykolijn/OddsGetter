import pool from './config';
import { Game, Bookmaker, Market, Outcome } from '../oddsApi';

export class OddsService {
    async saveGame(game: Game) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Insert or get game
            const gameResult = await client.query(
                `INSERT INTO games (game_id, sport_key, sport_title, commence_time, home_team, away_team)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 ON CONFLICT (game_id) DO UPDATE
                 SET sport_key = $2, sport_title = $3, commence_time = $4, home_team = $5, away_team = $6
                 RETURNING id`,
                [game.id, game.sport_key, game.sport_title, game.commence_time, game.home_team, game.away_team]
            );
            const gameId = gameResult.rows[0].id;

            // Process each bookmaker
            for (const bookmaker of game.bookmakers) {
                // Insert or get bookmaker
                const bookmakerResult = await client.query(
                    `INSERT INTO bookmakers (bookmaker_key, title, last_update)
                     VALUES ($1, $2, $3)
                     ON CONFLICT (bookmaker_key) DO UPDATE
                     SET title = $2, last_update = $3
                     RETURNING id`,
                    [bookmaker.key, bookmaker.title, bookmaker.last_update]
                );
                const bookmakerId = bookmakerResult.rows[0].id;

                // Create game_bookmaker relationship
                const gameBookmakerResult = await client.query(
                    `INSERT INTO game_bookmakers (game_id, bookmaker_id)
                     VALUES ($1, $2)
                     ON CONFLICT (game_id, bookmaker_id) DO NOTHING
                     RETURNING id`,
                    [gameId, bookmakerId]
                );
                const gameBookmakerId = gameBookmakerResult.rows[0]?.id;

                if (gameBookmakerId) {
                    // Process each market
                    for (const market of bookmaker.markets) {
                        // Insert or get market
                        const marketResult = await client.query(
                            `INSERT INTO markets (market_key)
                             VALUES ($1)
                             ON CONFLICT (market_key) DO NOTHING
                             RETURNING id`,
                            [market.key]
                        );
                        const marketId = marketResult.rows[0]?.id;

                        if (marketId) {
                            // Insert outcomes
                            for (const outcome of market.outcomes) {
                                await client.query(
                                    `INSERT INTO outcomes (game_bookmaker_id, market_id, name, price)
                                     VALUES ($1, $2, $3, $4)
                                     ON CONFLICT (game_bookmaker_id, market_id, name) DO UPDATE
                                     SET price = $4`,
                                    [gameBookmakerId, marketId, outcome.name, outcome.price]
                                );
                            }
                        }
                    }
                }
            }

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async getGameOdds(gameId: string) {
        const result = await pool.query(
            `SELECT 
                g.home_team, g.away_team, g.commence_time,
                b.title as bookmaker,
                m.market_key,
                o.name, o.price
            FROM games g
            JOIN game_bookmakers gb ON g.id = gb.game_id
            JOIN bookmakers b ON gb.bookmaker_id = b.id
            JOIN outcomes o ON gb.id = o.game_bookmaker_id
            JOIN markets m ON o.market_id = m.id
            WHERE g.game_id = $1
            ORDER BY g.commence_time, b.title, m.market_key`,
            [gameId]
        );
        return result.rows;
    }

    async getTeamOdds(teamName: string) {
        const result = await pool.query(
            `SELECT 
                g.home_team, g.away_team, g.commence_time,
                b.title as bookmaker,
                m.market_key,
                o.name, o.price
            FROM games g
            JOIN game_bookmakers gb ON g.id = gb.game_id
            JOIN bookmakers b ON gb.bookmaker_id = b.id
            JOIN outcomes o ON gb.id = o.game_bookmaker_id
            JOIN markets m ON o.market_id = m.id
            WHERE g.home_team = $1 OR g.away_team = $1
            ORDER BY g.commence_time, b.title, m.market_key`,
            [teamName]
        );
        return result.rows;
    }
} 