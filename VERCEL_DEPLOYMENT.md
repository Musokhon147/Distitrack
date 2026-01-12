# Vercel Deployment Guide

## Required Environment Variables

Make sure to add these environment variables in your Vercel project settings:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project dashboard under **Settings** → **API**.

## Build Settings

- **Framework Preset**: Vite
- **Root Directory**: `apps/web`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## Common Issues

### Issue: Stuck on "Yuklanmoqda" (Loading Screen)

**Solution:**
1. Check that all environment variables are set in Vercel
2. Verify the Supabase URL and Anon Key are correct
3. Make sure your Supabase project is running and accessible
4. Check the browser console for any errors

### Issue: Slow Loading Times

**Solution:**
1. Run the `optimize_database_indexes.sql` file in your Supabase SQL editor
2. This will add indexes to speed up common queries

## Performance Optimizations Applied

1. ✅ Added timeout for auth initialization (prevents stuck loading)
2. ✅ Optimized database queries (select only needed fields)
3. ✅ Added database indexes (see `optimize_database_indexes.sql`)
4. ✅ Improved error handling and connection management

## Database Setup

After deploying, make sure to run these SQL files in your Supabase SQL editor:

1. `create_payment_confirmations_table.sql` - Creates payment confirmations table
2. `fix_market_update_entries.sql` - Fixes RLS policies for market users
3. `optimize_database_indexes.sql` - Adds performance indexes (IMPORTANT for speed)

## Testing After Deployment

1. Visit your Vercel deployment URL
2. Try logging in with a test account
3. Check that pages load without getting stuck
4. Verify that database operations work correctly
