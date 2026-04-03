import type { Env } from "../index";
import { json } from "../utils/json";

type TagPool = {
  id: string;
  name: string;
  created_at: string;
};

export async function getTagPool(env: Env) {
  if (!env.DB) {
    return [];
  }

  try {
    const result = await env.DB.prepare(
      "SELECT id, name, created_at FROM tag_pool ORDER BY name ASC"
    ).all<TagPool>();

    return result.results ?? [];
  } catch {
    return [];
  }
}

export async function createTag(env: Env, name: string) {
  if (!env.DB) {
    return null;
  }

  const id = `tag_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  try {
    await env.DB.prepare(
      "INSERT INTO tag_pool (id, name, created_at) VALUES (?, ?, ?)"
    ).bind(id, name, new Date().toISOString());

    return { id, name, created_at: new Date().toISOString() };
  } catch {
    throw new Error("Failed to create tag");
  }
}

export async function deleteTag(env: Env, id: string) {
  if (!env.DB) {
    return { ok: false };
  }

  try {
    await env.DB.prepare("DELETE FROM tag_pool WHERE id = ?").bind(id).run();
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
