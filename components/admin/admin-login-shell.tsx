"use client";

import { useEffect, useState } from "react";
import { loginAdmin, getAdminSession } from "@/lib/api/admin-client";
import { TEXT_LIMITS } from "@/lib/text-limits";

export function AdminLoginShell() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    let active = true;

    void getAdminSession()
      .then((result) => {
        if (!active) {
          return;
        }

        if (result.authenticated) {
          window.location.href = "/dashboard";
          return;
        }

        setHasSession(false);
      })
      .catch(() => {
        if (active) {
          setHasSession(false);
        }
      })
      .finally(() => {
        if (active) {
          setIsCheckingSession(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");

    try {
      const result = await loginAdmin(password);

      if (!result.ok || !result.authenticated) {
        setLoginError(
          result.status === 401 ? result.error ?? "管理员密码错误。" : result.error ?? "登录失败，请稍后重试。"
        );
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      setLoginError("登录请求失败，请稍后重试。");
    } finally {
      setIsLoggingIn(false);
    }
  }

  if (isCheckingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-ink/5 to-ember/5 px-6">
        <p className="text-sm text-ink/70">检查登录状态中...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-ink/5 to-ember/5 px-6">
      <div className="w-full max-w-md rounded-[32px] border border-black/5 bg-white/90 p-8 shadow-2xl backdrop-blur-md">
        <div className="text-center">
          <h1 className="font-display text-4xl text-ink">Luminote</h1>
          <p className="mt-3 text-sm text-ink/70">管理员登录</p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleLogin}>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-ink">账号</label>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              maxLength={TEXT_LIMITS.adminUsername}
              className="w-full rounded-2xl border border-black/10 bg-paper px-4 py-3 text-sm outline-none transition focus:border-ember"
              placeholder="输入管理员账号"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-ink">密码</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              maxLength={TEXT_LIMITS.password}
              className="w-full rounded-2xl border border-black/10 bg-paper px-4 py-3 text-sm outline-none transition focus:border-ember"
              placeholder="输入管理员密码"
            />
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full rounded-full bg-ink px-6 py-3 text-sm uppercase tracking-[0.2em] text-paper transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoggingIn ? "登录中" : "登录"}
          </button>

          {loginError ? <p className="text-center text-sm text-red-700">{loginError}</p> : null}
        </form>
      </div>
    </main>
  );
}
