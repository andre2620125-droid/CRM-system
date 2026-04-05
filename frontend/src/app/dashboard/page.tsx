"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

interface Stats {
  customers: number;
  leads: number;
  tasks: number;
  openTasks: number;
}

export default function DashboardPage() {
  const { getToken } = useAuth();
  const [stats, setStats] = useState<Stats>({ customers: 0, leads: 0, tasks: 0, openTasks: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const token = await getToken();
      if (!token) return;
      try {
        const [customers, leads, tasks] = await Promise.all([
          api.getCustomers(token),
          api.getLeads(token),
          api.getTasks(token),
        ]);
        setStats({
          customers: customers.length,
          leads: leads.length,
          tasks: tasks.length,
          openTasks: tasks.filter((t) => t.status !== "completed").length,
        });
      } catch {
        // ignore — backend may not be reachable locally
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [getToken]);

  const cards = [
    { label: "Kunder", value: stats.customers, color: "bg-indigo-50 text-indigo-700", href: "/customers" },
    { label: "Leads", value: stats.leads, color: "bg-green-50 text-green-700", href: "/leads" },
    { label: "Opgaver i alt", value: stats.tasks, color: "bg-yellow-50 text-yellow-700", href: "/tasks" },
    { label: "Åbne opgaver", value: stats.openTasks, color: "bg-red-50 text-red-700", href: "/tasks" },
  ];

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

        {loading ? (
          <p className="text-gray-500 text-sm">Indlæser statistik...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cards.map((c) => (
              <a key={c.label} href={c.href} className="block">
                <div className={`rounded-xl p-5 ${c.color} shadow-sm hover:shadow-md transition-shadow`}>
                  <div className="text-3xl font-bold">{c.value}</div>
                  <div className="text-sm font-medium mt-1">{c.label}</div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
