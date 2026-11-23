import dotenv from 'dotenv';

dotenv.config();

export const PORT = Number(process.env.PORT) || 3001;
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const DB_HOST = process.env.DB_HOST;
export const DB_PORT = Number(process.env.DB_PORT) || 6543;
export const DB_NAME = process.env.DB_NAME || 'postgres';
export const DB_USER = process.env.DB_USER;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_SSL = process.env.DB_SSL !== 'false';
export const SUPABASE_URL = process.env.SUPABASE_URL || '';
export const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || '';
