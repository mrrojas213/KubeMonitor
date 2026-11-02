
import {
  CloudWatchClient,
  GetMetricDataCommand,
  DescribeAlarmsCommand,
} from "@aws-sdk/client-cloudwatch";

const client = new CloudWatchClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const clusterName = process.env.EKS_CLUSTER_NAME || "kube-monitor-eks";
const namespace = process.env.K8S_NAMESPACE || "default";

function query(id, name, dimensions, stat = "Average") {
  return {
    Id: id,
    MetricStat: {
      Metric: {
        Namespace: "ContainerInsights",
        MetricName: name,
        Dimensions: dimensions,
      },
      Period: 60,
      Stat: stat,
    },
    ReturnData: true,
  };
}

const cluster = [
  { Name: "ClusterName", Value: clusterName },
];

const appNamespace = [
  { Name: "ClusterName", Value: clusterName },
  { Name: "Namespace", Value: namespace },
];

export async function getCloudWatchMetrics() {
  const end = new Date();
  const start = new Date(end.getTime() - 15 * 60 * 1000);

  const command = new GetMetricDataCommand({
    StartTime: start,
    EndTime: end,
    ScanBy: "TimestampDescending",

    MetricDataQueries: [
      query("node_cpu", "node_cpu_utilization", cluster),
      query("node_memory", "node_memory_utilization", cluster),
      query("pod_cpu", "pod_cpu_utilization", appNamespace),
      query("pod_memory", "pod_memory_utilization", appNamespace),
      query("network_rx", "pod_network_rx_bytes", appNamespace),
      query("network_tx", "pod_network_tx_bytes", appNamespace),
    ],
  });

  const response = await client.send(command);

  const metrics = {};

  for (const result of response.MetricDataResults || []) {
    metrics[result.Id] = {
      value: result.Values?.[0] ?? null,
      timestamp: result.Timestamps?.[0] ?? null,
    };
  }

  return {
    nodeCPU: metrics.node_cpu ?? null,
    nodeMemory: metrics.node_memory ?? null,
    podCPU: metrics.pod_cpu ?? null,
    podMemory: metrics.pod_memory ?? null,
    networkReceived: metrics.network_rx ?? null,
    networkTransmitted: metrics.network_tx ?? null,
  };
}

export async function getCloudWatchAlarms() {
  const response = await client.send(
    new DescribeAlarmsCommand({
      AlarmNamePrefix: "kube-monitor",
      MaxRecords: 100,
    })
  );

  const alarms = response.MetricAlarms || [];

  return alarms.map((alarm) => ({
    name: alarm.AlarmName,
    description: alarm.AlarmDescription,
    state: alarm.StateValue,
    updatedAt: alarm.StateUpdatedTimestamp,
  }));
}
