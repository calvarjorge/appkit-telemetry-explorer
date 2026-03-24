import { useAnalyticsQuery, Card, CardContent, CardHeader, CardTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, LineChart } from '@databricks/appkit-ui/react';
import { sql } from '@databricks/appkit-ui/js';
import { useMemo, useState } from 'react';
import { useTelemetryConfig } from '../../context/TelemetryConfigContext';
import { DateRangeFilter } from '../../components/DateRangeFilter';
import { useDateRange } from '../../lib/useDateRange';

export function MetricsPage() {
  const { metricsTable, isConfigured } = useTelemetryConfig();
  const { startDate, endDate, setStartDate, setEndDate } = useDateRange();
  const [selectedMetric, setSelectedMetric] = useState('');

  const namesParams = useMemo(
    () => (isConfigured ? { table_name: sql.string(metricsTable) } : null),
    [metricsTable, isConfigured],
  );

  const chartParams = useMemo(
    () => ({
      table_name: sql.string(metricsTable),
      metric_name: sql.string(selectedMetric),
      start_date: sql.date(startDate),
      end_date: sql.date(endDate),
    }),
    [metricsTable, selectedMetric, startDate, endDate],
  );

  interface MetricName { name: string; metric_type: string; description: string }

  const { data: names, loading: namesLoading } = useAnalyticsQuery<MetricName[]>('otel_metrics_names', namesParams, {
    autoStart: isConfigured,
  });

  if (!isConfigured) {
    return <div className="text-muted-foreground text-center mt-12">Configure your telemetry tables above to get started.</div>;
  }

  const metricNames = (Array.isArray(names) ? names : []) as MetricName[];
  const selectedDesc = metricNames.find((m) => m.name === selectedMetric)?.description;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={selectedMetric} onValueChange={setSelectedMetric}>
          <SelectTrigger className="h-8 w-80 text-xs">
            <SelectValue placeholder={namesLoading ? 'Loading metrics...' : 'Select a metric'} />
          </SelectTrigger>
          <SelectContent>
            {metricNames.map((m) => (
              <SelectItem key={m.name} value={m.name}>
                <span className="text-xs">{m.name}</span>
                {m.metric_type && (
                  <span className="ml-2 text-[10px] text-muted-foreground">({m.metric_type})</span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DateRangeFilter startDate={startDate} endDate={endDate} onStartChange={setStartDate} onEndChange={setEndDate} />
      </div>

      {selectedMetric ? (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">{selectedMetric}</CardTitle>
            {selectedDesc && <p className="text-xs text-muted-foreground">{selectedDesc}</p>}
          </CardHeader>
          <CardContent>
            <LineChart
              queryKey="otel_metrics"
              parameters={chartParams}
              xKey="time"
              yKey="value"
              height={320}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground text-sm">
            Select a metric from the dropdown to view its time series data.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
