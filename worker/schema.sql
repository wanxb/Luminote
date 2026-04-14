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
  source_hash TEXT,
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

CREATE INDEX IF NOT EXISTS idx_photos_source_hash
ON photos(source_hash);

CREATE TABLE IF NOT EXISTS tag_pool (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL
);

INSERT OR IGNORE INTO tag_pool (id, name, created_at) VALUES
  ('tag_street', '街景', '2026-04-09T00:00:00.000Z'),
  ('tag_portrait', '人像', '2026-04-09T00:00:01.000Z'),
  ('tag_birds', '鸟类', '2026-04-09T00:00:02.000Z'),
  ('tag_animals', '动物', '2026-04-09T00:00:03.000Z'),
  ('tag_landscape', '风景', '2026-04-09T00:00:04.000Z'),
  ('tag_architecture', '建筑', '2026-04-09T00:00:05.000Z'),
  ('tag_night', '夜景', '2026-04-09T00:00:06.000Z'),
  ('tag_bw', '黑白', '2026-04-09T00:00:07.000Z'),
  ('tag_documentary', '纪实', '2026-04-09T00:00:08.000Z'),
  ('tag_nature', '自然', '2026-04-09T00:00:09.000Z'),
  ('tag_city', '城市', '2026-04-09T00:00:10.000Z'),
  ('tag_travel', '旅行', '2026-04-09T00:00:11.000Z'),
  ('tag_food', '美食', '2026-04-09T00:00:12.000Z'),
  ('tag_still_life', '静物', '2026-04-09T00:00:13.000Z'),
  ('tag_macro', '微距', '2026-04-09T00:00:14.000Z');

CREATE TABLE IF NOT EXISTS site_config (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  site_title TEXT NOT NULL,
  site_description TEXT NOT NULL,
  home_layout TEXT NOT NULL DEFAULT 'editorial',
  watermark_enabled_by_default INTEGER NOT NULL DEFAULT 1,
  watermark_text TEXT NOT NULL,
  watermark_position TEXT NOT NULL DEFAULT 'bottom-right',
  admin_password TEXT,
  admin_password_hash TEXT,
  upload_original_enabled INTEGER NOT NULL DEFAULT 0,
  max_tag_pool_size INTEGER NOT NULL DEFAULT 20,
  max_upload_files INTEGER NOT NULL DEFAULT 20,
  max_tags_per_photo INTEGER NOT NULL DEFAULT 5,
  photo_metadata_enabled INTEGER NOT NULL DEFAULT 1,
  show_date_info INTEGER NOT NULL DEFAULT 1,
  show_camera_info INTEGER NOT NULL DEFAULT 1,
  show_image_info INTEGER NOT NULL DEFAULT 1,
  show_advanced_camera_info INTEGER NOT NULL DEFAULT 1,
  show_location_info INTEGER NOT NULL DEFAULT 1,
  show_detailed_exif_info INTEGER NOT NULL DEFAULT 1,
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
