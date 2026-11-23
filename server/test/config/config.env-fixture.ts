// Empty strings force the defaults even if a real .env exists (dotenv does not override set vars).
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'db.test';
process.env.DB_PORT = '5432';
process.env.DB_NAME = '';
process.env.DB_SSL = '';
process.env.SUPABASE_URL = 'https://x.supabase.co';
process.env.SUPABASE_SECRET_KEY = '';
