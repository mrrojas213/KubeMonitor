import express from 'express';
import { getClusterData } from "../services/kubernetes.js";
const router = express.Router();

// Define your dashboard routes here
router.get("/dashboard", async (req, res) => {
  try {
    const kubernetes = await getClusterData();

    res.json({
      cluster: "kube-monitor-eks",
      timestamp: new Date().toISOString(),
      kubernetes,
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    res.status(500).json({
      error: "Unable to retrieve Kubernetes data",
    });
  }
});
export default router;