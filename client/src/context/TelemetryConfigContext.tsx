import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface TelemetryConfig {
  catalog: string;
  schema: string;
  prefix: string;
  setCatalog: (v: string) => void;
  setSchema: (v: string) => void;
  setPrefix: (v: string) => void;
  logsTable: string;
  metricsTable: string;
  spansTable: string;
  isConfigured: boolean;
}

const STORAGE_KEY = 'telemetry-config';

function loadConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as { catalog: string; schema: string; prefix: string };
  } catch { /* ignore parse errors */ }
  return { catalog: '', schema: '', prefix: '' };
}

function saveConfig(catalog: string, schema: string, prefix: string) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ catalog, schema, prefix }));
}

const TelemetryConfigContext = createContext<TelemetryConfig | null>(null);

export function TelemetryConfigProvider({ children }: { children: ReactNode }) {
  const initial = loadConfig();
  const [catalog, setCatalogState] = useState(initial.catalog);
  const [schema, setSchemaState] = useState(initial.schema);
  const [prefix, setPrefixState] = useState(initial.prefix);

  const setCatalog = useCallback((v: string) => {
    setCatalogState(v);
    saveConfig(v, schema, prefix);
  }, [schema, prefix]);

  const setSchema = useCallback((v: string) => {
    setSchemaState(v);
    saveConfig(catalog, v, prefix);
  }, [catalog, prefix]);

  const setPrefix = useCallback((v: string) => {
    setPrefixState(v);
    saveConfig(catalog, schema, v);
  }, [catalog, schema]);

  const isConfigured = catalog !== '' && schema !== '' && prefix !== '';
  const base = isConfigured ? `${catalog}.${schema}.${prefix}` : '';

  return (
    <TelemetryConfigContext.Provider
      value={{
        catalog, schema, prefix,
        setCatalog, setSchema, setPrefix,
        logsTable: base ? `${base}_otel_logs` : '',
        metricsTable: base ? `${base}_otel_metrics` : '',
        spansTable: base ? `${base}_otel_spans` : '',
        isConfigured,
      }}
    >
      {children}
    </TelemetryConfigContext.Provider>
  );
}

export function useTelemetryConfig() {
  const ctx = useContext(TelemetryConfigContext);
  if (!ctx) throw new Error('useTelemetryConfig must be used within TelemetryConfigProvider');
  return ctx;
}
