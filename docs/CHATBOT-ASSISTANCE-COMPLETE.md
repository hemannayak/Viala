# Viala AI Chatbot - Complete Implementation

## 🎯 Overview

The Viala AI Chatbot is a context-aware, role-based intelligent assistant that provides real-time insights into pharmacy operations, inventory management, and business intelligence. It combines OpenAI GPT-4 integration with sophisticated fallback logic to ensure reliable responses.

## ✨ Key Features

### 🧠 Context-Aware Intelligence
- **Real-time Inventory Access**: Direct integration with Supabase database
- **Role-Based Responses**: Different capabilities for Pharmacist vs Admin users
- **Pharmacy-Specific Data**: Only accesses user's pharmacy data (multi-tenant safe)
- **Seasonal Awareness**: Understands monsoon, winter, and summer demand patterns

### 🔒 Security & Restrictions
- **Pharmacy-Only Queries**: Blocks non-pharmacy related questions
- **Role-Based Access Control**: Respects RBAC rules (Pharmacist vs Admin)
- **Data Isolation**: Users can only access their pharmacy's data
- **Input Validation**: Comprehensive request validation and sanitization

### 💡 Query Capabilities

#### For All Users (Pharmacist + Admin):
- **Red Zone Analysis**: Items expiring in next 15 days
- **Expiry Reports**: 30/60/90-day expiry forecasts
- **FEFO Recommendations**: Batch prioritization for sales
- **Low Stock Alerts**: Reorder recommendations
- **Specific Medicine Queries**: "How much Paracetamol do I have?"
- **Inventory Health**: Overall status and recommendations
- **Demand Forecasting**: Seasonal patterns and predictions

#### Admin-Only Features:
- **Financial Analysis**: Revenue at risk, recovery potential
- **NGO Donation Analytics**: Rescue network opportunities
- **Environmental Impact**: Waste prevented, CO₂ offset calculations
- **Profit Metrics**: Comprehensive financial insights

## 🏗️ Architecture

### Frontend Components

#### 1. **VialaChatbot** (`/components/ui/viala-chatbot.tsx`)
- Main chatbot interface with floating button
- Real-time message rendering with markdown support
- Quick query buttons based on user role
- Inventory data loading and context management

#### 2. **Enhanced Chatbot Logic** (`/lib/enhanced-chatbot-logic.ts`)
- Advanced query classification (12 different query types)
- Role-based response generation
- Comprehensive business logic integration
- Fallback responses for all scenarios

#### 3. **Chat API Endpoint** (`/app/api/chat/route.ts`)
- OpenAI GPT-4 integration with streaming responses
- Intelligent fallback to local logic
- Role-based system prompt generation
- Comprehensive error handling and logging

### Backend Integration

#### Database Access
```typescript
// Real-time inventory fetching
const { data, error } = await supabase
  .from('inventory')
  .select('*')
  .eq('pharmacy_id', user.pharmacy_id)  // Pharmacy isolation
  .order('expiry_date', { ascending: true })
```

#### Role-Based System Prompts
```typescript
const systemPrompt = `You are Viala AI, an intelligent pharmacy inventory assistant.

USER CONTEXT:
- Role: ${user.role}
- Name: ${user.name}
- Pharmacy ID: ${user.pharmacy_id}

ROLE-BASED ACCESS:
${user.role === 'admin' ? `
ADMIN ACCESS - You can provide:
- Financial metrics (revenue at risk, recovery potential)
- Environmental impact data (waste prevented, CO₂ offset)
- NGO donation opportunities and impact calculations
` : `
${user.role.toUpperCase()} ACCESS - You can provide:
- Inventory status and stock levels
- Expiry tracking and FEFO recommendations
- Operational insights and alerts

RESTRICTED - Do NOT provide:
- Financial metrics or profit analysis
- Environmental impact or sustainability data
`}`
```

## 🎨 User Interface

### Design Philosophy
- **Enterprise SaaS Look**: Professional, medical-grade appearance
- **Calm & Trustworthy**: Teal primary color, soft borders
- **Clear Visual Hierarchy**: Proper spacing, typography, and iconography
- **Mobile Responsive**: Adapts to different screen sizes

### UI Components
- **Floating Chat Button**: Bottom-right corner with AI indicator
- **Minimizable Interface**: Can be collapsed while maintaining context
- **Quick Query Buttons**: Role-based pre-built queries
- **Rich Message Formatting**: Markdown support with proper styling
- **Real-time Indicators**: Loading states, typing indicators

### Quick Query Examples
```typescript
const QUICK_QUERIES = [
  {
    label: 'Red Zone Items',
    query: 'Show me all Red Zone items',
    icon: AlertTriangle,
    description: 'Items expiring in next 15 days',
    roleRequired: 'pharmacist'
  },
  {
    label: 'Revenue at Risk',
    query: "What's my revenue at risk?",
    icon: TrendingDown,
    description: 'Financial impact analysis',
    roleRequired: 'admin'  // Admin only
  }
]
```

## 🔍 Query Processing Flow

### 1. Query Classification
```typescript
function classifyQuery(query: string): string {
  const lowerQuery = query.toLowerCase()
  
  if (lowerQuery.includes('red zone')) return 'RED_ZONE_ANALYSIS'
  if (lowerQuery.includes('revenue')) return 'FINANCIAL_ANALYSIS'
  if (lowerQuery.includes('fefo')) return 'FEFO_RECOMMENDATIONS'
  // ... 12 total query types
}
```

### 2. Role-Based Response Generation
```typescript
switch (queryType) {
  case 'FINANCIAL_ANALYSIS':
    if (user.role !== 'admin') {
      return generateAccessDeniedResponse('financial metrics', user.role)
    }
    return generateFinancialAnalysis(inventory)
}
```

### 3. Business Logic Integration
```typescript
// Red Zone Analysis Example
const redZoneItems = inventory.filter(item => {
  const days = calculateDaysToExpiry(item.expiry_date)
  return days <= 15 && days > 0
})

const totalValue = redZoneItems.reduce((sum, item) => 
  sum + (item.price * item.quantity), 0)
const recoveryPotential = totalValue * 0.70 // 70% vendor return rate
```

## 📊 Response Examples

### Red Zone Analysis Response
```
🚨 **Red Zone Alert - Immediate Action Required**

Found **3 items** expiring in the next 15 days with a total value of **₹45,750**.

**Critical Items:**
• **Paracetamol 500mg** - 124 units, expires in 7 days (₹19,220)
• **Amoxicillin 250mg** - 67 units, expires in 12 days (₹30,150)
• **Cough Syrup** - 45 units, expires in 14 days (₹6,750)

**Financial Impact:**
• Total Value at Risk: ₹45,750
• Recovery Potential: ₹32,025 (70% vendor return)
• Potential Loss: ₹13,725

**Recommended Actions:**
1. **Vendor Returns** - Process immediately (70% recovery rate)
2. **Emergency Discounts** - Apply 30-40% discount for quick sale
3. **NGO Donations** - Items <7 days eligible for tax benefits
4. **Staff Priority** - Move to front shelf positions
```

### Financial Analysis (Admin Only)
```
💰 **Financial Impact Analysis**

**Total Inventory Value:** ₹2,847,000

**Risk Assessment:**
• Revenue at Risk (≤90 days): ₹184,500 (6.5%)
• Critical Value (≤30 days): ₹75,200
• Recovery Potential: ₹129,150 (70% vendor return)
• Potential Loss: ₹55,350

**Recovery Strategies:**
1. **Vendor Returns**: ₹52,640 recoverable
2. **Emergency Sales**: 30-40% discount for quick turnover
3. **NGO Donations**: Tax benefits + social impact
4. **Staff Sales**: Employee discount programs
```

## 🛡️ Security Features

### Input Validation
```typescript
const chatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().min(1).max(2000)
  })).min(1).max(20)
})
```

### Pharmacy-Related Query Filtering
```typescript
class PharmacyChatbotRestrictions {
  private static readonly ALLOWED_TOPICS = [
    'medicine', 'drug', 'pharmacy', 'inventory', 'stock', 'fefo',
    'expiry', 'batch', 'revenue', 'profit', 'seasonal', 'demand'
  ]
  
  private static readonly RESTRICTED_TOPICS = [
    'weather', 'sports', 'politics', 'entertainment', 'technology'
  ]
}
```

### Role-Based Access Control
```typescript
// Pharmacist access denied response
if (user.role !== 'admin') {
  return `🔒 **Access Restricted**
  
  Sorry, financial metrics are only available to Admin users. 
  Your current role (PHARMACIST) has access to:
  
  **Available Features:**
  • Inventory status and stock levels
  • Expiry tracking and FEFO recommendations
  • Rescue actions (vendor returns, donations)
  • Operational insights and alerts`
}
```

## 🚀 Performance Optimizations

### Streaming Responses
- OpenAI integration with streaming for real-time responses
- Immediate fallback to local logic if OpenAI fails
- Response caching for common queries

### Efficient Data Loading
- Lazy loading of inventory data when chatbot opens
- Pagination support for large inventories
- Real-time updates via Supabase subscriptions

### Error Handling
```typescript
try {
  const result = await streamText({
    model: openai('gpt-4-turbo-preview'),
    system: systemPrompt,
    messages: messages,
    temperature: 0.3,
    maxTokens: 1000
  })
  return result.toTextStreamResponse()
} catch (openaiError) {
  logger.error('OpenAI API error, falling back to local logic', openaiError)
  return await handleFallbackResponse(query, inventory, user)
}
```

## 📱 Mobile Responsiveness

### Adaptive Layout
- Responsive card sizing (96 width on desktop, full width on mobile)
- Touch-friendly button sizes and spacing
- Optimized message rendering for small screens

### Mobile-Specific Features
- Swipe gestures for minimizing/maximizing
- Keyboard-aware input positioning
- Optimized quick query button layout

## 🔧 Configuration & Setup

### Environment Variables
```env
OPENAI_API_KEY=your_openai_api_key_here  # Optional - falls back to local logic
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Integration Points
1. **Authentication**: Uses existing auth provider for user context
2. **Database**: Direct Supabase integration for real-time data
3. **UI Components**: Built with Shadcn/UI for consistency
4. **Icons**: Lucide React icons throughout

## 📈 Analytics & Monitoring

### Performance Tracking
```typescript
PerformanceMonitor.startTimer('chat_request')
// ... process request ...
const duration = PerformanceMonitor.endTimer('chat_request', {
  provider: 'openai',
  messageLength: lastMessage.content.length,
  inventoryItems: userInventory.length
}, user)
```

### Error Logging
```typescript
logger.error('Chat API error', {
  userId: user.id,
  query: lastMessage.content.substring(0, 50),
  error: error.message
})
```

### Usage Metrics
- Query classification tracking
- Response time monitoring
- User engagement analytics
- Error rate tracking

## 🎯 Business Impact

### Operational Efficiency
- **Instant Insights**: No need to navigate multiple pages for information
- **Proactive Alerts**: AI identifies issues before they become critical
- **Decision Support**: Data-driven recommendations for inventory actions

### Financial Benefits
- **Revenue Recovery**: 70% recovery rate through vendor returns
- **Waste Reduction**: Proactive expiry management
- **Cost Optimization**: Efficient reorder recommendations

### User Experience
- **Natural Language Interface**: Ask questions in plain English
- **Context Awareness**: Understands pharmacy-specific terminology
- **Role-Based Experience**: Tailored to user responsibilities

## 🔮 Future Enhancements

### Planned Features
1. **Voice Integration**: Speech-to-text for hands-free operation
2. **Predictive Analytics**: ML-powered demand forecasting
3. **Integration APIs**: Connect with external pharmacy systems
4. **Multi-language Support**: Regional language support
5. **Advanced Visualizations**: Charts and graphs in chat responses

### Technical Improvements
1. **Caching Layer**: Redis integration for faster responses
2. **Webhook Integration**: Real-time inventory updates
3. **Advanced NLP**: Custom pharmacy domain model training
4. **Offline Support**: Local storage for critical functionality

## 📚 Documentation Links

- [System Architecture](./VIALA-SYSTEM-ANALYSIS.md)
- [Integration Guide](./VIALA-CHATBOT-INTEGRATION-GUIDE.md)
- [API Documentation](./src/app/api/chat/route.ts)
- [UI Components](./src/components/ui/viala-chatbot.tsx)
- [Business Logic](./src/lib/enhanced-chatbot-logic.ts)

---

## ✅ Implementation Status: COMPLETE

The Viala AI Chatbot is fully implemented and production-ready with:

- ✅ Context-aware query processing
- ✅ Role-based access control
- ✅ Real-time inventory integration
- ✅ OpenAI GPT-4 integration with fallback
- ✅ Comprehensive business logic
- ✅ Enterprise-grade UI/UX
- ✅ Mobile responsiveness
- ✅ Security and validation
- ✅ Performance optimization
- ✅ Error handling and monitoring

The chatbot successfully addresses all requirements for accurate, context-aware responses while maintaining security, performance, and user experience standards.