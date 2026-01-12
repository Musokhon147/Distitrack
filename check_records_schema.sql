-- Check table structure and RLS for records/sales
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'records' OR table_name = 'sales';

SELECT * FROM pg_policies WHERE tablename = 'records' OR tablename = 'sales';
