import { Link } from "react-router";

import Logo from "@/components/shared/Logo";

export default function AuthBrandPanel() {
  return (
    <aside className="relative isolate hidden h-dvh flex-col overflow-hidden bg-slate-950 px-12 py-12 text-white lg:flex xl:px-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-28 size-96 rounded-full bg-violet-500/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-36 -left-24 size-96 rounded-full bg-blue-500/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]"
      />

      <Link to="/" className="relative z-10 w-fit rounded-md">
        <Logo inverted />
      </Link>

      <div className="relative z-10 my-auto max-w-xl py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-200/90">
          Customer support workspace
        </p>
        <p className="mt-5 max-w-lg text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
          Support deserves a thoughtful start.
        </p>
        <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
          A calm, secure home for your team and the customers you help.
        </p>
      </div>

      <p className="relative z-10 text-xs text-slate-400">© 2026 SupportAI. All rights reserved.</p>
    </aside>
  );
}
