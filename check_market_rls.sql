-- Check RLS policies for markets table
SELECT * FROM pg_policies WHERE tablename = 'markets';
