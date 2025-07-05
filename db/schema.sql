-- Create tables for odds data
CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    game_id VARCHAR(255) UNIQUE NOT NULL,
    sport_key VARCHAR(50) NOT NULL,
    sport_title VARCHAR(100) NOT NULL,
    commence_time TIMESTAMP NOT NULL,
    home_team VARCHAR(100) NOT NULL,
    away_team VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookmakers (
    id SERIAL PRIMARY KEY,
    bookmaker_key VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(100) NOT NULL,
    last_update TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS markets (
    id SERIAL PRIMARY KEY,
    market_key VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS game_bookmakers (
    id SERIAL PRIMARY KEY,
    game_id INTEGER REFERENCES games(id),
    bookmaker_id INTEGER REFERENCES bookmakers(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(game_id, bookmaker_id)
);

CREATE TABLE IF NOT EXISTS outcomes (
    id SERIAL PRIMARY KEY,
    game_bookmaker_id INTEGER REFERENCES game_bookmakers(id),
    market_id INTEGER REFERENCES markets(id),
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(game_bookmaker_id, market_id, name)
);

-- Create a new table for storing match odds across different bookmakers
CREATE TABLE IF NOT EXISTS match_odds (
    id SERIAL PRIMARY KEY,
    game_id INTEGER REFERENCES games(id),
    bookmaker_id INTEGER REFERENCES bookmakers(id),
    home_win_odds DECIMAL(10, 2) NOT NULL,
    draw_odds DECIMAL(10, 2) NOT NULL,
    away_win_odds DECIMAL(10, 2) NOT NULL,
    last_updated TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(game_id, bookmaker_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_games_sport_key ON games(sport_key);
CREATE INDEX IF NOT EXISTS idx_games_commence_time ON games(commence_time);
CREATE INDEX IF NOT EXISTS idx_games_teams ON games(home_team, away_team);
CREATE INDEX IF NOT EXISTS idx_outcomes_price ON outcomes(price);
CREATE INDEX IF NOT EXISTS idx_match_odds_game ON match_odds(game_id);
CREATE INDEX IF NOT EXISTS idx_match_odds_bookmaker ON match_odds(bookmaker_id);
CREATE INDEX IF NOT EXISTS idx_match_odds_last_updated ON match_odds(last_updated); 