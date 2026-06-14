/**
 * Configuration Validator
 * Validates environment variables and provides helpful error messages
 */

export interface ConfigValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
  mode: 'production' | 'demo' | 'development'
}

export class ConfigValidator {
  
  static validateEnvironment(): ConfigValidation {
    const errors: string[] = []
    const warnings: string[] = []
    
    // Check database configuration
    const dbUrl = process.env.DATABASE_URL
    
    if (!dbUrl || dbUrl === 'your-production-database-url') {
      warnings.push('DATABASE_URL not configured - using local demo database')
    }
    
    // Check AI configuration
    const openaiKey = process.env.OPENAI_API_KEY
    const geminiKey = process.env.GEMINI_API_KEY
    const huggingfaceKey = process.env.HUGGINGFACE_API_KEY
    
    if (!openaiKey && !geminiKey && !huggingfaceKey) {
      warnings.push('No AI API keys configured - chatbot will use fallback responses')
    }
    
    // Check security configuration
    // JWT_SECRET is a server-only secret and is not available in the browser bundle.
    // Validate it only on the server to avoid false production errors.
    if (typeof window === 'undefined') {
      const nextPhase = process.env.NEXT_PHASE
      const isBuildPhase =
        nextPhase === 'phase-production-build' ||
        nextPhase === 'phase-export' ||
        process.env.NEXT_BUILD === 'true'
      const jwtSecret = process.env.JWT_SECRET

      const isMissingOrExactDefault =
        !jwtSecret ||
        jwtSecret === 'your-super-secret-jwt-key-change-this-in-production-viala-2024' ||
        jwtSecret === 'your-jwt-secret-key'

      const looksPlaceholder = !!jwtSecret && /change[_-]?me/i.test(jwtSecret)

      // Only treat as an ERROR during actual production runtime. During build we only warn.
      if (isMissingOrExactDefault) {
        if (process.env.NODE_ENV === 'production' && !isBuildPhase) {
          errors.push('JWT_SECRET must be changed in production')
        } else {
          warnings.push('Using default JWT secret - change for production')
        }
      } else if (looksPlaceholder) {
        warnings.push('JWT_SECRET looks like a placeholder - use a strong random secret for production')
      }
    }
    
    // Check email configuration
    const smtpHost = process.env.SMTP_HOST
    const smtpUser = process.env.SMTP_USER
    if (!smtpHost || !smtpUser) {
      warnings.push('Email configuration missing - notifications will be logged only')
    }
    
    // Determine mode
    let mode: 'production' | 'demo' | 'development' = 'development'
    
    if (process.env.NODE_ENV === 'production') {
      mode = errors.length === 0 ? 'production' : 'demo'
    } else if (process.env.NEXT_PUBLIC_FORCE_DEMO_MODE === 'true') {
      mode = 'demo'
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      mode
    }
  }
  
  static logConfigurationStatus() {
    const validation = this.validateEnvironment()
    
    console.log(`🔧 Viala Configuration Status: ${validation.mode.toUpperCase()} MODE`)
    
    if (validation.errors.length > 0) {
      console.error('❌ Configuration Errors:')
      validation.errors.forEach(error => console.error(`  - ${error}`))
    }
    
    if (validation.warnings.length > 0) {
      console.warn('⚠️  Configuration Warnings:')
      validation.warnings.forEach(warning => console.warn(`  - ${warning}`))
    }
    
    if (validation.isValid) {
      console.log('✅ Configuration is valid')
    }
    
    return validation
  }
}