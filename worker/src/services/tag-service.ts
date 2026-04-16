import type { Env } from "../index";
import { getLocaleMessages } from "../utils/i18n";
import { getSiteConfig } from "./site-config-service";

type TagPool = {
  id: string;
  name: string;
  created_at: string;
};

const DEFAULT_TAGS = [
  "街景",
  "人像",
  "鸟类",
  "动物",
  "风景",
  "建筑",
  "夜景",
  "黑白",
  "纪实",
  "自然",
  "城市",
  "旅行",
  "美食",
  "静物",
  "微距",
];

let ensureTagPoolPromise: Promise<void> | null = null;

async function ensureTagPool(env: Env) {
  if (!env.DB) {
    return;
  }

  if (!ensureTagPoolPromise) {
    ensureTagPoolPromise = (async () => {
      await env.DB!.prepare(
        `CREATE TABLE IF NOT EXISTS tag_pool (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          created_at TEXT NOT NULL
        )`,
      ).run();

      try {
        await env.DB!.prepare(
          "ALTER TABLE tag_pool ADD COLUMN created_at TEXT NOT NULL DEFAULT ''",
        ).run();
      } catch {
        // Ignore if the column already exists.
      }

      const countResult = await env.DB!.prepare(
        "SELECT COUNT(*) as count FROM tag_pool",
      ).first<{ count: number }>();

      if ((countResult?.count ?? 0) > 0) {
        return;
      }

      const baseTime = Date.parse("2026-04-09T00:00:00.000Z");
      await env.DB!.batch(
        DEFAULT_TAGS.map((name, index) =>
          env.DB!.prepare(
            "INSERT OR IGNORE INTO tag_pool (id, name, created_at) VALUES (?, ?, ?)",
          ).bind(
            `tag_default_${index + 1}`,
            name,
            new Date(baseTime + index * 1000).toISOString(),
          ),
        ),
      );
    })();
  }

  await ensureTagPoolPromise;
}

export async function getTagPool(env: Env) {
  if (!env.DB) {
    return [];
  }

  try {
    await ensureTagPool(env);

    const result = await env.DB.prepare(
      "SELECT id, name, created_at FROM tag_pool ORDER BY created_at ASC",
    ).all<TagPool>();

    return result.results ?? [];
  } catch {
    return [];
  }
}

export async function createTag(
  env: Env,
  name: string,
  maxTagPoolSize: number,
) {
  if (!env.DB) {
    return null;
  }

  await ensureTagPool(env);

  const id = `tag_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const createdAt = new Date().toISOString();

  try {
    const countResult = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM tag_pool",
    ).first<{ count: number }>();

    if ((countResult?.count ?? 0) >= maxTagPoolSize) {
      throw new Error("TAG_LIMIT_EXCEEDED");
    }

    await env.DB.prepare(
      "INSERT INTO tag_pool (id, name, created_at) VALUES (?, ?, ?)",
    )
      .bind(id, name, createdAt)
      .run();

    return { id, name, created_at: createdAt };
  } catch {
    throw new Error("Failed to create tag");
  }
}

export async function deleteTag(env: Env, id: string) {
  const t = getLocaleMessages((await getSiteConfig(env)).locale);

  if (!env.DB) {
    return {
      ok: false,
      error: t.d1UpdateMissing,
    };
  }

  await ensureTagPool(env);

  try {
    const existing = await env.DB.prepare(
      "SELECT id FROM tag_pool WHERE id = ? LIMIT 1",
    )
      .bind(id)
      .first<{ id: string }>();

    if (!existing) {
      return {
        ok: true,
        deleted: false,
      };
    }

    const result = await env.DB.prepare("DELETE FROM tag_pool WHERE id = ?")
      .bind(id)
      .run();

    return {
      ok: result.success,
      deleted: true,
    };
  } catch {
    return {
      ok: false,
      error: t.deleteTagFailed,
    };
  }
}
