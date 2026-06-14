# Viala Live Demo Instructions

## 🚀 Quick Start
```bash
cd viala
npm run dev
```
**Access**: http://localhost:3000

## 🔐 Demo Accounts (WORKING)
| Role | Email | Password |
|------|-------|----------|
| **Pharmacist** | pharmacist@viala.com | demo123 |
| **Admin** | admin@viala.com | demo123 |

**✅ LOGIN ISSUE RESOLVED**: Demo mode is now active with working credentials and sample inventory data.

## 🎯 Demo Flow (5-Minute Judge Experience)

### 1. **Login & Role Demonstration** (30 seconds)
- Start with Pharmacist login
- Show limited navigation (Dashboard, Inventory, Visual Shelf)
- Switch to Admin login via `/demo` page
- Show expanded navigation (+ Eco Analytics, NGO Network)

### 2. **Executive Dashboard** (60 seconds)
- **Pharmacist View**: 3 KPI cards (Inventory Value, Expiring Soon, System Insights)
- **Admin View**: 5 sections including Eco Impact and Predictive Insights
- Demonstrate animated counters and role-based visibility
- Show scenario selector (Admin only) in header

### 3. **Visual Shelf Heatmap** (90 seconds)
- Navigate to `/shelf-heatmap`
- Show 10x6 grid with FEFO color coding:
  - 🔴 Critical (<30 days) - pulsing red
  - 🟡 Warning (30-90 days) - amber
  - ⚪ Healthy (≥90 days) - white/teal
- Click any item to open detailed drawer
- Show 3 sections: Status Summary, Price Impact, Recommended Actions
- Demonstrate role-based pricing visibility (Admin sees revenue analytics)

### 4. **Surge Prediction** (60 seconds)
- **Admin only**: Toggle scenario from "Normal" to "Monsoon Season"
- Watch high-demand items get blue glow and "High Demand" badges
- Show predictive insights panel with shortage warnings
- Demonstrate real-time scenario impact calculations

### 5. **Eco Impact Analytics** (45 seconds)
- Navigate to `/eco-analytics` (Admin only)
- Show environmental impact metrics:
  - Waste Prevented (kg)
  - CO₂ Offset (kg)  
  - Sustainability Score (A+/A/B/C)
- Demonstrate professional environmental messaging
- Show real-time metric calculations

### 6. **Live Data Demonstration** (30 seconds)
- Open Supabase dashboard in another tab
- Edit an inventory item (change expiry_date or shelf_location)
- Watch Viala update instantly without refresh
- Show realtime FEFO color changes and shelf movements

## 🔥 Key Value Propositions to Highlight

### **Financial Impact**
- "Recoverable Revenue: ₹184,500 from near-expiry rescue actions"
- "40% discount on critical items prevents total loss"
- "Dynamic pricing protects profitability while reducing waste"

### **Environmental Impact**  
- "847 kg chemical waste prevented from soil contamination"
- "3,800+ kg CO₂ offset through waste prevention"
- "Sustainability Score: A+ through FEFO optimization"

### **Predictive Intelligence**
- "Monsoon season simulation identifies vulnerable inventory"
- "3 medicines may face shortage - proactive reorder suggestions"
- "Visual demand prediction with blue glow indicators"

### **Operational Excellence**
- "Real-time shelf heatmap with instant FEFO status"
- "Role-based access: Pharmacists focus on operations, Admins see analytics"
- "Live inventory updates without page refresh"

## 🎪 Judge-Worthy Moments

1. **"Watch this update live"** - Edit Supabase data, show instant UI changes
2. **"Switch scenarios"** - Toggle Monsoon mode, watch items light up blue
3. **"Role-based intelligence"** - Login as different users, show tailored experiences
4. **"Environmental responsibility"** - Show waste prevention and CO₂ offset metrics
5. **"Proactive planning"** - Demonstrate shortage predictions and reorder suggestions

## 🛡️ System Reliability

### **Error Handling**
- Graceful fallback to demo mode if Supabase unavailable
- Professional error states with user-friendly messages
- Network resilience with automatic reconnection

### **Performance**
- Sub-second page loads
- Smooth animations and transitions
- Responsive design works on all devices
- Real-time updates without performance impact

### **Security**
- Role-based access control enforced
- Session management with proper logout
- Environment variable protection

## 📊 Technical Architecture Highlights

- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS, Shadcn/UI
- **Backend**: Supabase PostgreSQL with real-time subscriptions
- **State Management**: React Context for auth and scenarios
- **Calculations**: Client-side FEFO, pricing, and eco metrics
- **Real-time**: Live inventory updates via Supabase subscriptions
- **Deployment Ready**: Production build tested and verified

## 🎯 Success Metrics

**A successful demo achieves:**
- ✅ Judge understands value proposition in <60 seconds
- ✅ System feels stable and production-ready
- ✅ Real-time capabilities are clearly demonstrated
- ✅ Both financial and environmental benefits are visible
- ✅ Proactive planning capabilities are evident
- ✅ Professional medical-grade UI inspires trust

**Judge should say:** *"This system doesn't just manage inventory - it prevents waste, protects profits, and helps pharmacies plan ahead. It feels like a real enterprise solution."*