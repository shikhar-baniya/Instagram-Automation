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
                    trigger_type TEXT CHECK(trigger_type IN ('post_comment', 'story_reply', 'story_mention', 'dm_keyword', 'live_comment', 'ice_breaker')) NOT NULL DEFAULT 'post_comment',
                    target_post_type TEXT CHECK(target_post_type IN ('any', 'specific', 'next')) NOT NULL DEFAULT 'any',
                    target_media_id TEXT,
                    target_story_type TEXT CHECK(target_story_type IN ('any', 'specific', 'next')) NOT NULL DEFAULT 'any',
                    opening_message TEXT,
                    button_text TEXT,
                    require_follow BOOLEAN NOT NULL DEFAULT false,
                    is_active BOOLEAN NOT NULL DEFAULT true,
                    main_button_text TEXT,
                    main_button_url TEXT,
                    public_reply_text TEXT,
                    dms_sent INTEGER DEFAULT 0,
                    clicks INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);
            
            // Add new columns to existing databases if they don't exist
            await pool.query(`
                ALTER TABLE rules ADD COLUMN IF NOT EXISTS dms_sent INTEGER DEFAULT 0;
                ALTER TABLE rules ADD COLUMN IF NOT EXISTS failed_dms INTEGER DEFAULT 0;
                ALTER TABLE rules ADD COLUMN IF NOT EXISTS clicks INTEGER DEFAULT 0;
                ALTER TABLE rules ADD COLUMN IF NOT EXISTS trigger_type TEXT CHECK(trigger_type IN ('post_comment', 'story_reply', 'story_mention', 'dm_keyword', 'live_comment')) NOT NULL DEFAULT 'post_comment';
                ALTER TABLE rules ADD COLUMN IF NOT EXISTS target_story_type TEXT CHECK(target_story_type IN ('any', 'specific', 'next')) NOT NULL DEFAULT 'any';
                ALTER TABLE rules ADD COLUMN IF NOT EXISTS ice_breakers_config JSONB;
                ALTER TABLE rules DROP CONSTRAINT IF EXISTS rules_trigger_type_check;
                ALTER TABLE rules ADD CONSTRAINT rules_trigger_type_check CHECK(trigger_type IN ('post_comment', 'story_reply', 'story_mention', 'dm_keyword', 'live_comment', 'ice_breaker'));
            `);

            // Create automation_executions table for stage tracking, idempotency, and error reporting
            await pool.query(`
                CREATE TABLE IF NOT EXISTS automation_executions (
                    id SERIAL PRIMARY KEY,
                    comment_id VARCHAR(255) UNIQUE,
                    sender_id VARCHAR(255),
                    media_id VARCHAR(255),
                    comment_text TEXT,
                    normalized_comment_text TEXT,
                    trigger_type VARCHAR(50) DEFAULT 'post_comment',
                    rule_id INTEGER REFERENCES rules(id) ON DELETE SET NULL,
                    status VARCHAR(50) NOT NULL DEFAULT 'received',
                    error_message TEXT,
                    meta_error_code VARCHAR(50),
                    is_transient_error BOOLEAN DEFAULT false,
                    retry_count INTEGER DEFAULT 0,
                    public_reply_sent BOOLEAN DEFAULT false,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE INDEX IF NOT EXISTS idx_automation_executions_comment_id ON automation_executions(comment_id);
                CREATE INDEX IF NOT EXISTS idx_automation_executions_rule_id ON automation_executions(rule_id);
                CREATE INDEX IF NOT EXISTS idx_automation_executions_status ON automation_executions(status);
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
