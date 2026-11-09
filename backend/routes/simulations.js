import express from "express";
import { Worker } from "node:worker_threads";
import * as k8s from "@kubernetes/client-node";

const router = express.Router();

let cpuWorker = null;
let lastStart = 0;


router.post("/simulations/cpu-spike", (req, res) => {
  // Disabled unless explicitly enabled in Kubernetes
  if (process.env.ENABLE_CPU_SIMULATION !== "true") {
    return res.status(403).json({
      error: "CPU simulation is disabled",
    });
  }

  if (cpuWorker) {
    return res.status(409).json({
      message: "CPU spike already running on this Pod",
    });
  }

  // Prevent repeated triggers on the same Pod
  if (Date.now() - lastStart < 120000) {
    return res.status(429).json({
      message: "Please wait before starting another spike",
    });
  }

  try {
    const worker = new Worker(new URL("../cpu-spike.js", import.meta.url), {
      workerData: {
        durationMs: 60000,
      },
    });

    cpuWorker = worker;
    lastStart = Date.now();

    worker.on("message", (message) => {
      console.log(message);
    });

    worker.on("error", (error) => {
      console.error("CPU worker error:", error);
    });

    worker.on("exit", (code) => {
      console.log(`CPU worker exited: ${code}`);

      if (cpuWorker === worker) {
        cpuWorker = null;
      }
    });

    return res.status(202).json({
      message: "CPU spike started",
      durationSeconds: 60,
    });
  } catch (error) {
    cpuWorker = null;

    return res.status(500).json({
      error: "Failed to start CPU spike",
    });
  }
});



// Reuse this client for Pod deletion
const kc = new k8s.KubeConfig();

if (process.env.KUBERNETES_SERVICE_HOST) {
  kc.loadFromCluster();
} else {
  kc.loadFromDefault();
}

const coreApi = kc.makeApiClient(k8s.CoreV1Api);

router.post("/simulations/pod-crash", async (req, res) => {
  if (process.env.ENABLE_POD_CRASH_SIMULATION !== "true") {
    return res.status(403).json({
      error: "Pod replacement simulation is disabled",
    });
  }

  try {
    const namespace = process.env.K8S_NAMESPACE || "default";

    // Select only KubeMonitor's API Pods
    const response = await coreApi.listNamespacedPod({
      namespace,
      labelSelector: "app=api-kube-monitor",
    });

    const pods = response.items || [];

    // Only select healthy API Pods owned by a ReplicaSet
    const candidates = pods.filter(
      (pod) =>
        pod.status?.conditions?.some(
          (condition) =>
            condition.type === "Ready" && condition.status === "True",
        ) &&
        pod.metadata?.ownerReferences?.some(
          (owner) => owner.kind === "ReplicaSet",
        ),
    );

    // Require at least two healthy Pods before deleting one
    if (candidates.length < 2) {
      return res.status(409).json({
        error: "At least two healthy API Pods are required",
      });
    }

    // Delete one of the healthy API Pods
    const selectedPod = candidates[0];
    const podName = selectedPod.metadata.name;

    await coreApi.deleteNamespacedPod({
      name: podName,
      namespace,
      body: {
        apiVersion: "v1",
        kind: "DeleteOptions",
        preconditions: {
          uid: selectedPod.metadata.uid,
        },
      },
    });

    return res.status(202).json({
      message: "Pod deletion requested. Kubernetes will create a replacement.",
      deletedPod: podName,
    });
  } catch (error) {
    console.error("Pod replacement simulation error:", error);

    return res.status(500).json({
      error: "Failed to trigger Pod replacement",
    });
  }
});

export default router;
