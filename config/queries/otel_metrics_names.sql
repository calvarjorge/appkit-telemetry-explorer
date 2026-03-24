-- @param table_name STRING
SELECT DISTINCT name, metric_type, description
FROM IDENTIFIER(:table_name)
ORDER BY name
