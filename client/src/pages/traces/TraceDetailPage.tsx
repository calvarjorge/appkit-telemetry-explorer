import { useAnalyticsQuery, Card, CardContent, CardHeader, CardTitle, Skeleton, Button, Badge, ScrollArea } from '@databricks/appkit-ui/react';
import { sql } from '@databricks/appkit-ui/js';
import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useTelemetryConfig } from '../../context/TelemetryConfigContext';
import { TraceWaterfall } from '../../components/TraceWaterfall';
import type { Span } from '../../components/TraceWaterfall';

function tryParseJson(val: unknown): unknown {
  if (val == null) return null;
  if (typeof val === 'object') return val;
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return val; }
  }
  return val;
}

function formatJson(val: unknown): string {
  const parsed = tryParseJson(val);
  if (parsed == null) return '—';
  if (typeof parsed === 'object') return JSON.stringify(parsed, null, 2);
  return String(parsed);
}

function JsonSection({ label, data }: { label: string; data: unknown }) {
  const parsed = tryParseJson(data);
  if (parsed == null) return null;
  return (
    <div>
      <div className="text-[11px] font-medium text-muted-foreground mb-1">{label}</div>
      <pre className="text-[11px] font-mono bg-muted/50 rounded p-2.5 overflow-x-auto max-h-52 overflow-y-auto whitespace-pre-wrap break-all">
        {typeof parsed === 'object' ? JSON.stringify(parsed, null, 2) : String(parsed)}
      </pre>
    </div>
  );
}

export function TraceDetailPage() {
  const { traceId } = useParams<{ traceId: string }>();
  const navigate = useNavigate();
  const { spansTable, isConfigured } = useTelemetryConfig();
  const [selectedSpan, setSelectedSpan] = useState<Span | null>(null);

  const params = useMemo(
    () =>
      isConfigured && traceId
        ? {
            table_name: sql.string(spansTable),
            trace_id: sql.string(traceId),
          }
        : null,
    [spansTable, isConfigured, traceId],
  );

  const traceQuery = useAnalyticsQuery('otel_trace', params, {
    autoStart: isConfigured && !!traceId,
  });
  const spans = traceQuery.data as Span[] | null;
  const { loading, error } = traceQuery;

  const totalDuration = spans && spans.length > 0
    ? (Math.max(...spans.map(s => Number(s.end_time_unix_nano))) - Math.min(...spans.map(s => Number(s.start_time_unix_nano)))) / 1_000_000
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => void navigate(-1)}>
          ← Back to traces
        </Button>
        <span className="text-sm font-mono text-muted-foreground">Trace: {traceId}</span>
        {spans && spans.length > 0 && (
          <>
            <Badge variant="secondary" className="text-xs">{spans.length} spans</Badge>
            <Badge variant="outline" className="text-xs font-mono">{totalDuration.toFixed(1)}ms total</Badge>
          </>
        )}
      </div>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Trace Waterfall</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
            </div>
          )}
          {error && <div className="text-destructive text-sm">Error: {error}</div>}
          {spans && (
            <TraceWaterfall
              spans={spans}
              selectedSpanId={selectedSpan?.span_id}
              onSelectSpan={setSelectedSpan}
            />
          )}
        </CardContent>
      </Card>

      {selectedSpan && (
        <Card>
          <CardHeader className="py-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">{selectedSpan.name}</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs h-6 px-2" onClick={() => setSelectedSpan(null)}>
              ✕
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 text-xs">
              <div>
                <div className="text-muted-foreground mb-0.5">Span ID</div>
                <div className="font-mono truncate" title={selectedSpan.span_id}>{selectedSpan.span_id}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-0.5">Parent</div>
                <div className="font-mono truncate">{selectedSpan.parent_span_id || '—'}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-0.5">Kind</div>
                <div>{selectedSpan.kind.replace('SPAN_KIND_', '')}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-0.5">Service</div>
                <div>{selectedSpan.service_name}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-0.5">Duration</div>
                <div className="font-mono">{Number(selectedSpan.duration_ms).toFixed(2)}ms</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-0.5">Status</div>
                <div className={isErrorStatus(selectedSpan.status) ? 'text-destructive' : ''}>
                  {formatStatus(selectedSpan.status)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground mb-0.5">Start</div>
                <div className="font-mono">{formatNanos(selectedSpan.start_time_unix_nano)}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-0.5">End</div>
                <div className="font-mono">{formatNanos(selectedSpan.end_time_unix_nano)}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <JsonSection label="Attributes" data={selectedSpan.attributes} />
              <JsonSection label="Resource" data={selectedSpan.resource} />
              <JsonSection label="Events" data={selectedSpan.events} />
              <JsonSection label="Status (raw)" data={selectedSpan.status} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function formatNanos(nanos: number): string {
  try {
    return new Date(Number(nanos) / 1_000_000).toLocaleString();
  } catch {
    return String(nanos);
  }
}

function formatStatus(status: unknown): string {
  if (status == null) return '—';
  if (typeof status === 'object') {
    const s = status as Record<string, unknown>;
    return String(s.code ?? s.message ?? '—');
  }
  return String(status);
}

function isErrorStatus(status: unknown): boolean {
  if (status == null) return false;
  if (typeof status === 'object') {
    const s = status as Record<string, unknown>;
    return String(s.code ?? '').includes('ERROR');
  }
  return false;
}
