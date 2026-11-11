
import express from "express";

import { getClusterData } from "../services/kubernetes.js";
import { getPodAuditEvents } from "../services/cloudwatch-logs.js";
import {
  getCloudWatchMetrics,
  getCloudWatchAlarms,
} from "../services/cloudwatch.js";

const router = express.Router();

router.get("/dashboard", async (req, res) => {
  try {
    const [kubernetes, cloudwatch, alarms, events] = await Promise.all([
      getClusterData(),
      getCloudWatchMetrics(),
      getCloudWatchAlarms(),
      getPodAuditEvents().catch((error) => {
      console.error("CloudWatch Logs error:", error);
      return [];
    }),
    ]);

    res.json({
      cluster: "kube-monitor-eks",
      timestamp: new Date().toISOString(),
      kubernetes,
      cloudwatch,
      alarms,
      events
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    res.status(500).json({
      error: "Unable to retrieve dashboard data",
    });
  }
});

export default router;
