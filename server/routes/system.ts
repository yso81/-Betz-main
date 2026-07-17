import express from "express";
import { dbEngine } from "../../src/backendDb_supa";

const router = express.Router();

router.get("/state", async (_req, res) => {
  try {
    const state = await dbEngine.getSystemState();
    res.json(state);
  } catch (e) {
    res.status(500).json({ error: "Failed to load system state" });
  }
});

export default router;
