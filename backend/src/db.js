const { Pool } = require('pg');

let pool;

async function initDB() {
    if (!pool) {
        if (!process.env.DATABASE_URL) {
            console.error("ERROR: DATABASE_URL is not set in the environment variables!");
            process.exit(1);
        }

        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        });

        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS rules (
                    id SERIAL PRIMARY KEY,
                    trigger_keyword TEXT,
                    match_type TEXT CHECK(match_type IN ('exact', 'partial', 'any')) NOT NULL DEFAULT 'exact',
                    response_message TEXT NOT NULL,
                    target_post_type TEXT CHECK(target_post_type IN ('any', 'specific', 'next')) NOT NULL DEFAULT 'any',
                    target_media_id TEXT,
                    opening_message TEXT,
                    button_text TEXT,
                    require_follow BOOLEAN NOT NULL DEFAULT false,
                    is_active BOOLEAN NOT NULL DEFAULT true,
                    main_button_text TEXT,
                    main_button_url TEXT,
                    public_reply_text TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);
            console.log('PostgreSQL Database connected and verified.');
        } catch (error) {
            console.error("Database initialization failed:", error);
            process.exit(1);
        }
    }
    return pool;
}

module.exports = { initDB };
