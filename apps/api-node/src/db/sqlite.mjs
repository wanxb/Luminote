import Database from "better-sqlite3";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";

const databaseCache = new Map();

async function loadSeedData(filePath) {
  const raw = await readFile(filePath, "utf8");
  const parsed = JSON.parse(raw);

  return {
    site: parsed.site || {},
    tagPool: Array.isArray(parsed.tagPool) ? parsed.tagPool : [],
    photos: Array.isArray(parsed.photos) ? parsed.photos : [],
    photoDetails: parsed.photoDetails || {},
  };
}

function createSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS site_config (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      site_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tag_pool (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS photos (
      id TEXT PRIMARY KEY,
      original_file_name TEXT NOT NULL DEFAULT '',
      original_url TEXT NOT NULL DEFAULT '',
      thumb_url TEXT NOT NULL,
      display_url TEXT NOT NULL,
      watermarked_display_url TEXT,
      watermark_enabled INTEGER NOT NULL DEFAULT 1,
      is_hidden INTEGER NOT NULL DEFAULT 0,
      taken_at TEXT,
      description TEXT,
      tags_json TEXT NOT NULL DEFAULT '[]',
      source_hash TEXT,
      device TEXT,
      lens TEXT,
      location TEXT,
      exif_json TEXT,
      created_at TEXT NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_photos_source_hash
    ON photos(source_hash)
    WHERE source_hash IS NOT NULL;
  `);
}

function ensurePhotoColumn(db, columnName, definition) {
  const columns = db.prepare("PRAGMA table_info(photos)").all();
  const hasColumn = columns.some((column) => column.name === columnName);

  if (!hasColumn) {
    db.exec(`ALTER TABLE photos ADD COLUMN ${columnName} ${definition}`);
  }
}

function seedDatabase(db, seed) {
  const hasSite = db.prepare("SELECT 1 FROM site_config WHERE id = 1").get();

  if (!hasSite) {
    db.prepare("INSERT INTO site_config (id, site_json) VALUES (1, ?)")
      .run(JSON.stringify(seed.site));
  }

  const tagCount = db.prepare("SELECT COUNT(*) AS count FROM tag_pool").get();
  if ((tagCount?.count || 0) === 0) {
    const insertTag = db.prepare(
      "INSERT INTO tag_pool (id, name, created_at) VALUES (?, ?, ?)",
    );

    for (const tag of seed.tagPool) {
      insertTag.run(tag.id, tag.name, tag.createdAt || new Date().toISOString());
    }
  }

  const photoCount = db.prepare("SELECT COUNT(*) AS count FROM photos").get();
  if ((photoCount?.count || 0) === 0) {
    const insertPhoto = db.prepare(`
      INSERT INTO photos (
        id,
        thumb_url,
        display_url,
        watermarked_display_url,
        watermark_enabled,
        is_hidden,
        taken_at,
        description,
        tags_json,
        source_hash,
        device,
        lens,
        location,
        exif_json,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const photo of seed.photos) {
      const detail = seed.photoDetails[photo.id] || {};

      insertPhoto.run(
        photo.id,
        photo.thumbUrl,
        photo.displayUrl,
        photo.watermarkedDisplayUrl || null,
        photo.watermarkEnabled ? 1 : 0,
        photo.isHidden ? 1 : 0,
        photo.takenAt || null,
        photo.description || "",
        JSON.stringify(photo.tags || []),
        photo.sourceHash || null,
        detail.device || null,
        detail.lens || null,
        detail.location || null,
        detail.exif ? JSON.stringify(detail.exif) : null,
        photo.takenAt || new Date().toISOString(),
      );
    }
  }
}

export async function getSqliteDb(config) {
  if (databaseCache.has(config.sqliteDbFile)) {
    return databaseCache.get(config.sqliteDbFile);
  }

  await mkdir(path.dirname(config.sqliteDbFile), { recursive: true });

  const db = new Database(config.sqliteDbFile);
  createSchema(db);
  ensurePhotoColumn(db, "original_file_name", "TEXT NOT NULL DEFAULT ''");
  ensurePhotoColumn(db, "original_url", "TEXT NOT NULL DEFAULT ''");
  const seed = await loadSeedData(config.dataFile);
  seedDatabase(db, seed);

  databaseCache.set(config.sqliteDbFile, db);
  return db;
}
