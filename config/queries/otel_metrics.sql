-- @param table_name STRING
-- @param metric_name STRING
-- @param start_date DATE
-- @param end_date DATE
SELECT time, name, metric_type,
  COALESCE(gauge.value, sum.value, CAST(histogram.sum AS STRING)) as value,
  service_name
FROM IDENTIFIER(:table_name)
WHERE name = :metric_name
  AND date BETWEEN :start_date AND :end_date
ORDER BY time ASC
LIMIT 1000
