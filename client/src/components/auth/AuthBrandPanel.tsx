import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

export default function AuthBrandPanel() {
  return (
    <aside className="relative isolate flex min-h-64 flex-col justify-between overflow-hidden bg-slate-950 px-6 py-6 text-white sm:px-10 lg:h-dvh lg:min-h-0 lg:px-12 lg:py-12 xl:px-16">
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

      <Link to="/" className="relative z-10 flex w-fit items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 shadow-lg shadow-black/10">
          <Sparkles aria-hidden="true" className="size-5 text-violet-200" />
        </span>
        <span className="text-lg font-semibold tracking-tight">SupportAI</span>
      </Link>

      <div className="relative z-10 mt-8 max-w-xl lg:my-auto lg:mt-0 lg:pb-16">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-200/90">
          Customer support workspace
        </p>
        <h1 className="mt-5 max-w-lg text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl xl:text-6xl">
          Support deserves a thoughtful start.
        </h1>
        <p className="mt-5 max-w-lg text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
          A calm, secure home for your team and the customers you help.
        </p>

        <div aria-hidden="true" className="mt-8 flex items-center gap-2">
          <span className="h-1 w-10 rounded-full bg-violet-300" />
          <span className="h-1 w-5 rounded-full bg-white/25" />
          <span className="h-1 w-5 rounded-full bg-white/15" />
        </div>
      </div>

      <p className="relative z-10 hidden text-xs text-slate-400 lg:block">
        © 2026 SupportAI. All rights reserved.
      </p>
    </aside>
  );
}
