"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
// Database configuration
const pool = new pg_1.Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'odds_database',
    password: process.env.DB_PASSWORD || 'Liverpool1892',
    port: parseInt(process.env.DB_PORT || '5432'),
});
exports.default = pool;
