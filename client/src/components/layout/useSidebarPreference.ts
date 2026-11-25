import { useCallback, useState } from "react";

const STORAGE_KEY = "supportai.sidebarOpen";

/** Remembers the desktop sidebar state. Starts collapsed on narrow screens. */
export function useSidebarPreference() {
  const [open, setOpen] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === null ? window.innerWidth >= 1024 : stored === "true";
  });
  const changeOpen = useCallback((next: boolean) => {
    setOpen(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  }, []);
  return [open, changeOpen] as const;
}
