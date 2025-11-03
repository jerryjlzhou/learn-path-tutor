# Manual Setup Instructions for Account Deletion Feature

Since Supabase CLI is not installed, follow these manual steps:

## Step 1: Apply Database Migration

1. Go to your **Supabase Dashboard** at https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the entire SQL from: `supabase/migrations/20251103000000_add_account_deletion_support.sql`
6. Click **Run** to execute the migration

## Step 2: Deploy Edge Function

### Option A: Using Supabase Dashboard (Easier)
1. Go to **Edge Functions** in the left sidebar
2. Click **Deploy new function**
3. Name it: `delete-account`
4. Copy the code from: `supabase/functions/delete-account/index.ts`
5. Paste and deploy

### Option B: Install Supabase CLI
If you want to use CLI in the future:

```bash
# Install via npm with sudo (macOS/Linux)
sudo npm install -g supabase

# Or install Homebrew first, then use it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install supabase/tap/supabase
```

Then deploy:
```bash
supabase functions deploy delete-account
```

## Step 3: Verify Setup

After applying the migration:
1. Check that `bookings` table now has a `deleted_user_name` column
2. Check that `user_id` in `bookings` is now nullable
3. Try the delete account feature in your app (Profile Settings → Danger Zone)

## What This Enables

✅ Users can delete their accounts  
✅ Booking history is preserved for revenue tracking  
✅ Deleted user bookings show as "Deleted User" or their preserved name  
✅ Revenue calculations remain accurate  

## Testing

1. Create a test user account
2. Make a booking with that user
3. Delete the account via Profile Settings
4. Check admin dashboard - booking should still be there as "Deleted User"
