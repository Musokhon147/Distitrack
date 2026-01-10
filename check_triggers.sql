-- Check for existing triggers on profiles table
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'profiles';

-- Also check for functions that might be creating profiles
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_name LIKE '%profile%'
AND routine_schema = 'public';
