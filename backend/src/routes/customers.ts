import { Router, Response } from "express";
import { db } from "../firebase";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { Customer } from "../types";
import { FieldValue } from "firebase-admin/firestore";

const router = Router();
router.use(requireAuth);

// GET /api/customers
router.get("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const snapshot = await db
      .collection("customers")
      .orderBy("createdAt", "desc")
      .get();
    const customers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

// POST /api/customers
router.post("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, phone, company, status, notes } = req.body as Customer;
    if (!name || !email) {
      res.status(400).json({ error: "name and email are required" });
      return;
    }
    const doc = await db.collection("customers").add({
      name,
      email,
      phone: phone ?? "",
      company: company ?? "",
      status: status ?? "prospect",
      notes: notes ?? "",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    res.status(201).json({ id: doc.id });
  } catch {
    res.status(500).json({ error: "Failed to create customer" });
  }
});

// GET /api/customers/:id
router.get("/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doc = await db.collection("customers").doc(req.params.id).get();
    if (!doc.exists) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch {
    res.status(500).json({ error: "Failed to fetch customer" });
  }
});

// PATCH /api/customers/:id
router.patch("/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ref = db.collection("customers").doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }
    const allowed = ["name", "email", "phone", "company", "status", "notes"];
    const updates: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
    for (const key of allowed) {
      if (key in req.body) updates[key] = req.body[key];
    }
    await ref.update(updates);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to update customer" });
  }
});

// DELETE /api/customers/:id
router.delete("/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ref = db.collection("customers").doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }
    await ref.delete();
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete customer" });
  }
});

export default router;
