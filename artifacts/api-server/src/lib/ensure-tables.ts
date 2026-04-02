import { pool } from "@workspace/db";
import { logger } from "./logger";

export async function ensureTables(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_accounts (
        id               SERIAL PRIMARY KEY,
        role             TEXT NOT NULL CHECK (role IN ('buyer','seller')),
        store_name       TEXT,
        contact_name     TEXT NOT NULL,
        email            TEXT NOT NULL UNIQUE,
        password_hash    TEXT NOT NULL,
        credits          INTEGER NOT NULL DEFAULT 0,
        is_admin         BOOLEAN NOT NULL DEFAULT FALSE,
        email_verified   BOOLEAN NOT NULL DEFAULT FALSE,
        email_verification_token TEXT,
        password_reset_token     TEXT,
        password_reset_expires   TIMESTAMP,
        username         TEXT UNIQUE,
        notification_category_ids TEXT NOT NULL DEFAULT '[]',
        created_at       TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS categories (
        id          SERIAL PRIMARY KEY,
        name        TEXT NOT NULL,
        slug        TEXT NOT NULL UNIQUE,
        icon        TEXT NOT NULL,
        description TEXT NOT NULL,
        fields      JSONB NOT NULL DEFAULT '[]',
        is_active   BOOLEAN NOT NULL DEFAULT TRUE,
        created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS requests (
        id                   SERIAL PRIMARY KEY,
        title                TEXT NOT NULL,
        brand                TEXT NOT NULL,
        description          TEXT NOT NULL,
        category_id          INTEGER NOT NULL REFERENCES categories(id),
        specifications       JSONB NOT NULL DEFAULT '{}',
        allowed_offer_types  JSONB NOT NULL DEFAULT '["new"]',
        allow_similar_models BOOLEAN NOT NULL DEFAULT FALSE,
        consumer_name        TEXT NOT NULL,
        consumer_email       TEXT NOT NULL,
        expires_at           TIMESTAMP NOT NULL,
        created_at           TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS bids (
        id             SERIAL PRIMARY KEY,
        request_id     INTEGER NOT NULL REFERENCES requests(id),
        supplier_name  TEXT NOT NULL,
        supplier_store TEXT NOT NULL,
        supplier_email TEXT NOT NULL,
        price          NUMERIC(10,2) NOT NULL,
        offer_type     TEXT NOT NULL,
        model_name     TEXT NOT NULL,
        description    TEXT NOT NULL,
        warranty_months INTEGER NOT NULL DEFAULT 12,
        delivery_days  INTEGER NOT NULL DEFAULT 3,
        image_url      TEXT,
        is_similar_model BOOLEAN NOT NULL DEFAULT FALSE,
        created_at     TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS connections (
        id             SERIAL PRIMARY KEY,
        user_id        INTEGER NOT NULL REFERENCES user_accounts(id),
        request_id     INTEGER NOT NULL,
        bid_id         INTEGER NOT NULL,
        consumer_name  TEXT NOT NULL,
        consumer_email TEXT NOT NULL,
        created_at     TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS credit_purchases (
        id              SERIAL PRIMARY KEY,
        user_id         INTEGER NOT NULL REFERENCES user_accounts(id),
        bundle_name     TEXT NOT NULL,
        credits_amount  INTEGER NOT NULL,
        amount_paid_cents INTEGER NOT NULL,
        created_at      TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS payment_orders (
        id              SERIAL PRIMARY KEY,
        user_id         INTEGER NOT NULL REFERENCES user_accounts(id),
        bundle_id       TEXT NOT NULL,
        bundle_name     TEXT NOT NULL,
        credits_amount  INTEGER NOT NULL,
        amount_cents    INTEGER NOT NULL,
        paynl_order_id  TEXT,
        status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','cancelled')),
        created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
        paid_at         TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS site_settings (
        id           SERIAL PRIMARY KEY,
        offline_mode BOOLEAN NOT NULL DEFAULT FALSE,
        updated_at   TIMESTAMP DEFAULT NOW()
      );

      INSERT INTO site_settings (offline_mode)
      SELECT FALSE WHERE NOT EXISTS (SELECT 1 FROM site_settings LIMIT 1);

      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS paynl_service_id TEXT;
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS paynl_token TEXT;
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS initial_seller_credits INTEGER NOT NULL DEFAULT 10;
      ALTER TABLE bids ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'public';
      ALTER TABLE bids ADD COLUMN IF NOT EXISTS buyer_interest_email TEXT;
      ALTER TABLE bids ADD COLUMN IF NOT EXISTS buyer_interest_name TEXT;
      ALTER TABLE bids ADD COLUMN IF NOT EXISTS buyer_interest_at TIMESTAMP;

      CREATE TABLE IF NOT EXISTS payment_logs (
        id                SERIAL PRIMARY KEY,
        created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
        source            TEXT NOT NULL,
        action            TEXT,
        extra1            TEXT,
        paynl_order_id    TEXT,
        internal_order_id INTEGER,
        raw_body          TEXT,
        result            TEXT,
        error_message     TEXT,
        credits_added     INTEGER
      );

      CREATE TABLE IF NOT EXISTS credit_bundles (
        id                   SERIAL PRIMARY KEY,
        bundle_key           TEXT NOT NULL UNIQUE,
        name                 TEXT NOT NULL,
        credits              INTEGER NOT NULL,
        price_cents          INTEGER NOT NULL,
        original_price_cents INTEGER,
        badge                TEXT,
        sort_order           INTEGER NOT NULL DEFAULT 0,
        is_active            BOOLEAN NOT NULL DEFAULT TRUE,
        created_at           TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at           TIMESTAMP NOT NULL DEFAULT NOW()
      );

      INSERT INTO credit_bundles (bundle_key, name, credits, price_cents, original_price_cents, badge, sort_order)
      VALUES
        ('starter',    'Starter',    10,  3500,  NULL,  NULL,           1),
        ('popular',    'Populair',   50,  12000, 15000, 'Populair',     2),
        ('pro',        'Pro',        100, 25000, 30000, 'Beste waarde', 3),
        ('enterprise', 'Enterprise', 250, 55000, 75000, NULL,           4)
      ON CONFLICT (bundle_key) DO NOTHING;
    `);

    logger.info("Database tables verified/created");
  } catch (err) {
    logger.error({ err }, "Failed to ensure database tables");
    throw err;
  } finally {
    client.release();
  }
}
