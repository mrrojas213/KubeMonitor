import express from 'express';

const router = express.Router();

// Define your health routes here
router.get('/health', (req, res) => {
  res.send('Health check passed!');
});

export default router;