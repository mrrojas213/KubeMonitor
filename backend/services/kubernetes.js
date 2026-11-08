import * as k8s from "@kubernetes/client-node";

const kc = new k8s.KubeConfig();

if (process.env.KUBERNETES_SERVICE_HOST) {
  kc.loadFromCluster();
} else {
  kc.loadFromDefault();
}

const coreApi = kc.makeApiClient(k8s.CoreV1Api);
const appsApi = kc.makeApiClient(k8s.AppsV1Api);
const metricsApi = new k8s.Metrics(kc);

function toMillicores(cpu) {
  if (!cpu) return 0;

  if (cpu.endsWith("n")) {
    return Number(cpu.slice(0, -1)) / 1_000_000;
  }

  if (cpu.endsWith("u")) {
    return Number(cpu.slice(0, -1)) / 1_000;
  }

  if (cpu.endsWith("m")) {
    return Number(cpu.slice(0, -1));
  }

  return Number(cpu) * 1000;
}

export async function getClusterData() {
  const namespace = process.env.K8S_NAMESPACE || "default";

  const [nodesResponse, podsResponse, deploymentsResponse] = await Promise.all([
    coreApi.listNode(),
    coreApi.listNamespacedPod({ namespace }),
    appsApi.listNamespacedDeployment({ namespace }),
  ]);

  const nodes = nodesResponse.items || [];
  const pods = podsResponse.items || [];
  const deployments = deploymentsResponse.items || [];

  // Retrieve CPU metrics from Kubernetes Metrics Server
  let podMetrics = [];

  try {
    const response = await metricsApi.getPodMetrics(namespace);
    podMetrics = response.items || [];
  } catch (error) {
    console.error("Unable to retrieve Pod CPU metrics:", error);
  }

  // Individual Pod information
  const podDetails = pods.map((pod) => {
    const name = pod.metadata?.name || "Unknown";

    const metric = podMetrics.find((item) => item.metadata?.name === name);

    const cpu = metric
      ? metric.containers.reduce(
          (total, container) => total + toMillicores(container.usage?.cpu),
          0,
        )
      : null;

    const containerStatuses = pod.status?.containerStatuses || [];

    const waitingReason = containerStatuses
      .map((container) => container.state?.waiting?.reason)
      .find(Boolean);

    const ready =
      pod.status?.conditions?.some(
        (condition) =>
          condition.type === "Ready" && condition.status === "True",
      ) ?? false;

    return {
      name,
      status: waitingReason || pod.status?.phase || "Unknown",
      ready,
      cpu: cpu !== null ? Math.round(cpu) : null,
      createdAt: pod.metadata?.creationTimestamp || null,
    };
  });

  return {
    nodes: {
      total: nodes.length,
      ready: nodes.filter((node) =>
        node.status?.conditions?.some(
          (condition) =>
            condition.type === "Ready" && condition.status === "True",
        ),
      ).length,
    },

    pods: {
      total: pods.length,

      running: pods.filter((pod) => pod.status?.phase === "Running").length,

      ready: pods.filter((pod) =>
        pod.status?.conditions?.some(
          (condition) =>
            condition.type === "Ready" && condition.status === "True",
        ),
      ).length,

      restarts: pods.reduce(
        (total, pod) =>
          total +
          (pod.status?.containerStatuses || []).reduce(
            (sum, container) => sum + (container.restartCount || 0),
            0,
          ),
        0,
      ),

      // New: individual Pod details
      details: podDetails,
    },

    deployments: deployments.map((deployment) => ({
      name: deployment.metadata.name,
      desired: deployment.spec?.replicas ?? 1,
      ready: deployment.status?.readyReplicas ?? 0,
      available: deployment.status?.availableReplicas ?? 0,
    })),
  };
}
