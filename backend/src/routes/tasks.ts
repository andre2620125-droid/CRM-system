import { Router, Response } from "express";
import { db } from "../firebase";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { Task } from "../types";
import { FieldValue } from "firebase-admin/firestore";

const router = Router();
router.use(requireAuth);

// GET /api/tasks
router.get("/", async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const snapshot = await db
      .collection("tasks")
      .orderBy("createdAt", "desc")
      .get();
    const tasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(tasks);
  } catch {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// POST /api/tasks
router.post("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, dueDate, status, priority, relatedCustomerId, relatedLeadId } =
      req.body as Task;
    if (!title) {
      res.status(400).json({ error: "title is required" });
      return;
    }
    const doc = await db.collection("tasks").add({
      title,
      description: description ?? "",
      dueDate: dueDate ?? "",
      status: status ?? "pending",
      priority: priority ?? "medium",
      relatedCustomerId: relatedCustomerId ?? "",
      relatedLeadId: relatedLeadId ?? "",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    res.status(201).json({ id: doc.id });
  } catch {
    res.status(500).json({ error: "Failed to create task" });
  }
});

// GET /api/tasks/:id
router.get("/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doc = await db.collection("tasks").doc(req.params.id).get();
    if (!doc.exists) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch {
    res.status(500).json({ error: "Failed to fetch task" });
  }
});

// PATCH /api/tasks/:id
router.patch("/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ref = db.collection("tasks").doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    const allowed = ["title", "description", "dueDate", "status", "priority", "relatedCustomerId", "relatedLeadId"];
    const updates: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
    for (const key of allowed) {
      if (key in req.body) updates[key] = req.body[key];
    }
    await ref.update(updates);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to update task" });
  }
});

// DELETE /api/tasks/:id
router.delete("/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ref = db.collection("tasks").doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    await ref.delete();
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete task" });
  }
});

export default router;
