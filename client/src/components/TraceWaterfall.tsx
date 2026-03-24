import { Badge } from '@databricks/appkit-ui/react';

export interface Span {
  trace_id: string;
  span_id: string;
  parent_span_id: string | null;
  name: string;
  kind: string;
  service_name: string;
  start_time_unix_nano: number;
  end_time_unix_nano: number;
  duration_ms: number;
  attributes?: unknown;
  status?: unknown;
  resource?: unknown;
  events?: unknown;
}

interface TreeNode {
  span: Span;
  children: TreeNode[];
  depth: number;
}

function buildTree(spans: Span[]): TreeNode[] {
  const byId = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  for (const span of spans) {
    byId.set(span.span_id, { span, children: [], depth: 0 });
  }

  for (const node of byId.values()) {
    const parentId = node.span.parent_span_id;
    if (parentId && byId.has(parentId)) {
      byId.get(parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  function setDepth(node: TreeNode, depth: number) {
    node.depth = depth;
    for (const child of node.children) setDepth(child, depth + 1);
  }
  for (const root of roots) setDepth(root, 0);

  return roots;
}

function flatten(nodes: TreeNode[]): TreeNode[] {
  const result: TreeNode[] = [];
  function walk(node: TreeNode) {
    result.push(node);
    for (const child of node.children) walk(child);
  }
  for (const n of nodes) walk(n);
  return result;
}

const kindColors: Record<string, string> = {
  SPAN_KIND_SERVER: 'bg-blue-500',
  SPAN_KIND_CLIENT: 'bg-emerald-500',
  SPAN_KIND_INTERNAL: 'bg-gray-400',
  SPAN_KIND_PRODUCER: 'bg-purple-500',
  SPAN_KIND_CONSUMER: 'bg-orange-500',
};

function kindLabel(kind: string) {
  return kind.replace('SPAN_KIND_', '');
}

export function TraceWaterfall({
  spans,
  selectedSpanId,
  onSelectSpan,
}: {
  spans: Span[];
  selectedSpanId?: string | null;
  onSelectSpan?: (span: Span) => void;
}) {
  if (!spans.length) return <div className="text-muted-foreground text-sm">No spans found</div>;

  const tree = buildTree(spans);
  const flat = flatten(tree);

  const minStart = Math.min(...spans.map((s) => Number(s.start_time_unix_nano)));
  const maxEnd = Math.max(...spans.map((s) => Number(s.end_time_unix_nano)));
  const totalRange = maxEnd - minStart || 1;

  return (
    <div className="space-y-0.5">
      {flat.map((node) => {
        const { span, depth } = node;
        const startNano = Number(span.start_time_unix_nano);
        const endNano = Number(span.end_time_unix_nano);
        const leftPct = ((startNano - minStart) / totalRange) * 100;
        const widthPct = Math.max(((endNano - startNano) / totalRange) * 100, 0.5);
        const barColor = kindColors[span.kind] ?? 'bg-gray-400';
        const isSelected = selectedSpanId === span.span_id;

        return (
          <div
            key={span.span_id}
            className={`flex items-center gap-2 text-xs h-7 rounded px-1 cursor-pointer transition-colors ${
              isSelected ? 'bg-primary/10 ring-1 ring-primary/30' : 'hover:bg-muted/50'
            }`}
            onClick={() => onSelectSpan?.(span)}
          >
            <div className="w-48 shrink-0 truncate text-right text-muted-foreground" style={{ paddingLeft: depth * 16 }}>
              {span.name}
            </div>
            <div className="flex-1 relative h-5 bg-muted/30 rounded overflow-hidden">
              <div
                className={`absolute h-full rounded ${barColor} opacity-80`}
                style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground font-mono whitespace-nowrap shrink-0 w-16 text-right">
              {Number(span.duration_ms).toFixed(1)}ms
            </span>
            <Badge variant="outline" className="text-[10px] shrink-0 w-16 justify-center">
              {kindLabel(span.kind)}
            </Badge>
          </div>
        );
      })}
    </div>
  );
}
