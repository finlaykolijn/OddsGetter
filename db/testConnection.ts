import dotenv from 'dotenv';
import { Pool } from 'pg';

// Load environment variables
dotenv.config();

async function testConnection() {
    const pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT || '5432'),
    });

    try {
        const result = await pool.query('SELECT current_database(), current_user, version()');
        console.log('Database connection successful!');
        console.log('Database:', result.rows[0].current_database);
        console.log('User:', result.rows[0].current_user);
        console.log('PostgreSQL Version:', result.rows[0].version);
    } catch (error) {
        console.error('Database connection failed:', error);
    } finally {
        await pool.end();
    }
}

testConnection(); 