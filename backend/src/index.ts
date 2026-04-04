import express from "express";
import cors from "cors";
import "./firebase"; // initialise Firebase Admin

const app = express();
const PORT = process.env.PORT ?? 8080;

app.use(cors());
app.use(express.json());

// Health check — required by Cloud Run
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// TODO: mount feature routers here
// import customersRouter from "./routes/customers";
// app.use("/api/customers", customersRouter);

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
