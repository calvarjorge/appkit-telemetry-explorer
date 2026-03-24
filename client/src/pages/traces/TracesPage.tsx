import { Card, CardContent, CardHeader, CardTitle, Skeleton, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, ScrollArea, Switch, Label } from '@databricks/appkit-ui/react';
import { sql } from '@databricks/appkit-ui/js';
import { useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useTelemetryConfig } from '../../context/TelemetryConfigContext';
import { useArrowQuery } from '../../lib/useArrowQuery';
import { DateRangeFilter } from '../../components/DateRangeFilter';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function TracesPage() {
  const { spansTable, isConfigured } = useTelemetryConfig();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const service = searchParams.get('service') ?? '';
  const rootsOnly = searchParams.get('roots') === '1';
  const startDate = searchParams.get('from') ?? yesterdayStr();
  const endDate = searchParams.get('to') ?? todayStr();

  const updateParam = useCallback((key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      return next;
    });
  }, [setSearchParams]);

  const params = useMemo(
    () =>
      isConfigured
        ? {
            table_name: sql.string(spansTable),
            start_date: sql.date(startDate),
            end_date: sql.date(endDate),
            service: sql.string(service),
            roots_only: sql.string(rootsOnly ? '1' : ''),
          }
        : null,
    [spansTable, isConfigured, startDate, endDate, service, rootsOnly],
  );

  const { data: spans, loading, error } = useArrowQuery<{ time: string; name: string; kind: string; service_name: string; duration_ms: number; trace_id: string }>('otel_spans', params, { autoStart: isConfigured });

  if (!isConfigured) {
    return <div className="text-muted-foreground text-center mt-12">Configure your telemetry tables above to get started.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          className="h-8 w-48 text-xs"
          placeholder="Filter by service..."
          value={service}
          onChange={(e) => updateParam('service', e.target.value)}
        />
        <div className="flex items-center gap-2">
          <Switch
            id="roots-only"
            checked={rootsOnly}
            onCheckedChange={(checked) => updateParam('roots', checked ? '1' : '')}
          />
          <Label htmlFor="roots-only" className="text-xs text-muted-foreground">Root spans only</Label>
        </div>
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onStartChange={(v) => updateParam('from', v)}
          onEndChange={(v) => updateParam('to', v)}
        />
      </div>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">{rootsOnly ? 'Traces' : 'Spans'}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading && (
            <div className="p-4 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          )}
          {error && <div className="p-4 text-destructive text-sm">Error: {error}</div>}
          {spans && spans.length === 0 && <div className="p-4 text-muted-foreground text-sm">No spans found for the selected filters.</div>}
          {spans && spans.length > 0 && (
            <ScrollArea className="max-h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-44">Time</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="w-24">Kind</TableHead>
                    <TableHead className="w-36">Service</TableHead>
                    <TableHead className="w-24 text-right">Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {spans.map((span, i) => (
                    <TableRow
                      key={i}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => void navigate(`/traces/${span.trace_id}`)}
                    >
                      <TableCell className="text-xs font-mono whitespace-nowrap">{formatTime(span.time)}</TableCell>
                      <TableCell className="text-xs font-mono">{span.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {span.kind.replace('SPAN_KIND_', '')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs truncate max-w-36">{span.service_name}</TableCell>
                      <TableCell className="text-xs font-mono text-right">
                        <span className={Number(span.duration_ms) > 1000 ? 'text-amber-600' : ''}>
                          {Number(span.duration_ms).toFixed(1)}ms
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
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
