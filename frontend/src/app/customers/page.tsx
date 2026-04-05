"use client";

import { useEffect, useState, FormEvent } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { api, Customer } from "@/lib/api";

const STATUS_LABELS: Record<string, string> = {
  active: "Aktiv",
  inactive: "Inaktiv",
  prospect: "Emne",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-600",
  prospect: "bg-yellow-100 text-yellow-700",
};

const emptyForm = (): Omit<Customer, "id"> => ({
  name: "",
  email: "",
  phone: "",
  company: "",
  status: "prospect",
  notes: "",
});

export default function CustomersPage() {
  const { getToken } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
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
      setCustomers(await api.getCustomers(token));
    } catch {
      setError("Kunne ikke hente kunder");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function openNew() {
    setEditId(null);
    setForm(emptyForm());
    setShowForm(true);
  }

  function openEdit(c: Customer) {
    setEditId(c.id!);
    setForm({ name: c.name, email: c.email, phone: c.phone ?? "", company: c.company ?? "", status: c.status, notes: c.notes ?? "" });
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Slet denne kunde?")) return;
    const token = await getToken();
    if (!token) return;
    await api.deleteCustomer(token, id);
    await load();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const token = await getToken();
      if (!token) return;
      if (editId) {
        await api.updateCustomer(token, editId, form);
      } else {
        await api.createCustomer(token, form);
      }
      setShowForm(false);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Fejl");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Kunder</h1>
          <button onClick={openNew} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            + Ny kunde
          </button>
        </div>

        {error && <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>}

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">{editId ? "Rediger kunde" : "Ny kunde"}</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <Field label="Navn *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
                <Field label="Email *" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
                <Field label="Telefon" value={form.phone ?? ""} onChange={(v) => setForm({ ...form, phone: v })} />
                <Field label="Virksomhed" value={form.company ?? ""} onChange={(v) => setForm({ ...form, company: v })} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as Customer["status"] })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="prospect">Emne</option>
                    <option value="active">Aktiv</option>
                    <option value="inactive">Inaktiv</option>
                  </select>
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

        {/* Table */}
        {loading ? (
          <p className="text-gray-500 text-sm">Indlæser...</p>
        ) : customers.length === 0 ? (
          <p className="text-gray-500 text-sm">Ingen kunder endnu. Opret den første!</p>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Navn", "Email", "Telefon", "Virksomhed", "Status", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{c.name}</td>
                    <td className="px-4 py-3 text-gray-600">{c.email}</td>
                    <td className="px-4 py-3 text-gray-600">{c.phone}</td>
                    <td className="px-4 py-3 text-gray-600">{c.company}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[c.status]}`}>
                        {STATUS_LABELS[c.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openEdit(c)} className="text-indigo-600 hover:text-indigo-800 mr-3 text-xs font-medium">Rediger</button>
                      <button onClick={() => handleDelete(c.id!)} className="text-red-500 hover:text-red-700 text-xs font-medium">Slet</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

function Field({
  label, value, onChange, type = "text", required = false,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}
