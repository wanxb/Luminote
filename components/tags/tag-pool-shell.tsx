"use client";

import { useEffect, useState } from "react";
import { getAdminTags, createTag, deleteTag, type TagPool } from "@/lib/api/admin-client";

export function TagPoolShell() {
  const [tags, setTags] = useState<TagPool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTagName, setNewTagName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTags();
  }, []);

  async function loadTags() {
    setIsLoading(true);
    try {
      const result = await getAdminTags();
      if (result.ok) {
        setTags(result.tags);
      }
    } catch {
      setError("加载标签失败，请确认 Worker 是否已启动。");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateTag(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreating(true);
    setError("");

    const trimmedName = newTagName.trim();

    if (!trimmedName) {
      setIsCreating(false);
      return;
    }

    try {
      const result = await createTag(trimmedName);

      if (!result.ok || !result.tag) {
        setError(result.error ?? "创建标签失败。");
        return;
      }

      setNewTagName("");
      await loadTags();
    } catch {
      setError("创建标签请求失败，请确认 Worker 是否已启动。");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDeleteTag(id: string) {
    if (!confirm("确定要删除这个标签吗？")) {
      return;
    }

    try {
      const result = await deleteTag(id);

      if (!result.ok) {
        setError(result.error ?? "删除标签失败。");
        return;
      }

      await loadTags();
    } catch {
      setError("删除标签请求失败，请确认 Worker 是否已启动。");
    }
  }

  return (
    <div className="rounded-[28px] border border-black/5 bg-white/80 p-6 shadow-soft">
      <h2 className="font-display text-2xl text-ink">标签池</h2>
      <p className="mt-2 text-sm text-ink/70">
        管理所有可用标签。上传照片时可以选择这些标签，也可以创建新标签。
      </p>

      <div className="mt-6 space-y-6">
        {/* 创建新标签 */}
        <form className="rounded-2xl border border-black/5 bg-mist p-4" onSubmit={handleCreateTag}>
          <div className="flex gap-3">
            <input
              type="text"
              value={newTagName}
              onChange={(event) => setNewTagName(event.target.value)}
              placeholder="输入新标签名称"
              className="flex-1 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-ember"
              disabled={isCreating}
            />
            <button
              type="submit"
              disabled={isCreating || !newTagName.trim()}
              className="rounded-full bg-ink px-5 py-2.5 text-sm uppercase tracking-[0.2em] text-paper transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreating ? "创建中" : "创建"}
            </button>
          </div>
          {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
        </form>

        {/* 标签列表 */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-ink">
            所有标签 ({tags.length})
          </h3>
          {isLoading ? (
            <p className="text-sm text-ink/70">加载中...</p>
          ) : tags.length === 0 ? (
            <p className="text-sm text-ink/70">暂无标签</p>
          ) : (
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="group flex items-center justify-between rounded-xl border border-black/5 bg-white p-3 transition hover:border-black/10"
                >
                  <span className="text-sm font-medium text-ink">{tag.name}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteTag(tag.id)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
