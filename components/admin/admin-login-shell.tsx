"use client";

import { useEffect, useState } from "react";
import { SummerShadowBackground } from "@/components/site/summer-shadow-background";
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
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f0e4] px-6">
        <SummerShadowBackground />
        <p className="relative z-10 text-sm text-[#3a312a]/70">检查登录状态中...</p>
      </main>
    );
  }

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#f5f0e4] text-ink">
      <SummerShadowBackground />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-8">
        <div className="w-full max-w-[430px] rounded-[30px] border border-[rgba(255,255,255,0.5)] bg-[rgba(245,240,228,0.38)] px-7 py-8 shadow-[0_18px_48px_rgba(96,82,58,0.08)] sm:px-8">
          <form className="space-y-5" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label className="block text-xs font-medium uppercase tracking-[0.28em] text-[#312a25]/62">账号</label>
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                maxLength={TEXT_LIMITS.adminUsername}
                className="w-full rounded-full border border-[rgba(255,255,255,0.52)] bg-[rgba(255,255,255,0.26)] px-5 py-3.5 text-sm text-[#2a231c] outline-none transition placeholder:text-[#5a4e42]/50 focus:border-[rgba(255,255,255,0.82)] focus:bg-[rgba(255,255,255,0.34)]"
                placeholder="输入管理员账号"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium uppercase tracking-[0.28em] text-[#312a25]/62">密码</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                maxLength={TEXT_LIMITS.password}
                className="w-full rounded-full border border-[rgba(255,255,255,0.52)] bg-[rgba(255,255,255,0.26)] px-5 py-3.5 text-sm text-[#2a231c] outline-none transition placeholder:text-[#5a4e42]/50 focus:border-[rgba(255,255,255,0.82)] focus:bg-[rgba(255,255,255,0.34)]"
                placeholder="输入管理员密码"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full rounded-full border border-[rgba(255,255,255,0.34)] bg-[rgba(68,60,50,0.54)] px-6 py-3.5 text-sm uppercase tracking-[0.24em] text-[#faf6ef] transition hover:bg-[rgba(52,45,38,0.64)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoggingIn ? "登录中" : "登录"}
            </button>

            {loginError ? <p className="text-center text-sm text-[#6f140f]">{loginError}</p> : null}
          </form>
        </div>
      </div>
    </main>
  );
}
