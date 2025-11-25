"use client";

import { Spinner } from "@heroui/spinner";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface NavigationLoaderContextValue {
  show: () => void;
  hide: () => void;
}

const MIN_VISIBLE_DURATION = 250;

const NavigationLoaderContext =
  createContext<NavigationLoaderContextValue | null>(null);

export const NavigationLoaderProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const showRef = useRef<() => void>(() =>
    Promise.resolve().then(() => setIsVisible(true)),
  );
  const lastLocationRef = useRef<string | null>(null);
  const showTimestampRef = useRef<number | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getNow = useCallback(() => {
    if (
      typeof performance !== "undefined" &&
      typeof performance.now === "function"
    ) {
      return performance.now();
    }

    return Date.now();
  }, []);

  const clearHideTimeout = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const getCurrentLocation = useCallback(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return `${window.location.pathname}${window.location.search}`;
  }, []);

  const normalizeTarget = useCallback(
    (target: unknown): string | null => {
      if (typeof window === "undefined" || target == null) {
        return null;
      }

      if (typeof target === "string") {
        if (target.startsWith("#")) {
          return getCurrentLocation();
        }

        try {
          const url = new URL(target, window.location.href);

          return `${url.pathname}${url.search}`;
        } catch {
          return null;
        }
      }

      if (target instanceof URL) {
        return `${target.pathname}${target.search}`;
      }

      return null;
    },
    [getCurrentLocation],
  );

  const shouldSkipNavigation = useCallback(
    (target: unknown) => {
      const normalizedTarget = normalizeTarget(target);

      if (!normalizedTarget) {
        return false;
      }

      return normalizedTarget === lastLocationRef.current;
    },
    [normalizeTarget],
  );

  const show = useCallback(() => {
    clearHideTimeout();
    showTimestampRef.current = getNow();

    Promise.resolve().then(() => setIsVisible(true));
  }, [clearHideTimeout, getNow]);

  const scheduleHide = useCallback(() => {
    clearHideTimeout();

    const now = getNow();
    const shownAt = showTimestampRef.current ?? now;
    const elapsed = now - shownAt;
    const delay = Math.max(0, MIN_VISIBLE_DURATION - elapsed);

    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      hideTimeoutRef.current = null;
      showTimestampRef.current = null;
    }, delay);
  }, [clearHideTimeout, getNow]);

  const hide = useCallback(() => {
    scheduleHide();
  }, [scheduleHide]);

  useEffect(() => {
    showRef.current = show;
  }, [show]);

  useEffect(() => {
    const currentLocation = getCurrentLocation();

    if (currentLocation) {
      lastLocationRef.current = currentLocation;
    }

    hide();
  }, [pathname, getCurrentLocation, hide]);

  useEffect(() => {
    return () => {
      clearHideTimeout();
    };
  }, [clearHideTimeout]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!lastLocationRef.current) {
      const initialLocation = getCurrentLocation();

      if (initialLocation) {
        lastLocationRef.current = initialLocation;
      }
    }

    const wrapHistoryMethod = (original: typeof window.history.pushState) => {
      const interceptor = function historyInterceptor(
        this: History,
        data: any,
        unused: string,
        url?: string | URL | null,
      ): void {
        if (!shouldSkipNavigation(url)) {
          showRef.current();
        }

        original.call(window.history, data, unused, url);
      };

      return interceptor as typeof window.history.pushState;
    };

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = wrapHistoryMethod(originalPushState);
    window.history.replaceState = wrapHistoryMethod(originalReplaceState);

    const handlePopState = () => {
      const current = getCurrentLocation();

      if (!current || current === lastLocationRef.current) {
        return;
      }

      showRef.current();
      lastLocationRef.current = current;
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", handlePopState);
    };
  }, [getCurrentLocation, shouldSkipNavigation]);

  useEffect(() => {
    const originalPush = router.push;
    const originalReplace = router.replace;
    const originalBack = router.back;
    const originalRefresh = router.refresh;

    router.push = (href, options) => {
      if (!shouldSkipNavigation(href)) {
        showRef.current();
      }

      originalPush.call(router, href, options);
    };

    router.replace = (href, options) => {
      if (!shouldSkipNavigation(href)) {
        showRef.current();
      }

      originalReplace.call(router, href, options);
    };

    router.back = () => {
      showRef.current();
      originalBack.call(router);
    };

    router.refresh = () => {
      showRef.current();
      originalRefresh.call(router);
    };

    return () => {
      router.push = originalPush;
      router.replace = originalReplace;
      router.back = originalBack;
      router.refresh = originalRefresh;
    };
  }, [router, shouldSkipNavigation]);

  const value = useMemo(() => ({ show, hide }), [show, hide]);

  return (
    <NavigationLoaderContext.Provider value={value}>
      {children}
      <NavigationOverlay isVisible={isVisible} />
    </NavigationLoaderContext.Provider>
  );
};

export const NavigationOverlay = ({
  isVisible = true,
}: {
  isVisible?: boolean;
}) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Spinner color="primary" label="Ładowanie..." size="lg" />
    </div>
  );
};

export const useNavigationLoader = () => {
  const context = useContext(NavigationLoaderContext);

  if (!context) {
    throw new Error(
      "useNavigationLoader must be used within NavigationLoaderProvider",
    );
  }

  return context;
};
