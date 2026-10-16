import express from "express"

import healthRoutes from './routes/health.js'
import dashboardRoutes from './routes/dashboard.js'
import simulationsRoutes from './routes/simulations.js'

const app = express()
app.use(express.json())

app.use('/api', healthRoutes)
app.use('/api', dashboardRoutes)
app.use('/api', simulationsRoutes)

const port = 8000

app.listen(port, ()=> console.log(`Server is listening on port ${port}...`))