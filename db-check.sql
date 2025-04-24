-- Check for indexes on the tables
SELECT
  tablename,
  indexname,
  indexdef
FROM
  pg_indexes
WHERE
  schemaname = 'public'
  AND tablename IN ('logo_collections', 'logo_collection_items', 'logos');

-- Check table structure
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM 
  information_schema.columns
WHERE 
  table_schema = 'public'
  AND table_name IN ('logo_collections', 'logo_collection_items', 'logos')
ORDER BY 
  table_name, 
  ordinal_position;
