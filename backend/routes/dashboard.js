import express from 'express';

const router = express.Router();

// Define your dashboard routes here
router.get('/dashboard', (req, res) => {
  res.send('Welcome to the Dashboard!');
});

export default router;