import express from "express";
import cors from "cors";
import "./firebase"; // initialise Firebase Admin
import customersRouter from "./routes/customers";
import leadsRouter from "./routes/leads";
import tasksRouter from "./routes/tasks";

const app = express();
const PORT = process.env.PORT ?? 8080;

app.use(cors());
app.use(express.json());

// Health check — required by Cloud Run
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/customers", customersRouter);
app.use("/api/leads", leadsRouter);
app.use("/api/tasks", tasksRouter);

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
