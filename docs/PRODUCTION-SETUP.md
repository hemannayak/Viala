# Viala Production Setup Guide

## 🚀 Converting from Demo to Production

This guide will help you set up Viala as a fully functional, production-ready system with real Supabase integration.

---

## 📋 Prerequisites

1. **Supabase Project**: You already have one at https://pcnxmtktyayjbylbexxz.supabase.co
2. **Node.js**: Version 18+ installed
3. **Database Access**: Admin access to your Supabase project

---

## 🔧 Step 1: Database Setup

### 1.1 Run the Setup SQL Script

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/pcnxmtktyayjbylbexxz
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase-setup.sql`
4. Click **Run** to execute the script

This will:
- ✅ Create user profiles table for role management
- ✅ Set up Row Level Security (RLS) policies
- ✅ Create triggers for new user registration
- ✅ Add sample inventory data (10 realistic medicines)
- ✅ Create necessary indexes for performance

### 1.2 Verify Database Structure

After running the script, you should see these tables:
- `inventory` (already exists)
- `user_profiles` (newly created)

---

## 🔐 Step 2: Authentication Setup

### 2.1 Get Service Role Key

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy the **service_role** key (not the anon key)
3. Add it to your `.env.local` file:

```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 2.2 Create Demo Users

Run the user creation script:

```bash
npm install @supabase/supabase-js
node create-users.js
```

This creates:
- **Admin**: admin@viala.com / demo123
- **Pharmacist**: pharmacist@viala.com / demo123

### 2.3 Configure Authentication Settings

In Supabase Dashboard → **Authentication** → **Settings**:

1. **Site URL**: Set to `http://localhost:3000` (or your domain)
2. **Redirect URLs**: Add `http://localhost:3000/dashboard`
3. **Email Templates**: Customize if needed
4. **Providers**: Email is enabled by default

---

## 🗄️ Step 3: Database Verification

### 3.1 Check Inventory Data

In Supabase Dashboard → **Table Editor** → **inventory**:
- Should see 10 sample medicines
- Various expiry dates (some critical, some healthy)
- Different categories and shelf locations

### 3.2 Check User Profiles

In **Table Editor** → **user_profiles**:
- Should see 2 users after running create-users.js
- Each with appropriate roles (admin/pharmacist)

---

## 🚀 Step 4: Application Configuration

### 4.1 Environment Variables

Your `.env.local` should look like:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://pcnxmtktyayjbylbexxz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_FORCE_DEMO_MODE=false
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 4.2 Start the Application

```bash
npm run dev
```

The application will now use real Supabase instead of demo mode.

---

## ✅ Step 5: Testing Production Features

### 5.1 Authentication Test

1. Navigate to http://localhost:3000
2. Login with: admin@viala.com / demo123
3. Verify you're redirected to dashboard
4. Check that role-based features work

### 5.2 Real-time Data Test

1. Open the Visual Shelf Heatmap
2. In another tab, open Supabase Table Editor
3. Edit an inventory item (change expiry_date)
4. Watch the heatmap update in real-time

### 5.3 RBAC Test

1. Login as admin - should see all features
2. Logout and login as pharmacist
3. Verify restricted access (no eco analytics, etc.)

---

## 🔄 Step 6: Real-time Subscriptions

The application automatically sets up real-time subscriptions for:
- **Inventory changes**: Heatmap updates instantly
- **User authentication**: Login/logout state changes
- **Scenario updates**: Live prediction recalculations

---

## 📊 Step 7: Production Data Management

### 7.1 Adding Real Inventory

Replace sample data with real inventory:

1. Go to Supabase Table Editor → inventory
2. Delete sample data if needed
3. Add real medicines with:
   - Accurate expiry dates
   - Real shelf locations
   - Proper categories
   - Correct pricing

### 7.2 User Management

Add real users:

1. Use Supabase Auth UI or API
2. Set appropriate roles in user_metadata
3. Users will automatically get profiles via trigger

---

## 🛡️ Step 8: Security Considerations

### 8.1 Row Level Security (RLS)

Already configured:
- Users can only see their own profiles
- Authenticated users can access inventory
- Policies prevent unauthorized access

### 8.2 API Keys

- ✅ Anon key is safe for client-side use
- ⚠️ Service role key should be server-side only
- 🔒 Never expose service role key in client code

---

## 🚀 Step 9: Deployment Ready

### 9.1 Production Build

```bash
npm run build
npm start
```

### 9.2 Environment Variables for Production

Update for your production domain:
- Site URL in Supabase settings
- Redirect URLs
- CORS settings if needed

---

## 🎯 Production Features Now Active

### ✅ Real Authentication
- Supabase Auth with email/password
- Role-based access control
- Session management

### ✅ Live Database
- Real PostgreSQL database
- Row Level Security
- Real-time subscriptions

### ✅ Full CRUD Operations
- Read inventory data
- Real-time updates
- User profile management

### ✅ Production Performance
- Optimized queries
- Proper indexing
- Efficient real-time subscriptions

---

## 🔧 Troubleshooting

### Common Issues:

1. **Login fails**: Check user exists in Supabase Auth
2. **No data**: Verify RLS policies and user authentication
3. **Real-time not working**: Check network and Supabase connection
4. **Role issues**: Verify user_metadata.role is set correctly

### Debug Mode:

Check browser console for:
- Supabase connection status
- Authentication state
- Real-time subscription status

---

## 🏆 Success Criteria

Your production system should:
- ✅ Authenticate real users
- ✅ Load real inventory data
- ✅ Update in real-time
- ✅ Enforce role-based access
- ✅ Calculate FEFO status dynamically
- ✅ Show environmental impact metrics
- ✅ Support scenario simulations

**Viala is now a fully functional, production-ready circular pharmacy intelligence platform!**