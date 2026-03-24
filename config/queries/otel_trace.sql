-- @param table_name STRING
-- @param trace_id STRING
SELECT trace_id, span_id, parent_span_id, name, kind, service_name,
  start_time_unix_nano, end_time_unix_nano,
  (end_time_unix_nano - start_time_unix_nano) / 1000000 as duration_ms,
  attributes, status, resource, events
FROM IDENTIFIER(:table_name)
WHERE trace_id = :trace_id
ORDER BY start_time_unix_nano ASC
