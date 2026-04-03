import { useState, useEffect, useCallback, useRef } from "react";
import { useUserAuth } from "@/contexts/user-auth";

export function useNotifications(intervalMs = 60_000) {
  const { token, isLoggedIn, isSeller, isBuyer } = useUserAuth();
  const [count, setCount] = useState(0);
  const [role, setRole] = useState<string>("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchCount = useCallback(async () => {
    if (!token || (!isSeller && !isBuyer)) return;
    try {
      const r = await fetch("/api/notifications/counts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) {
        const data = await r.json();
        setCount(data.count ?? 0);
        setRole(data.role ?? "");
      }
    } catch {
    }
  }, [token, isSeller, isBuyer]);

  useEffect(() => {
    if (!isLoggedIn) { setCount(0); return; }
    fetchCount();
    timerRef.current = setInterval(fetchCount, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLoggedIn, fetchCount, intervalMs]);

  return { count, role, refresh: fetchCount };
}
