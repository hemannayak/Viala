# 🚀 Viala Quick Production Setup

## Step 1: Run SQL Setup (5 minutes)

1. **Open Supabase Dashboard**: https://supabase.com/dashboard/project/pcnxmtktyayjbylbexxz
2. **Go to SQL Editor**
3. **Copy and paste** the entire contents of `supabase-setup.sql`
4. **Click Run** to execute

This will:
- ✅ Create user profiles table
- ✅ Set up authentication triggers
- ✅ Add 10 sample medicines to inventory
- ✅ Configure Row Level Security
- ✅ Create necessary indexes

## Step 2: Create Demo Users (2 minutes)

### Option A: Using Supabase Dashboard (Recommended)

1. **Go to Authentication** → **Users** in Supabase Dashboard
2. **Click "Add User"**
3. **Create Admin User**:
   - Email: `admin@viala.com`
   - Password: `demo123`
   - Email Confirm: ✅ Checked
   - User Metadata: `{"role": "admin"}`

4. **Create Pharmacist User**:
   - Email: `pharmacist@viala.com`
   - Password: `demo123`
   - Email Confirm: ✅ Checked
   - User Metadata: `{"role": "pharmacist"}`

### Option B: Using API (Advanced)

If you have the service role key, add it to `.env.local`:
```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Then run:
```bash
node create-users.js
```

## Step 3: Verify Setup (1 minute)

1. **Check Inventory Data**:
   - Go to **Table Editor** → **inventory**
   - Should see 10 medicines with various expiry dates

2. **Check Users**:
   - Go to **Authentication** → **Users**
   - Should see 2 users (admin and pharmacist)

## Step 4: Test the Application

1. **Start the app**:
   ```bash
   npm run dev
   ```

2. **Login Test**:
   - Go to http://localhost:3000
   - Login with: `admin@viala.com` / `demo123`
   - Should see dashboard with real data

3. **Real-time Test**:
   - Open Visual Shelf Heatmap
   - In another tab, edit inventory in Supabase
   - Watch heatmap update in real-time

## ✅ Success Indicators

You'll know it's working when:
- ✅ Login redirects to dashboard (not error)
- ✅ Dashboard shows real inventory metrics
- ✅ Heatmap displays 10 medicines in grid
- ✅ FEFO colors show correctly (red/amber/white)
- ✅ Role-based access works (admin vs pharmacist)
- ✅ Real-time updates work when editing data

## 🔧 Troubleshooting

**Login fails**: Check users exist in Supabase Auth with correct metadata
**No data**: Verify inventory table has 10 records
**Real-time not working**: Check browser console for connection errors
**Role issues**: Verify user_metadata.role is set correctly

## 🎯 Production Features Now Active

- ✅ **Real Authentication**: Supabase Auth with email/password
- ✅ **Live Database**: PostgreSQL with real-time subscriptions
- ✅ **FEFO Calculations**: Dynamic expiry status based on real dates
- ✅ **Role-Based Access**: Admin vs Pharmacist feature differences
- ✅ **Environmental Analytics**: Real waste prevention calculations
- ✅ **Scenario Simulation**: Monsoon mode with demand predictions
- ✅ **Professional UI**: Enterprise-grade medical interface

**Viala is now a fully functional, production-ready system!**