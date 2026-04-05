"use client";

import { useEffect, useState, FormEvent } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { api, Task } from "@/lib/api";

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-600",
};
const PRIORITY_LABELS: Record<string, string> = { low: "Lav", medium: "Medium", high: "Høj" };

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-100 text-gray-600",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
};
const STATUS_LABELS: Record<string, string> = { pending: "Afventer", in_progress: "I gang", completed: "Færdig" };

const emptyForm = (): Omit<Task, "id"> => ({
  title: "", description: "", dueDate: "", status: "pending", priority: "medium",
});

export default function TasksPage() {
  const { getToken } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | Task["status"]>("all");

  async function load() {
    const token = await getToken();
    if (!token) return;
    try {
      setTasks(await api.getTasks(token));
    } catch {
      setError("Kunne ikke hente opgaver");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function openNew() { setEditId(null); setForm(emptyForm()); setShowForm(true); }
  function openEdit(t: Task) {
    setEditId(t.id!);
    setForm({ title: t.title, description: t.description ?? "", dueDate: t.dueDate ?? "", status: t.status, priority: t.priority });
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Slet opgaven?")) return;
    const token = await getToken();
    if (!token) return;
    await api.deleteTask(token, id);
    await load();
  }

  async function toggleStatus(t: Task) {
    const next: Task["status"] = t.status === "completed" ? "pending" : t.status === "pending" ? "in_progress" : "completed";
    const token = await getToken();
    if (!token) return;
    await api.updateTask(token, t.id!, { status: next });
    await load();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const token = await getToken();
      if (!token) return;
      if (editId) await api.updateTask(token, editId, form);
      else await api.createTask(token, form);
      setShowForm(false);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Fejl");
    } finally {
      setSaving(false);
    }
  }

  const displayed = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Opgaver</h1>
          <button onClick={openNew} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            + Ny opgave
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4">
          {(["all", "pending", "in_progress", "completed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                filter === f ? "bg-indigo-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {f === "all" ? "Alle" : STATUS_LABELS[f]}
            </button>
          ))}
        </div>

        {error && <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>}

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">{editId ? "Rediger opgave" : "Ny opgave"}</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titel *</label>
                  <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Beskrivelse</label>
                  <textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Forfaldsdato</label>
                    <input type="date" value={form.dueDate ?? ""} onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prioritet</label>
                    <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Task["priority"] })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="low">Lav</option>
                      <option value="medium">Medium</option>
                      <option value="high">Høj</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Task["status"] })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="pending">Afventer</option>
                      <option value="in_progress">I gang</option>
                      <option value="completed">Færdig</option>
                    </select>
                  </div>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="flex gap-2 pt-2">
                  <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg">
                    {saving ? "Gemmer..." : "Gem"}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-2 rounded-lg hover:bg-gray-50">
                    Annuller
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Task list */}
        {loading ? (
          <p className="text-gray-500 text-sm">Indlæser...</p>
        ) : displayed.length === 0 ? (
          <p className="text-gray-500 text-sm">Ingen opgaver fundet.</p>
        ) : (
          <div className="space-y-2">
            {displayed.map((t) => (
              <div key={t.id} className={`bg-white rounded-xl shadow-sm p-4 flex items-start gap-3 ${t.status === "completed" ? "opacity-60" : ""}`}>
                <button
                  onClick={() => toggleStatus(t)}
                  className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors ${
                    t.status === "completed" ? "bg-green-500 border-green-500" : t.status === "in_progress" ? "border-blue-400" : "border-gray-300"
                  }`}
                  title="Skift status"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-medium text-sm text-gray-800 ${t.status === "completed" ? "line-through" : ""}`}>{t.title}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[t.priority]}`}>{PRIORITY_LABELS[t.priority]}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[t.status]}`}>{STATUS_LABELS[t.status]}</span>
                    {t.dueDate && <span className="text-xs text-gray-400">{t.dueDate}</span>}
                  </div>
                  {t.description && <p className="text-xs text-gray-500 mt-1 truncate">{t.description}</p>}
                </div>
                <div className="flex gap-3 text-xs font-medium flex-shrink-0">
                  <button onClick={() => openEdit(t)} className="text-indigo-600 hover:text-indigo-800">Rediger</button>
                  <button onClick={() => handleDelete(t.id!)} className="text-red-500 hover:text-red-700">Slet</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
