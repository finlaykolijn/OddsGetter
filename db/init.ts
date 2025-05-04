import dotenv from 'dotenv';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Initialize database
export async function initializeDatabase() {
    const pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT || '5432'),
    });

    try {
        // Read and execute schema.sql
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await pool.query(schema);
        console.log('Database schema initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    } finally {
        await pool.end();
    }
} 