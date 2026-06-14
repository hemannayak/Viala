# Viala Enhanced Features - Setup Guide

## 🎯 Quick Start

This guide will help you set up the enhanced Viala features in your environment.

## 📋 Prerequisites

- Node.js 18+ installed
- Supabase account and project
- Environment variables configured in `.env.local`

## 🚀 Step-by-Step Setup

### Step 1: Database Schema Setup

You need to execute the enhanced schema SQL in your Supabase project:

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your Viala project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Execute Enhanced Schema**
   - Open the file `supabase-enhanced-schema.sql`
   - Copy the entire contents
   - Paste into the Supabase SQL Editor
   - Click "Run" to execute

4. **Verify Tables Created**
   - Go to "Table Editor" in the left sidebar
   - You should see these new tables:
     - `patients`
     - `purchase_history`
     - `patient_medicine_patterns`
     - `stock_notifications`
     - `system_alerts`
     - `ocr_scan_sessions`
     - `audit_operations`
     - `system_validation_logs`

### Step 2: Install Dependencies

```bash
cd viala
npm install
```

### Step 3: Environment Configuration

Ensure your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 4: Start the Application

```bash
npm run dev
```

The application will start on `http://localhost:3000`

### Step 5: Verify Enhanced Features

1. **Login to the application**
   - Use your existing credentials or create a new account

2. **Check the sidebar**
   - You should see new menu items:
     - Patient Notifications
     - Enhanced Alerts
     - OCR Audit System
     - System Validation (Admin only)

3. **Test each feature**:

   **Patient Notifications:**
   - Navigate to "Patient Notifications"
   - Click "Add Patient" to register a test patient
   - Add purchase records to build patterns
   - System will automatically send notifications when stock is low

   **Enhanced Alerts:**
   - Navigate to "Enhanced Alerts"
   - View real-time system alerts
   - Acknowledge or dismiss alerts
   - Filter by severity level

   **OCR Audit System:**
   - Navigate to "OCR Audit System"
   - Start a new OCR session
   - Upload a medicine package image
   - Review extracted data and check in inventory

   **System Validation:**
   - Navigate to "System Validation" (Admin only)
   - Run "Quick Health Check" for fast validation
   - Run "Full System Validation" for comprehensive check
   - Review health reports and recommendations

## 🔧 Troubleshooting

### Issue: Tables not created

**Solution:**
- Manually execute the SQL schema in Supabase SQL Editor
- Check for any SQL errors in the execution log
- Ensure you have proper permissions in Supabase

### Issue: Real-time features not working

**Solution:**
- Check that Supabase Realtime is enabled for your tables
- Go to Database → Replication in Supabase dashboard
- Enable replication for: `inventory`, `system_alerts`, `stock_notifications`

### Issue: OCR not processing images

**Solution:**
- Ensure Tesseract.js is properly installed: `npm install tesseract.js`
- Check browser console for any errors
- Try with a clear, high-quality image of a medicine package

### Issue: Patient notifications not sending

**Solution:**
- Verify that the patient notification engine is initialized
- Check that you have patients with purchase patterns
- Ensure inventory items have quantities ≤ 10 to trigger notifications
- Check browser console for any errors

### Issue: System validation showing errors

**Solution:**
- This is expected if tables are not created yet
- Execute the enhanced schema SQL first
- Run the validation again after schema setup

## 📊 Sample Data

The system includes sample data for testing:

**Sample Patients:**
- PS-MP-017: Rajesh Kumar (8328232607)
- PS-MP-018: Priya Sharma (9876543210)
- PS-MP-019: Amit Patel (7654321098)

**Sample Inventory:**
- Paracetamol 500mg (8 units) - Low stock
- Cetirizine Cold Tablet (15 units)
- Amoxicillin 250mg (3 units) - Critical stock
- Ibuprofen 400mg (25 units)
- Omeprazole 20mg (6 units) - Low stock

## 🎨 UI Features

### Patient Notifications Dashboard
- View all registered patients
- See purchase patterns and frequencies
- Track notification delivery status
- Add new patients and purchase records

### Enhanced Alerts Dashboard
- Real-time alert feed
- Filter by severity (Critical, High, Medium, Low)
- Role-based alert targeting
- Acknowledge and dismiss alerts
- View alert statistics

### OCR Audit System
- Camera or file upload scanning
- Confidence scoring for extracted data
- Check-in/check-out workflows
- Complete audit trail
- Session management

### System Validation Dashboard
- System health overview
- Component-level health checks
- Performance metrics
- Quick vs full validation
- Automated recommendations

## 🔐 Security Notes

- All features respect role-based access control
- Pharmacists can access operational features
- Admins have full access including system validation
- Audit trails are immutable and timestamped
- All database operations are logged

## 📈 Performance Tips

1. **Enable Database Indexes**
   - The schema includes optimized indexes
   - Ensure they are created properly

2. **Configure Realtime**
   - Enable only necessary tables for realtime
   - Use filters to reduce data transfer

3. **Optimize Images for OCR**
   - Use clear, well-lit images
   - Ensure text is readable
   - Avoid blurry or distorted images

4. **Regular Health Checks**
   - Run system validation weekly
   - Monitor performance metrics
   - Address warnings proactively

## 🚀 Production Deployment

### Before Going Live:

1. **Database Backup**
   - Create a backup of your Supabase database
   - Test restore procedures

2. **Environment Variables**
   - Use production Supabase credentials
   - Never commit `.env.local` to version control

3. **Performance Testing**
   - Test with realistic data volumes
   - Monitor query performance
   - Optimize slow queries

4. **Security Audit**
   - Review Row Level Security policies
   - Test role-based access control
   - Validate input sanitization

5. **Monitoring Setup**
   - Configure error tracking (e.g., Sentry)
   - Set up performance monitoring
   - Create alerting rules

## 📞 Support

If you encounter issues:

1. Check the browser console for errors
2. Review the Supabase logs
3. Verify all environment variables are set
4. Ensure database schema is properly deployed
5. Check that realtime is enabled for required tables

## 🎉 Success Checklist

- [ ] Database schema deployed successfully
- [ ] All tables visible in Supabase Table Editor
- [ ] Application starts without errors
- [ ] New sidebar menu items visible
- [ ] Patient Notifications page loads
- [ ] Enhanced Alerts page loads
- [ ] OCR Audit System page loads
- [ ] System Validation page loads (Admin)
- [ ] Can add new patients
- [ ] Can create purchase records
- [ ] Alerts are generated automatically
- [ ] OCR can process images
- [ ] System validation runs successfully

Once all items are checked, your Viala enhanced features are ready for use!

---

**Need Help?** Check the `ENHANCED-FEATURES-README.md` for detailed feature documentation.