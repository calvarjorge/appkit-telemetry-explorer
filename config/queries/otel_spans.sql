-- @param table_name STRING
-- @param start_date DATE
-- @param end_date DATE
-- @param service STRING
-- @param roots_only STRING
SELECT trace_id, span_id, parent_span_id, name, kind, service_name, time,
  (end_time_unix_nano - start_time_unix_nano) / 1000000 as duration_ms, status
FROM IDENTIFIER(:table_name)
WHERE date BETWEEN :start_date AND :end_date
  AND (:service = '' OR service_name = :service)
  AND (:roots_only = '' OR parent_span_id IS NULL OR parent_span_id = '')
ORDER BY time DESC
LIMIT 500
