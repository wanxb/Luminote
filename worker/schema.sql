CREATE TABLE IF NOT EXISTS photos (
  id TEXT PRIMARY KEY,
  original_file_name TEXT NOT NULL,
  title TEXT,
  description TEXT,
  original_url TEXT NOT NULL,
  thumb_url TEXT NOT NULL,
  display_url TEXT NOT NULL,
  watermarked_display_url TEXT,
  taken_at TEXT,
  device TEXT,
  lens TEXT,
  location TEXT,
  exif_json TEXT,
  tags_json TEXT NOT NULL DEFAULT '[]',
  show_camera_info INTEGER NOT NULL DEFAULT 1,
  show_date_info INTEGER NOT NULL DEFAULT 1,
  show_location_info INTEGER NOT NULL DEFAULT 1,
  watermark_enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_photos_created_at
ON photos(created_at DESC);

CREATE TABLE IF NOT EXISTS tag_pool (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL
);
