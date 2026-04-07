const DEFAULT_TAGS = [
    "人像",
    "动物",
    "植物",
    "建筑",
    "街拍",
    "鸟类",
    "黑白",
    "夜景",
];
async function ensureDefaultTags(env) {
    if (!env.DB) {
        return;
    }
    const countResult = await env.DB.prepare("SELECT COUNT(*) as count FROM tag_pool").first();
    if ((countResult?.count ?? 0) > 0) {
        return;
    }
    const startedAt = Date.now();
    const statements = DEFAULT_TAGS.map((name, index) => env
        .DB.prepare("INSERT INTO tag_pool (id, name, created_at) VALUES (?, ?, ?)")
        .bind(`tag_${startedAt}_${index + 1}`, name, new Date(startedAt + index).toISOString()));
    await env.DB.batch(statements);
}
export async function getTagPool(env) {
    if (!env.DB) {
        return [];
    }
    try {
        await ensureDefaultTags(env);
        const result = await env.DB.prepare("SELECT id, name, created_at FROM tag_pool ORDER BY created_at ASC").all();
        return result.results ?? [];
    }
    catch {
        return [];
    }
}
export async function createTag(env, name, maxTagPoolSize) {
    if (!env.DB) {
        return null;
    }
    const id = `tag_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const createdAt = new Date().toISOString();
    try {
        await ensureDefaultTags(env);
        const countResult = await env.DB.prepare("SELECT COUNT(*) as count FROM tag_pool").first();
        if ((countResult?.count ?? 0) >= maxTagPoolSize) {
            throw new Error("TAG_LIMIT_EXCEEDED");
        }
        await env.DB.prepare("INSERT INTO tag_pool (id, name, created_at) VALUES (?, ?, ?)")
            .bind(id, name, createdAt)
            .run();
        return { id, name, created_at: createdAt };
    }
    catch {
        throw new Error("Failed to create tag");
    }
}
export async function deleteTag(env, id) {
    if (!env.DB) {
        return {
            ok: false,
            error: "当前环境未绑定 D1，无法删除标签。",
        };
    }
    try {
        const existing = await env.DB.prepare("SELECT id FROM tag_pool WHERE id = ? LIMIT 1")
            .bind(id)
            .first();
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
            ok: result.success !== false,
            deleted: true,
        };
    }
    catch {
        return {
            ok: false,
            error: "删除标签失败。",
        };
    }
}
