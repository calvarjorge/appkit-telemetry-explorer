-- @param table_name STRING
-- @param severity STRING
-- @param search STRING
-- @param start_date DATE
-- @param end_date DATE
SELECT time, severity_text, body, service_name, trace_id, span_id, attributes
FROM IDENTIFIER(:table_name)
WHERE date BETWEEN :start_date AND :end_date
  AND (:severity = '' OR severity_text = :severity)
  AND (:search = '' OR body LIKE CONCAT('%', :search, '%'))
ORDER BY time DESC
LIMIT 500
