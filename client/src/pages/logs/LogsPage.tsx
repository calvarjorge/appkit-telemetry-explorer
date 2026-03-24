import { Card, CardContent, CardHeader, CardTitle, Skeleton, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@databricks/appkit-ui/react';
import { sql } from '@databricks/appkit-ui/js';
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useTelemetryConfig } from '../../context/TelemetryConfigContext';
import { useArrowQuery } from '../../lib/useArrowQuery';
import { SeverityBadge } from '../../components/SeverityBadge';
import { DateRangeFilter } from '../../components/DateRangeFilter';
import { useDateRange } from '../../lib/useDateRange';

export function LogsPage() {
  const { logsTable, isConfigured } = useTelemetryConfig();
  const { startDate, endDate, setStartDate, setEndDate } = useDateRange();
  const [severity, setSeverity] = useState('ALL');
  const [search, setSearch] = useState('');

  const logsParams = useMemo(
    () =>
      isConfigured
        ? {
            table_name: sql.string(logsTable),
            severity: sql.string(severity === 'ALL' ? '' : severity),
            search: sql.string(search),
            start_date: sql.date(startDate),
            end_date: sql.date(endDate),
          }
        : null,
    [logsTable, isConfigured, severity, search, startDate, endDate],
  );

  const countsParams = useMemo(
    () =>
      isConfigured
        ? {
            table_name: sql.string(logsTable),
            start_date: sql.date(startDate),
            end_date: sql.date(endDate),
          }
        : null,
    [logsTable, isConfigured, startDate, endDate],
  );

  const { data: logs, loading, error } = useArrowQuery<{ time: string; severity_text: string; body: string; service_name: string; trace_id: string | null }>('otel_logs', logsParams, { autoStart: isConfigured });
  const { data: counts } = useArrowQuery<{ severity_text: string; count: number }>('otel_logs_severity_counts', countsParams, { autoStart: isConfigured });

  if (!isConfigured) {
    return <div className="text-muted-foreground text-center mt-12">Configure your telemetry tables above to get started.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={severity} onValueChange={setSeverity}>
          <SelectTrigger className="h-8 w-32 text-xs">
            <SelectValue placeholder="All severities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="ERROR">ERROR</SelectItem>
            <SelectItem value="WARN">WARN</SelectItem>
            <SelectItem value="INFO">INFO</SelectItem>
            <SelectItem value="UNKNOWN">UNKNOWN</SelectItem>
          </SelectContent>
        </Select>
        <Input
          className="h-8 w-64 text-xs"
          placeholder="Search log body..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <DateRangeFilter startDate={startDate} endDate={endDate} onStartChange={setStartDate} onEndChange={setEndDate} />
      </div>

      {counts && counts.length > 0 && (
        <div className="flex gap-2">
          {counts.map((c) => (
            <SeverityBadge key={c.severity_text} severity={c.severity_text} count={c.count} />
          ))}
        </div>
      )}

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Logs</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-hidden">
          {loading && (
            <div className="p-4 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          )}
          {error && <div className="p-4 text-destructive text-sm">Error: {error}</div>}
          {logs && logs.length === 0 && <div className="p-4 text-muted-foreground text-sm">No logs found for the selected filters.</div>}
          {logs && logs.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-44">Time</TableHead>
                    <TableHead className="w-20">Severity</TableHead>
                    <TableHead className="w-36">Service</TableHead>
                    <TableHead>Body</TableHead>
                    <TableHead className="w-24">Trace</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map(
                    (log, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-xs font-mono whitespace-nowrap">{formatTime(log.time)}</TableCell>
                        <TableCell>
                          <SeverityBadge severity={log.severity_text} />
                        </TableCell>
                        <TableCell className="text-xs truncate max-w-36">{log.service_name}</TableCell>
                        <TableCell className="text-xs font-mono max-w-xl truncate">{cleanBody(log.body)}</TableCell>
                        <TableCell className="text-xs">
                          {log.trace_id ? (
                            <Link to={`/traces/${log.trace_id}`} className="text-primary hover:underline font-mono">
                              {log.trace_id.slice(0, 8)}...
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function formatTime(t: string) {
  try {
    return new Date(t).toLocaleString();
  } catch {
    return t;
  }
}

function cleanBody(body: string) {
  if (!body) return '';
  // Remove surrounding triple quotes and ANSI escape codes
  // eslint-disable-next-line no-control-regex
  return body.replace(/^"""|"""$/g, '').replace(/\x1B\[[0-9;]*m/g, '');
}
