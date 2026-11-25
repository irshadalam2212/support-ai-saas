import type { ReactNode } from "react";
import { Link } from "react-router";

import AuthBrandPanel from "@/components/auth/AuthBrandPanel";
import Logo from "@/components/shared/Logo";

type AuthLayoutProps = {
  title: string;
  description?: ReactNode;
  children: ReactNode;
};

/** Brand panel beside a single-column form. The panel is hidden on small screens. */
export default function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <div className="min-h-dvh bg-background lg:grid lg:h-dvh lg:grid-cols-2 lg:overflow-hidden">
      <AuthBrandPanel />
      <main className="flex min-h-dvh flex-col px-4 py-8 sm:px-6 lg:h-dvh lg:min-h-0 lg:overflow-y-auto lg:px-10">
        <div className="m-auto w-full max-w-sm">
          <Link to="/" className="mx-auto mb-8 block w-fit rounded-md lg:hidden">
            <Logo />
          </Link>
          <header className="mb-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
            {description && <p className="mt-2 text-sm leading-6 break-words text-muted-foreground">{description}</p>}
          </header>
          {children}
        </div>
      </main>
    </div>
  );
}
