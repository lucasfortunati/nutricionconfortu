import Link from "next/link";

const LINKS = [
  { href: "/", label: "Calculadora" },
  { href: "/perfiles", label: "Perfiles" },
  { href: "/admin/alimentos", label: "Admin" },
] as const;

export function SiteNav() {
  return (
    <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex w-full max-w-4xl items-center gap-1 overflow-x-auto px-4 py-2 sm:px-6">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
