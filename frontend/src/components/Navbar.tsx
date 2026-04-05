"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/customers", label: "Kunder" },
  { href: "/leads", label: "Leads" },
  { href: "/tasks", label: "Opgaver" },
];

export default function Navbar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  if (!user) return null;

  return (
    <nav className="bg-indigo-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <span className="font-bold text-lg tracking-tight">CRM</span>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium hover:text-indigo-200 transition-colors ${
                pathname.startsWith(l.href) ? "text-white underline" : "text-indigo-200"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-indigo-300">{user.email}</span>
          <button
            onClick={handleSignOut}
            className="text-xs bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded transition-colors"
          >
            Log ud
          </button>
        </div>
      </div>
    </nav>
  );
}
