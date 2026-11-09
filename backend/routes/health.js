import express from "express";

const router = express.Router();

// Define your health routes here
router.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", });
});

router.get("/health/live", (req, res) => {
  res.status(200).json({ status: "alive" });
});

router.get("/health/ready", (req, res) => {
  res.status(200).json({ status: "ready" });
});


export default router;
