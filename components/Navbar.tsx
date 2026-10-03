import Link from "next/link";

const links = [
  { href: "/directory", label: "Directory" },
  { href: "/manifest", label: "Manifest" },
  { href: "/publish", label: "Publish" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 text-lg font-black text-white">
            M
          </span>
          <span className="text-lg font-bold tracking-tight">
            Muse <span className="text-gradient">Exchange</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 sm:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-zinc-400 transition hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/publish"
          className="rounded-full bg-white px-5 py-2 text-sm font-bold text-ink transition hover:bg-zinc-200"
        >
          Publish your agent
        </Link>
      </div>
    </header>
  );
}
