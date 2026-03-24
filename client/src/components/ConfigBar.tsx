import { Input, Badge } from '@databricks/appkit-ui/react';
import { useTelemetryConfig } from '../context/TelemetryConfigContext';

export function ConfigBar() {
  const { catalog, schema, prefix, setCatalog, setSchema, setPrefix, isConfigured } =
    useTelemetryConfig();

  return (
    <div className="flex items-center gap-2">
      <Input
        className="h-7 w-36 text-xs"
        placeholder="Catalog"
        value={catalog}
        onChange={(e) => setCatalog(e.target.value)}
      />
      <span className="text-muted-foreground text-xs">.</span>
      <Input
        className="h-7 w-36 text-xs"
        placeholder="Schema"
        value={schema}
        onChange={(e) => setSchema(e.target.value)}
      />
      <span className="text-muted-foreground text-xs">.</span>
      <Input
        className="h-7 w-44 text-xs"
        placeholder="Table prefix"
        value={prefix}
        onChange={(e) => setPrefix(e.target.value)}
      />
      {isConfigured ? (
        <Badge variant="outline" className="text-emerald-600 border-emerald-600 text-xs">
          Connected
        </Badge>
      ) : (
        <Badge variant="secondary" className="text-xs">
          Not configured
        </Badge>
      )}
    </div>
  );
}
