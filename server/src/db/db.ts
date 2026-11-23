import { Pool, PoolClient } from 'pg';
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_SSL, DB_USER } from '../config';

export const pool = new Pool({
  host: DB_HOST,
  port: DB_PORT,
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
  ssl: DB_SSL ? { rejectUnauthorized: false } : undefined,
  max: 5,
});

export const withTransaction = async <T>(fn: (client: PoolClient) => Promise<T>): Promise<T> => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const TABLES = [
  'users',
  'products',
  'inventory_items',
  'shopping_items',
  'recipes',
  'recipe_ingredients',
  'recipe_steps',
  'donations',
  'donation_stats',
  'notifications',
] as const;

const DDL = [
  `CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('household','admin')),
    points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
    kg_saved NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (kg_saved >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    shelf_life_days INTEGER NOT NULL CHECK (shelf_life_days > 0),
    substitutes TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity TEXT NOT NULL,
    expires_on DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
  )`,
  'CREATE INDEX IF NOT EXISTS idx_inventory_items_user_id ON public.inventory_items(user_id)',
  `CREATE TABLE IF NOT EXISTS public.shopping_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    quantity TEXT NOT NULL,
    reason TEXT NOT NULL,
    checked BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT now()
  )`,
  'CREATE INDEX IF NOT EXISTS idx_shopping_items_user_id ON public.shopping_items(user_id)',
  `CREATE TABLE IF NOT EXISTS public.recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    author TEXT NOT NULL,
    title TEXT NOT NULL,
    minutes INTEGER NOT NULL CHECK (minutes > 0),
    difficulty TEXT NOT NULL,
    servings INTEGER NOT NULL CHECK (servings > 0),
    ingredients_available INTEGER NOT NULL DEFAULT 0 CHECK (ingredients_available >= 0),
    ingredients_total INTEGER NOT NULL DEFAULT 0 CHECK (ingredients_total >= 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
    created_at TIMESTAMP NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
    recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    position INTEGER NOT NULL CHECK (position >= 0),
    name TEXT NOT NULL,
    PRIMARY KEY (recipe_id, position)
  )`,
  `CREATE TABLE IF NOT EXISTS public.recipe_steps (
    recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    position INTEGER NOT NULL CHECK (position >= 0),
    description TEXT NOT NULL,
    PRIMARY KEY (recipe_id, position)
  )`,
  `CREATE TABLE IF NOT EXISTS public.donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    donor_name TEXT NOT NULL,
    zone TEXT NOT NULL,
    items TEXT NOT NULL,
    expires_label TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','completed')),
    created_at TIMESTAMP NOT NULL DEFAULT now()
  )`,
  'CREATE INDEX IF NOT EXISTS idx_donations_user_id ON public.donations(user_id)',
  // Deprecated: nothing reads donation_stats any more (summary is computed from donations).
  `CREATE TABLE IF NOT EXISTS public.donation_stats (
    id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    kg_rescued NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (kg_rescued >= 0),
    daily_goal_percent INTEGER NOT NULL DEFAULT 0 CHECK (daily_goal_percent BETWEEN 0 AND 100),
    families INTEGER NOT NULL DEFAULT 0 CHECK (families >= 0),
    deliveries INTEGER NOT NULL DEFAULT 0 CHECK (deliveries >= 0)
  )`,
  `CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('recipe-submitted','recipe-reviewed','donation-created','donation-status-changed')),
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT now()
  )`,
  'CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created_at ON public.notifications(user_id, created_at DESC)',
  ...TABLES.map((table) => `ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`),
];

export const initDb = async (): Promise<void> => {
  for (const statement of DDL) {
    await pool.query(statement);
  }
};
