import { Router, Response } from "express";
import { db } from "../firebase";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { Lead } from "../types";
import { FieldValue } from "firebase-admin/firestore";

const router = Router();
router.use(requireAuth);

// GET /api/leads
router.get("/", async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const snapshot = await db
      .collection("leads")
      .orderBy("createdAt", "desc")
      .get();
    const leads = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(leads);
  } catch {
    res.status(500).json({ error: "Failed to fetch leads" });
  }
});

// POST /api/leads
router.post("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, phone, company, stage, value, notes } = req.body as Lead;
    if (!name || !email) {
      res.status(400).json({ error: "name and email are required" });
      return;
    }
    const doc = await db.collection("leads").add({
      name,
      email,
      phone: phone ?? "",
      company: company ?? "",
      stage: stage ?? "new",
      value: value ?? 0,
      notes: notes ?? "",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    res.status(201).json({ id: doc.id });
  } catch {
    res.status(500).json({ error: "Failed to create lead" });
  }
});

// GET /api/leads/:id
router.get("/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doc = await db.collection("leads").doc(req.params.id).get();
    if (!doc.exists) {
      res.status(404).json({ error: "Lead not found" });
      return;
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch {
    res.status(500).json({ error: "Failed to fetch lead" });
  }
});

// PATCH /api/leads/:id
router.patch("/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ref = db.collection("leads").doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) {
      res.status(404).json({ error: "Lead not found" });
      return;
    }
    const allowed = ["name", "email", "phone", "company", "stage", "value", "notes"];
    const updates: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
    for (const key of allowed) {
      if (key in req.body) updates[key] = req.body[key];
    }
    await ref.update(updates);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to update lead" });
  }
});

// DELETE /api/leads/:id
router.delete("/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ref = db.collection("leads").doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) {
      res.status(404).json({ error: "Lead not found" });
      return;
    }
    await ref.delete();
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete lead" });
  }
});

export default router;
