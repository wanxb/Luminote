"use client";

import { useEffect, useRef } from "react";
import { getAdminSession, logoutAdmin } from "@/lib/api/admin-client";

export const ADMIN_SESSION_IDLE_TIMEOUT_MS = 2 * 60 * 60 * 1000;
const SESSION_REFRESH_THROTTLE_MS = 5 * 60 * 1000;

export function useAdminSessionTimeout(hasSession: boolean, onExpired: () => void) {
  const timeoutIdRef = useRef<number | null>(null);
  const lastRefreshAtRef = useRef<number>(Date.now());
  const isHandlingExpiryRef = useRef(false);

  useEffect(() => {
    if (!hasSession) {
      if (timeoutIdRef.current) {
        window.clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
      isHandlingExpiryRef.current = false;
      return;
    }

    const handleExpiry = async () => {
      if (isHandlingExpiryRef.current) {
        return;
      }

      isHandlingExpiryRef.current = true;

      try {
        await logoutAdmin();
      } catch {
        // Ignore logout cleanup failures and continue clearing client state.
      }

      onExpired();
    };

    const resetIdleTimer = () => {
      if (timeoutIdRef.current) {
        window.clearTimeout(timeoutIdRef.current);
      }

      timeoutIdRef.current = window.setTimeout(() => {
        void handleExpiry();
      }, ADMIN_SESSION_IDLE_TIMEOUT_MS);
    };

    const refreshSessionIfNeeded = async () => {
      const now = Date.now();

      if (now - lastRefreshAtRef.current < SESSION_REFRESH_THROTTLE_MS) {
        return;
      }

      lastRefreshAtRef.current = now;

      try {
        const result = await getAdminSession();

        if (!result.authenticated) {
          await handleExpiry();
        }
      } catch {
        await handleExpiry();
      }
    };

    const handleActivity = () => {
      resetIdleTimer();
      void refreshSessionIfNeeded();
    };

    lastRefreshAtRef.current = Date.now();
    resetIdleTimer();

    const events: Array<keyof WindowEventMap> = ["pointerdown", "keydown", "wheel", "touchstart"];

    for (const eventName of events) {
      window.addEventListener(eventName, handleActivity, { passive: true });
    }

    return () => {
      for (const eventName of events) {
        window.removeEventListener(eventName, handleActivity);
      }

      if (timeoutIdRef.current) {
        window.clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
    };
  }, [hasSession, onExpired]);
}
