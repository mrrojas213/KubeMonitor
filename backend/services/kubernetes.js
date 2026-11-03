import * as k8s from "@kubernetes/client-node";

const kc = new k8s.KubeConfig();

if (process.env.KUBERNETES_SERVICE_HOST) {
  kc.loadFromCluster();
} else {
  kc.loadFromDefault();
}

const coreApi = kc.makeApiClient(k8s.CoreV1Api);
const appsApi = kc.makeApiClient(k8s.AppsV1Api);

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
    },

    deployments: deployments.map((deployment) => ({
      name: deployment.metadata.name,
      desired: deployment.spec?.replicas ?? 1,
      ready: deployment.status?.readyReplicas ?? 0,
      available: deployment.status?.availableReplicas ?? 0,
    })),
  };
}
