import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

let _db: any = null;

export const getDb = () => {
    if (_db) return _db;

    const url = process.env.DATABASE_URL;
    if (!url) {
        throw new Error('DATABASE_URL is not defined');
    }

    const sql = neon(url);
    _db = drizzle(sql, { schema });
    return _db;
};

// Export db proxy for convenience (server-only)
export const db = new Proxy({} as any, {
    get(target, prop) {
        return getDb()[prop];
    }
});
