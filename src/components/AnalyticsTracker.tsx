import { useEffect, useRef } from "react";

type VisitPayload = {
  path: string;
  userAgent: string;
  referrer?: string;
  screenWidth?: number;
};

function sendVisit(payload: VisitPayload) {
  try {
    const url = "/api/analytics/visit";
    const body = JSON.stringify(payload);

    // Prefer sendBeacon for fire-and-forget on unload/navigation
    if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      const blob = new Blob([body], { type: "application/json" });
      try {
        // sendBeacon returns boolean, but we don't need to act on it
        (navigator as any).sendBeacon(url, blob);
        return;
      } catch (e) {
        // fall through to fetch
      }
    }

    // Fire-and-forget fetch; don't await so it doesn't block UI
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {
      // Fail silently
    });
  } catch (err) {
    // Silent failure per spec
    // eslint-disable-next-line no-console
    console.debug("AnalyticsTracker: failed to send visit", err);
  }
}

export default function AnalyticsTracker() {
  const lastPathRef = useRef<string>("");

  useEffect(() => {
    // Helper to extract visit info and send
    const track = (p?: string) => {
      try {
        const path = p ?? window.location.pathname + window.location.search;
        if (!path) return;

        // Avoid duplicate sends for the same path in quick succession
        if (lastPathRef.current === path) return;
        lastPathRef.current = path;

        const payload: VisitPayload = {
          path,
          userAgent: navigator.userAgent || "",
          referrer: document.referrer || undefined,
          screenWidth: typeof window !== "undefined" ? window.innerWidth : undefined,
        };

        sendVisit(payload);
      } catch (err) {
        // Silent failure
      }
    };

    // Track initial load
    track();

    // Listen for popstate (back/forward)
    const onPop = () => track();
    window.addEventListener("popstate", onPop);

    // Monkey-patch pushState/replaceState to emit an event we can listen to
    const origPush = window.history.pushState;
    const origReplace = window.history.replaceState;

    const patchedDispatch = (fn: (...args: any[]) => any) => (...args: any[]) => {
      const res = fn.apply(window.history, args as any);
      try {
        const ev = new Event("navigation");
        window.dispatchEvent(ev);
      } catch (e) {
        // ignore
      }
      return res;
    };

    // @ts-ignore
    window.history.pushState = patchedDispatch(origPush);
    // @ts-ignore
    window.history.replaceState = patchedDispatch(origReplace);

    const onNav = () => {
      // small timeout to allow the pathname to update
      setTimeout(() => track(), 50);
    };

    window.addEventListener("navigation", onNav);

    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("navigation", onNav);
      // restore originals
      try {
        // @ts-ignore
        window.history.pushState = origPush;
        // @ts-ignore
        window.history.replaceState = origReplace;
      } catch (e) {
        // ignore
      }
    };
  }, []);

  return null;
}
