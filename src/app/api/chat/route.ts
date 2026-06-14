import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const messages = body.messages || []
    const userRole = body.userRole || 'pharmacist'
    
    // Get the last user message
    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || ''
    
    let reply = ''
    
    // Red Zone Items Query
    if (lastMessage.includes('red zone') || lastMessage.includes('critical') || lastMessage.includes('expire')) {
      reply = `I found 4 critical items that need immediate attention:

• Paracetamol 500mg expires in 8 days (Batch PAR2024A)
• Amoxicillin 250mg expires in 12 days (Batch AMX2024B) 
• Cough Syrup 100ml expires in 14 days (Batch CS2024C)
• Vitamin B12 Injection expires in 10 days (Batch VB2024D)

Here's what I recommend:
- Return Amoxicillin to vendor (you'll recover ₹700)
- Put Paracetamol on 40% discount (still get ₹180 revenue)
- Donate Cough Syrup to NGO (great for community impact)

Without action, you're looking at ₹2,450 in potential losses. The Visual Shelf Heatmap shows these in red - you can see the exact shelf locations there.`
    }
    
    // Revenue Analysis (Admin only)
    else if ((lastMessage.includes('revenue') || lastMessage.includes('profit') || lastMessage.includes('financial')) && userRole === 'admin') {
      reply = `Looking at your financial picture right now:

Your total inventory is worth ₹2,45,000. Here's what caught my attention:

Revenue at Risk: ₹18,450 (about 7.5% of your inventory)
- This is from medicines expiring soon

Good news - you can recover most of this:
- Vendor returns: ₹12,915 (70% recovery rate)
- Discount sales: Usually 85% conversion rate
- NGO donations: ₹3,200/month tax benefit

Your FEFO compliance is at 94% - that's excellent! Most pharmacies are around 78%.

Monthly savings from waste prevention: ₹8,200
Early expiry alerts are protecting: ₹15,600/month

Environmental bonus: You're preventing 12.3kg CO₂ emissions monthly and have an A+ sustainability score - you're in the top 5% of pharmacies!

Check the Eco Analytics page for detailed environmental metrics.`
    }
    
    // FEFO Recommendations
    else if (lastMessage.includes('fefo') || lastMessage.includes('batch') || lastMessage.includes('sell first')) {
      reply = `Here's your batch priority list - sell these first:

1. Paracetamol 500mg (Batch PAR2024A) - only 8 days left!
2. Vitamin B12 (Batch VB2024D) - 10 days remaining
3. Amoxicillin 250mg (Batch AMX2024B) - 12 days left
4. Cough Syrup (Batch CS2024C) - 14 days remaining

Current FEFO status:
- 4 items critical (≤15 days) - need immediate action
- 8 items in warning zone (16-30 days) - keep an eye on these
- 112 items safe (>30 days) - business as usual

Pro tip: The billing system can auto-prioritize these critical batches. Also, consider generating discount labels for the warning zone items.

The Visual Shelf Heatmap shows all this with color coding - red for critical, yellow for warning, green for safe. Makes it super easy for your staff to see what to sell first.`
    }
    
    // Low Stock Analysis
    else if (lastMessage.includes('low stock') || lastMessage.includes('reorder') || lastMessage.includes('stock')) {
      reply = `I see some items running low that need your attention:

Critical (order immediately):
• Insulin Glargine - only 3 units left! This is urgent.
• ORS Sachets - 15 packets (high demand due to monsoon season)

Priority reorders:
• Paracetamol Syrup - 8 bottles (fast-moving item)
• Surgical Gloves - 2 boxes (essential supply)

My recommendations:
- Order 50 units of Insulin Glargine right away (you'll run out in 2 days)
- Get 200 ORS packets - monsoon season means 2.5x normal demand
- Consider auto-reorder for critical medicines like Insulin

Supplier lead time is usually 3-5 days, so don't wait on the Insulin.

The Demand Forecasting page has AI predictions that can help you plan better for seasonal spikes like this monsoon demand.`
    }
    
    // Inventory Health Overview
    else if (lastMessage.includes('health') || lastMessage.includes('status') || lastMessage.includes('overview')) {
      reply = `📊 **Inventory Health Dashboard**

**Overall Status: 🟢 HEALTHY (94% FEFO Compliance)**

**Inventory Breakdown:**
• **Total Items:** 124 medicines in stock
• **Fresh (>365 days):** 45 items (36%) 🟢
• **Healthy (181-365 days):** 38 items (31%) 🟢  
• **Moderate (91-180 days):** 23 items (19%) 🟡
• **Warning (31-90 days):** 12 items (10%) 🟠
• **Critical (≤30 days):** 6 items (4%) 🔴

**Key Metrics:**
• **FEFO Compliance:** 94% (Industry avg: 78%)
• **Waste Prevention:** ₹8,200/month saved
• **Recovery Rate:** 70% via vendor returns
• **Sustainability Score:** A+ Rating

**Action Items:**
• 6 items need immediate attention (Red Zone)
• 4 vendor return opportunities available
• 2 items eligible for NGO donation
• 8 reorder suggestions pending

**Environmental Impact:**
• CO₂ Reduction: 12.3kg/month
• Waste Prevented: 1.2kg pharmaceutical waste
• Water Saved: 45L/month

Your pharmacy is performing excellently with minimal waste!`
    }
    
    // Default helpful response
    else {
      reply = `Hi! I'm here to help with your pharmacy operations. 

I can assist you with:

Inventory Management:
- "Show me Red Zone items" - see what's expiring soon
- "What's my inventory health?" - overall status check
- "Which items need reordering?" - stock alerts

FEFO & Batch Management:
- "Which batches should I sell first?" - prioritization help
- "Show me near-expiry items" - rescue opportunities

${userRole === 'admin' ? 'Financial Analysis:\n- "What\'s my revenue at risk?" - financial insights\n- "Show me profit metrics" - revenue optimization\n\n' : 'Financial metrics are available for Admin users.\n\n'}Quick snapshot of your pharmacy:
- 6 items in Red Zone (need immediate attention)
- ₹18,450 revenue at risk from expiring items
- 94% FEFO compliance (excellent!)
- A+ Sustainability rating

What would you like to know about your operations?`
    }

    return NextResponse.json({
      success: true,
      role: 'assistant',
      content: reply
    })

  } catch (error) {
    console.error('Chat API Error:', error)
    
    // Import error recovery
    const { ErrorRecovery } = await import('@/lib/error-recovery')
    
    // Get the request body for error context
    let requestBody
    try {
      requestBody = await req.json()
    } catch {
      requestBody = { messages: [] }
    }
    
    const fallbackMessage = ErrorRecovery.handleChatbotError(
      error, 
      requestBody.messages?.[requestBody.messages.length - 1]?.content || ''
    )
    
    return NextResponse.json({
      success: true,
      role: 'assistant',
      content: fallbackMessage
    })
  }
}

export async function OPTIONS() {
  return NextResponse.json(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}