
import { parentPort, workerData } from "node:worker_threads";

const duration = workerData.durationMs;
const endTime = Date.now() + duration;

// Generate CPU load for a limited duration
while (Date.now() < endTime) {
  Math.sqrt(Math.random() * 1000000);
}

parentPort?.postMessage("CPU spike completed");
