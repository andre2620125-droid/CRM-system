"use client";

import { useEffect, useState, FormEvent } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { api, Lead } from "@/lib/api";

const STAGES: Lead["stage"][] = ["new", "contacted", "qualified", "proposal", "won", "lost"];

const STAGE_LABELS: Record<string, string> = {
  new: "Ny",
  contacted: "Kontaktet",
  qualified: "Kvalificeret",
  proposal: "Tilbud",
  won: "Vundet",
  lost: "Tabt",
};

const STAGE_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-indigo-100 text-indigo-700",
  qualified: "bg-purple-100 text-purple-700",
  proposal: "bg-yellow-100 text-yellow-700",
  won: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-600",
};

const emptyForm = (): Omit<Lead, "id"> => ({
  name: "", email: "", phone: "", company: "", stage: "new", value: 0, notes: "",
});

export default function LeadsPage() {
  const { getToken } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const token = await getToken();
    if (!token) return;
    try {
      setLeads(await api.getLeads(token));
    } catch {
      setError("Kunne ikke hente leads");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function openNew() { setEditId(null); setForm(emptyForm()); setShowForm(true); }
  function openEdit(l: Lead) {
    setEditId(l.id!);
    setForm({ name: l.name, email: l.email, phone: l.phone ?? "", company: l.company ?? "", stage: l.stage, value: l.value ?? 0, notes: l.notes ?? "" });
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Slet dette lead?")) return;
    const token = await getToken();
    if (!token) return;
    await api.deleteLead(token, id);
    await load();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const token = await getToken();
      if (!token) return;
      if (editId) await api.updateLead(token, editId, form);
      else await api.createLead(token, form);
      setShowForm(false);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Fejl");
    } finally {
      setSaving(false);
    }
  }

  // Group by stage for kanban-style display
  const byStage = STAGES.map((s) => ({ stage: s, items: leads.filter((l) => l.stage === s) }));

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Leads</h1>
          <button onClick={openNew} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            + Nyt lead
          </button>
        </div>

        {error && <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>}

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">{editId ? "Rediger lead" : "Nyt lead"}</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <InputField label="Navn *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
                <InputField label="Email *" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
                <InputField label="Telefon" value={form.phone ?? ""} onChange={(v) => setForm({ ...form, phone: v })} />
                <InputField label="Virksomhed" value={form.company ?? ""} onChange={(v) => setForm({ ...form, company: v })} />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                    <select
                      value={form.stage}
                      onChange={(e) => setForm({ ...form, stage: e.target.value as Lead["stage"] })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {STAGES.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Værdi (kr.)</label>
                    <input
                      type="number"
                      value={form.value ?? 0}
                      onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Noter</label>
                  <textarea
                    value={form.notes ?? ""}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
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

        {/* Pipeline board */}
        {loading ? (
          <p className="text-gray-500 text-sm">Indlæser...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {byStage.map(({ stage, items }) => (
              <div key={stage} className="bg-white rounded-xl shadow-sm p-3">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STAGE_COLORS[stage]}`}>
                    {STAGE_LABELS[stage]}
                  </span>
                  <span className="text-xs text-gray-400">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((lead) => (
                    <div key={lead.id} className="bg-gray-50 rounded-lg p-2 text-xs">
                      <div className="font-medium text-gray-800 truncate">{lead.name}</div>
                      {lead.company && <div className="text-gray-500 truncate">{lead.company}</div>}
                      {(lead.value ?? 0) > 0 && (
                        <div className="text-green-600 font-medium mt-1">
                          {lead.value?.toLocaleString("da-DK")} kr.
                        </div>
                      )}
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => openEdit(lead)} className="text-indigo-600 hover:text-indigo-800 font-medium">Rediger</button>
                        <button onClick={() => handleDelete(lead.id!)} className="text-red-500 hover:text-red-700 font-medium">Slet</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

function InputField({ label, value, onChange, type = "text", required = false }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
    </div>
  );
}
