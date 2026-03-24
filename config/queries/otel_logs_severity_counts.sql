-- @param table_name STRING
-- @param start_date DATE
-- @param end_date DATE
SELECT severity_text, COUNT(*) as count
FROM IDENTIFIER(:table_name)
WHERE date BETWEEN :start_date AND :end_date
GROUP BY severity_text
