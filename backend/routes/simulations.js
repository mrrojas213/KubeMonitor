import express from 'express';

const router = express.Router();

// Define your simulations routes here
router.post('/simulations/cpu-spike', (req, res) => {
    res.send('Simulation created successfully!');
});

router.post('/simulations/pod-crash', (req, res) => {
    res.send('Simulation created successfully!');
});

export default router;