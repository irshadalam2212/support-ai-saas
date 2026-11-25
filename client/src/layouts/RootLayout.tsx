import { useEffect } from "react";
import { Outlet } from "react-router";

import { usePageTitle } from "@/routes/usePageTitle";

export default function RootLayout() {
  const title = usePageTitle();

  useEffect(() => {
    document.title = title ? `${title} · SupportAI` : "SupportAI";
  }, [title]);

  return <Outlet />;
}
