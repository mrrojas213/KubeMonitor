import express from "express";

const router = express.Router();

// Define your health routes here
router.get("/health", (req, res) => {
  res.send("Health check passed!");
});

router.get("/health/live", (req, res) => {
  res.send("Liveness check passed!");
});

router.get("/health/ready", (req, res) => {
  res.send("Readiness check passed!");
});


export default router;
