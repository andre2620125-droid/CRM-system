const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

async function request<T>(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? "Request failed");
  }

  return res.json();
}

export const api = {
  // Customers
  getCustomers: (token: string) => request<Customer[]>("/api/customers", token),
  createCustomer: (token: string, data: Omit<Customer, "id">) =>
    request<{ id: string }>("/api/customers", token, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateCustomer: (token: string, id: string, data: Partial<Customer>) =>
    request<{ success: boolean }>(`/api/customers/${id}`, token, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteCustomer: (token: string, id: string) =>
    request<{ success: boolean }>(`/api/customers/${id}`, token, {
      method: "DELETE",
    }),

  // Leads
  getLeads: (token: string) => request<Lead[]>("/api/leads", token),
  createLead: (token: string, data: Omit<Lead, "id">) =>
    request<{ id: string }>("/api/leads", token, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateLead: (token: string, id: string, data: Partial<Lead>) =>
    request<{ success: boolean }>(`/api/leads/${id}`, token, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteLead: (token: string, id: string) =>
    request<{ success: boolean }>(`/api/leads/${id}`, token, {
      method: "DELETE",
    }),

  // Tasks
  getTasks: (token: string) => request<Task[]>("/api/tasks", token),
  createTask: (token: string, data: Omit<Task, "id">) =>
    request<{ id: string }>("/api/tasks", token, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateTask: (token: string, id: string, data: Partial<Task>) =>
    request<{ success: boolean }>(`/api/tasks/${id}`, token, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteTask: (token: string, id: string) =>
    request<{ success: boolean }>(`/api/tasks/${id}`, token, {
      method: "DELETE",
    }),
};

export interface Customer {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: "active" | "inactive" | "prospect";
  notes?: string;
}

export interface Lead {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  stage: "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
  value?: number;
  notes?: string;
}

export interface Task {
  id?: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  relatedCustomerId?: string;
  relatedLeadId?: string;
}
