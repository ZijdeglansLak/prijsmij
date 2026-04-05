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

      CREATE TABLE IF NOT EXISTS category_groups (
        id         SERIAL PRIMARY KEY,
        name       TEXT NOT NULL,
        slug       TEXT NOT NULL UNIQUE,
        icon       TEXT NOT NULL DEFAULT '📦',
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_active  BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      ALTER TABLE categories ADD COLUMN IF NOT EXISTS group_id INTEGER REFERENCES category_groups(id);

      CREATE TABLE IF NOT EXISTS static_pages (
        id         SERIAL PRIMARY KEY,
        slug       TEXT NOT NULL,
        lang       TEXT NOT NULL CHECK (lang IN ('nl','en','de','fr')),
        title      TEXT NOT NULL DEFAULT '',
        content    TEXT NOT NULL DEFAULT '',
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE (slug, lang)
      );

      INSERT INTO static_pages (slug, lang, title, content) VALUES
        ('algemene-voorwaarden', 'nl', 'Algemene voorwaarden', ''),
        ('algemene-voorwaarden', 'en', 'Terms and Conditions', ''),
        ('algemene-voorwaarden', 'de', 'Allgemeine Geschäftsbedingungen', ''),
        ('algemene-voorwaarden', 'fr', 'Conditions générales', ''),
        ('privacy', 'nl', 'Privacybeleid', ''),
        ('privacy', 'en', 'Privacy Policy', ''),
        ('privacy', 'de', 'Datenschutzerklärung', ''),
        ('privacy', 'fr', 'Politique de confidentialité', ''),
        ('cookies', 'nl', 'Cookiebeleid', ''),
        ('cookies', 'en', 'Cookie Policy', ''),
        ('cookies', 'de', 'Cookie-Richtlinie', ''),
        ('cookies', 'fr', 'Politique des cookies', ''),
        ('contact', 'nl', 'Contact', ''),
        ('contact', 'en', 'Contact', ''),
        ('contact', 'de', 'Kontakt', ''),
        ('contact', 'fr', 'Contact', ''),
        ('veelgestelde-vragen', 'nl', 'Veelgestelde vragen', ''),
        ('veelgestelde-vragen', 'en', 'Frequently Asked Questions', ''),
        ('veelgestelde-vragen', 'de', 'Häufig gestellte Fragen', ''),
        ('veelgestelde-vragen', 'fr', 'Foire aux questions', '')
      ON CONFLICT (slug, lang) DO NOTHING;
    `);

    // v2.0 migrations
    await client.query(`ALTER TABLE user_accounts ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN NOT NULL DEFAULT FALSE`);
    await client.query(`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS openai_api_key TEXT`);

    // requests table: add is_closed column for lead-sold logic
    await client.query(`ALTER TABLE requests ADD COLUMN IF NOT EXISTS is_closed BOOLEAN NOT NULL DEFAULT FALSE`);

    // connections table: migrate from old supplier_id schema to user_id schema
    await client.query(`ALTER TABLE connections ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES user_accounts(id)`);
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE connections ALTER COLUMN supplier_id DROP NOT NULL;
      EXCEPTION WHEN others THEN NULL;
      END $$;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS kennisbank (
        id         SERIAL PRIMARY KEY,
        title      TEXT NOT NULL,
        content    TEXT NOT NULL,
        tags       TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS conversations (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS messages (
        id              SERIAL PRIMARY KEY,
        conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        role            TEXT NOT NULL CHECK (role IN ('user','assistant')),
        content         TEXT NOT NULL,
        created_at      TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Icon library table
    await client.query(`
      CREATE TABLE IF NOT EXISTS icon_library (
        id          SERIAL PRIMARY KEY,
        name        TEXT NOT NULL,
        type        TEXT NOT NULL DEFAULT 'image',
        emoji       TEXT,
        object_path TEXT,
        created_at  TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    // Add columns if they don't exist (for migration)
    await client.query(`ALTER TABLE icon_library ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'image'`).catch(() => {});
    await client.query(`ALTER TABLE icon_library ALTER COLUMN object_path DROP NOT NULL`).catch(() => {});
    await client.query(`ALTER TABLE icon_library ADD COLUMN IF NOT EXISTS emoji TEXT`).catch(() => {});

    // Schema migrations — add columns that may be missing in older production databases
    await client.query(`ALTER TABLE bids ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'public'`).catch(() => {});
    await client.query(`ALTER TABLE bids ADD COLUMN IF NOT EXISTS buyer_interest_email TEXT`).catch(() => {});
    await client.query(`ALTER TABLE bids ADD COLUMN IF NOT EXISTS buyer_interest_name TEXT`).catch(() => {});
    await client.query(`ALTER TABLE bids ADD COLUMN IF NOT EXISTS buyer_interest_phone TEXT`).catch(() => {});
    await client.query(`ALTER TABLE bids ADD COLUMN IF NOT EXISTS buyer_interest_at TIMESTAMP`).catch(() => {});
    await client.query(`ALTER TABLE requests ADD COLUMN IF NOT EXISTS is_closed BOOLEAN NOT NULL DEFAULT FALSE`).catch(() => {});
    await client.query(`ALTER TABLE connections ADD COLUMN IF NOT EXISTS consumer_phone TEXT`).catch(() => {});
    await client.query(`ALTER TABLE user_accounts ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0`).catch(() => {});
    await client.query(`ALTER TABLE user_accounts ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP`).catch(() => {});
    await client.query(`ALTER TABLE user_accounts ADD COLUMN IF NOT EXISTS failed_passwords TEXT NOT NULL DEFAULT '[]'`).catch(() => {});

    // system_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS system_logs (
        id         SERIAL PRIMARY KEY,
        category   TEXT NOT NULL CHECK (category IN ('LOGIN','LOGOUT','ERROR')),
        message    TEXT NOT NULL,
        user_id    INTEGER REFERENCES user_accounts(id) ON DELETE SET NULL,
        user_email TEXT,
        error_code TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS system_logs_created_at_idx ON system_logs (created_at DESC)`);
    await client.query(`CREATE INDEX IF NOT EXISTS system_logs_category_idx  ON system_logs (category)`);

    // Auto-purge logs older than 60 days
    await client.query(`DELETE FROM system_logs WHERE created_at < NOW() - INTERVAL '60 days'`);

    // Seed emoji from active categories into the library if not already present
    await client.query(`
      INSERT INTO icon_library (name, type, emoji, object_path)
      SELECT c.name, 'emoji', c.icon, NULL FROM categories c
      WHERE c.icon IS NOT NULL AND c.icon != ''
      AND NOT EXISTS (
        SELECT 1 FROM icon_library il WHERE il.type = 'emoji' AND il.emoji = c.icon
      )
    `);

    // Seed 400 test requests if table is empty
    const { rows: reqCheck } = await client.query("SELECT COUNT(*)::int AS cnt FROM requests");
    if (reqCheck[0].cnt === 0) {
      const buyers = [
        { name: 'Piet Vriesmans', email: 'vriesmans@xs4all.nl' },
        { name: 'Test Koper', email: 'testkoper@example.com' },
        { name: 'Jan de Tester', email: 'jan@voorbeeld.nl' },
      ];
      const seedData: Array<{ title: string; brand: string; desc: string; catId: number; cond: string; similar: boolean; name: string; email: string; exp: string; created: string }> = [];
      const catDefs = [
        { id: 1, brands: ['Samsung','LG','Sony','Philips','TCL','Hisense','Panasonic','Sharp'], adjs: ['4K','OLED','QLED','Smart','8K','Full HD','curved','120Hz'] },
        { id: 2, brands: ['Bosch','Miele','Samsung','LG','AEG','Siemens','Indesit','Beko'], adjs: ['8kg','10kg','6kg','slimme','frontlader','bovenlader','A+++','stille'] },
        { id: 3, brands: ['Apple','Dell','HP','Lenovo','Asus','Acer','MSI','Microsoft'], adjs: ['gaming','15 inch','13 inch','zakelijke','lichtgewicht','krachtige','refurbished','ultrabook'] },
        { id: 4, brands: ['Apple','Samsung','Google','OnePlus','Xiaomi','Oppo','Sony','Nokia'], adjs: ['5G','flagship','128GB','256GB','dual-sim','Pro','Plus','budget'] },
        { id: 5, brands: ['Volkswagen','Toyota','BMW','Ford','Renault','Audi','Peugeot','Hyundai'], adjs: ['elektrische','hybride','tweedehands','nieuwe','occasion','benzine','diesel','nette'] },
        { id: 6, brands: ['Bosch','Samsung','LG','Siemens','Whirlpool','AEG','Beko','Smeg'], adjs: ['dubbeldeurs','combi','Amerikaanse','vrijstaande','inbouw','no-frost','retro','RVS'] },
        { id: 7, brands: ['Canon','Nikon','Sony','Fujifilm','Olympus','Panasonic','Leica','Pentax'], adjs: ['spiegelreflex','mirrorless','compacte','vlog','professionele','beginner','waterdichte','hybride'] },
        { id: 8, brands: ['Trek','Gazelle','Giant','Batavus','Cortina','Sparta','Raleigh','Cube'], adjs: ['elektrische','stadsfiets','racefiets','mountainbike','bakfiets','speedpedelec','vouwfiets','damesfiets'] },
      ];
      const conds = ['["new"]','["new","refurbished"]','["new","occasion"]','["refurbished"]'];
      let idx = 0;
      for (const cat of catDefs) {
        for (let i = 0; i < 50; i++) {
          const buyer = buyers[idx % buyers.length];
          const brand = cat.brands[i % cat.brands.length];
          const adj = cat.adjs[i % cat.adjs.length];
          const daysAgo = (i % 55) + 1;
          const daysExp = (i % 25) + 5;
          const created = new Date(Date.now() - daysAgo * 86400000).toISOString();
          const exp = new Date(Date.now() + daysExp * 86400000).toISOString();
          seedData.push({ title: `${brand} ${catDefs.find(c=>c.id===cat.id)?.id === 5 ? 'Auto' : ''}`.trim() || `${brand} product`, brand, desc: `Op zoek naar een ${adj} ${brand} product. Bij voorkeur met garantie. Graag een scherpe aanbieding.`, catId: cat.id, cond: conds[i % conds.length], similar: i % 3 === 0, name: buyer.name, email: buyer.email, exp, created });
          idx++;
        }
      }
      for (let b = 0; b < seedData.length; b += 50) {
        const batch = seedData.slice(b, b + 50);
        const vals = batch.map(r =>
          `('${r.brand} product','${r.brand}','${r.desc.replace(/'/g,"''")}',${r.catId},'{}','${r.cond}',${r.similar},'${r.name}','${r.email}','${r.exp}','${r.created}')`
        ).join(',');
        await client.query(`INSERT INTO requests (title,brand,description,category_id,specifications,allowed_offer_types,allow_similar_models,consumer_name,consumer_email,expires_at,created_at) VALUES ${vals}`);
      }
    }

    logger.info("Database tables verified/created");
  } catch (err) {
    logger.error({ err }, "Failed to ensure database tables");
    throw err;
  } finally {
    client.release();
  }
}
