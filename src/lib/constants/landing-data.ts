import { 
  Eye, 
  Recycle, 
  TrendingUp, 
  Shield,
  CheckCircle,
  Star,
  Leaf,
  Pill,
  ShoppingBasket,
  Smartphone,
  Monitor,
  Shirt,
  BookOpen,
  Hotel,
  Wrench,
  Briefcase,
  Factory,
  Users,
  Package,
  BadgePercent,
  CreditCard,
  LayoutGrid,
  Barcode
} from 'lucide-react'

export const FEATURES = [
  {
    icon: Eye,
    title: "Visual Intelligence",
    description: "Real-time shelf monitoring with AI-powered expiry detection"
  },
  {
    icon: Recycle,
    title: "FEFO Management", 
    description: "First Expired, First Out workflow automation"
  },
  {
    icon: TrendingUp,
    title: "Predictive Analytics",
    description: "Demand forecasting and inventory optimization"
  },
  {
    icon: Shield,
    title: "Rescue Actions",
    description: "Automated discount, donation, and redistribution workflows"
  }
]

export const STATS = [
  { value: "94%", label: "Waste Reduction" },
  { value: "₹2.4L", label: "Avg. Monthly Savings" },
  { value: "500+", label: "Pharmacies" },
  { value: "99.9%", label: "Uptime" }
]

export const NAVIGATION_ITEMS = [
  { href: "#features", label: "Features" },
  { href: "#industries", label: "Use Cases" },
  { href: "#modules", label: "Platform" },
  { href: "#integrations", label: "Integrations" },
  { href: "#about", label: "About" },
  { href: "#pricing", label: "Pricing" },
  { href: "/dashboard", label: "Dashboard" }
]

export const INDUSTRIES = [
  {
    icon: Pill,
    title: 'Expiry & FEFO Control',
    description: 'Prevent near-expiry losses with FEFO-first shelf workflows.'
  },
  {
    icon: Eye,
    title: 'Visual Shelf Heatmap',
    description: 'Spot critical shelves and risky batches instantly.'
  },
  {
    icon: TrendingUp,
    title: 'Demand Forecasting',
    description: 'Avoid stockouts and overstock using predictive demand signals.'
  },
  {
    icon: Recycle,
    title: 'Rescue Actions',
    description: 'Discount, donate, or transfer stock before it expires.'
  },
  {
    icon: Users,
    title: 'NGO Rescue Network',
    description: 'Connect surplus medicines with NGOs and verified recipients.'
  },
  {
    icon: Leaf,
    title: 'Eco Impact Analytics',
    description: 'Track waste reduction and environmental impact in real-time.'
  },
  {
    icon: Barcode,
    title: 'Fast Billing + Traceability',
    description: 'Speed up sales while keeping batch-level traceability.'
  },
  {
    icon: Package,
    title: 'Inventory Health',
    description: 'Know what to reorder, what to push, and what to rescue.'
  },
  {
    icon: Shield,
    title: 'Audit-Ready Operations',
    description: 'Clear logs and accountability for safer pharmacy operations.'
  },
  {
    icon: CreditCard,
    title: 'Margin Protection',
    description: 'Reduce dead stock and protect profit through timely actions.'
  },
  {
    icon: LayoutGrid,
    title: 'Operational Dashboards',
    description: 'A single view of alerts, actions, and inventory KPIs.'
  },
  {
    icon: Smartphone,
    title: 'OCR/Scanning Workflows',
    description: 'Faster data capture for batches, bills, and stock updates.'
  }
]

export const MODULES = [
  {
    icon: Eye,
    title: 'Visual Shelf Heatmap',
    description: 'Shelf-level risk visibility and expiry hotspots.',
    href: '/shelf-heatmap'
  },
  {
    icon: TrendingUp,
    title: 'Demand Forecasting',
    description: 'Predict demand and optimize reorders using AI signals.',
    href: '/demand-forecasting'
  },
  {
    icon: Recycle,
    title: 'Rescue Workflows',
    description: 'Discount, donate, transfer, and vendor-return flows.',
    href: '/intelligent-pharmacy'
  },
  {
    icon: Package,
    title: 'Inventory',
    description: 'Batch-level inventory, expiry tracking, and FEFO operations.',
    href: '/inventory'
  },
  {
    icon: Leaf,
    title: 'Eco Analytics',
    description: 'Measure waste reduction and sustainability impact.',
    href: '/eco-analytics'
  },
  {
    icon: Users,
    title: 'NGO Rescue Network',
    description: 'Route expiring stock to NGOs with traceability.',
    href: '/ngo-network'
  }
]

export const INTEGRATIONS = [
  'Database',
  'OCR (Tesseract)',
  'WhatsApp Business',
  'Email (SendGrid)',
  'Google Maps',
  'Gemini AI'
]

export const TRUST_INDICATORS = [
  {
    icon: CheckCircle,
    text: "No setup fees",
    color: "text-emerald-500"
  },
  {
    icon: CheckCircle,
    text: "30-day trial",
    color: "text-emerald-500"
  },
  {
    icon: CheckCircle,
    text: "Cancel anytime",
    color: "text-emerald-500"
  }
]

export const FOOTER_BADGES = [
  {
    icon: Leaf,
    text: "Eco-Friendly",
    color: "text-emerald-500"
  },
  {
    icon: Shield,
    text: "Secure",
    color: "text-blue-500"
  },
  {
    icon: Star,
    text: "Enterprise Ready",
    color: "text-yellow-500"
  }
]