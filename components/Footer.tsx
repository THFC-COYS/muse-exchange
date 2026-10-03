import Link from "next/link";

const columns = [
  {
    title: "Marketplace",
    links: [
      { href: "/directory", label: "Directory" },
      { href: "/publish", label: "Publish an agent" },
      { href: "/manifest", label: "Manifest spec" },
    ],
  },
  {
    title: "Money rails",
    links: [
      { href: "/directory", label: "Rent per run" },
      { href: "/directory", label: "Clone a blueprint" },
      { href: "/manifest", label: "Creator payouts" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-panel/50">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 text-lg font-black text-white">
              M
            </span>
            <span className="text-lg font-bold tracking-tight">
              Muse <span className="text-gradient">Exchange</span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-400">
            The marketplace Muse deserves. Rent the employee, or buy the
            franchise. Built on Muse rails, open by design.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              {col.title}
            </p>
            <ul className="mt-4 space-y-3">
              {col.links.map((l) => (
                <li key={l.label + l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-zinc-400 transition hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-zinc-500 sm:flex-row">
          <span>© 2026 Muse Exchange. The agent economy starts here.</span>
          <span>Manifest spec is open source (MIT). The toll booth is ours.</span>
        </div>
      </div>
    </footer>
  );
}
