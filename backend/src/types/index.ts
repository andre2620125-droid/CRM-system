export interface Customer {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: "active" | "inactive" | "prospect";
  notes?: string;
  createdAt?: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
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
  createdAt?: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
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
  createdAt?: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
}
