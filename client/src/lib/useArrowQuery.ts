import { useAnalyticsQuery } from '@databricks/appkit-ui/react';
import { useMemo } from 'react';

/**
 * Wrapper around useAnalyticsQuery that uses ARROW format (required by some warehouses)
 * and converts the result to a plain JSON array for easy consumption.
 */
export function useArrowQuery<T = Record<string, unknown>>(
  queryKey: string,
  parameters: Record<string, unknown> | null,
  options?: { autoStart?: boolean },
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, loading, error } = useAnalyticsQuery(queryKey as any, parameters, {
    format: 'ARROW',
    ...options,
  });

  const rows = useMemo(() => {
    if (!data) return null;
    try {
      // Arrow Table has a toArray() method that returns StructRow[]
      // We convert to plain objects via JSON round-trip
      const table = data as { numRows: number; schema: { fields: { name: string }[] }; getChild: (name: string) => { toJSON: () => unknown[] } | null };
      if (!table.schema?.fields) return [] as T[];

      const numRows = table.numRows;
      const fields = table.schema.fields;
      const columns: Record<string, unknown[]> = {};

      for (const field of fields) {
        const col = table.getChild(field.name);
        if (col) {
          columns[field.name] = col.toJSON();
        }
      }

      const result: Record<string, unknown>[] = [];
      for (let i = 0; i < numRows; i++) {
        const row: Record<string, unknown> = {};
        for (const field of fields) {
          row[field.name] = columns[field.name]?.[i] ?? null;
        }
        result.push(row);
      }
      return result as T[];
    } catch {
      return [] as T[];
    }
  }, [data]);

  return { data: rows, loading, error };
}
