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
  is_hidden INTEGER NOT NULL DEFAULT 0,
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

CREATE TABLE IF NOT EXISTS site_config (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  site_title TEXT NOT NULL,
  site_description TEXT NOT NULL,
  watermark_enabled_by_default INTEGER NOT NULL DEFAULT 1,
  watermark_text TEXT NOT NULL,
  admin_password TEXT NOT NULL,
  upload_original_enabled INTEGER NOT NULL DEFAULT 0,
  max_tag_pool_size INTEGER NOT NULL DEFAULT 20,
  max_upload_files INTEGER NOT NULL DEFAULT 20,
  max_tags_per_photo INTEGER NOT NULL DEFAULT 5,
  photographer_avatar_url TEXT NOT NULL DEFAULT '',
  photographer_name TEXT NOT NULL DEFAULT '',
  photographer_bio TEXT NOT NULL DEFAULT '',
  photographer_email TEXT NOT NULL DEFAULT '',
  photographer_xiaohongshu TEXT NOT NULL DEFAULT '',
  photographer_xiaohongshu_url TEXT NOT NULL DEFAULT '',
  photographer_douyin TEXT NOT NULL DEFAULT '',
  photographer_douyin_url TEXT NOT NULL DEFAULT '',
  photographer_instagram TEXT NOT NULL DEFAULT '',
  photographer_instagram_url TEXT NOT NULL DEFAULT '',
  photographer_custom_account TEXT NOT NULL DEFAULT '',
  photographer_custom_account_url TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL
);
