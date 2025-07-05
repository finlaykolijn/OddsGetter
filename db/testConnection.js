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
const dotenv_1 = __importDefault(require("dotenv"));
const pg_1 = require("pg");
// Load environment variables
dotenv_1.default.config();
function testConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        const pool = new pg_1.Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: parseInt(process.env.DB_PORT || '5432'),
        });
        try {
            const result = yield pool.query('SELECT current_database(), current_user, version()');
            console.log('Database connection successful!');
            console.log('Database:', result.rows[0].current_database);
            console.log('User:', result.rows[0].current_user);
            console.log('PostgreSQL Version:', result.rows[0].version);
        }
        catch (error) {
            console.error('Database connection failed:', error);
        }
        finally {
            yield pool.end();
        }
    });
}
testConnection();
