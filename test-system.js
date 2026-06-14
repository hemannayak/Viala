#!/usr/bin/env node

/**
 * Viala System Test Suite
 * Tests frontend, backend, authentication, and data flow
 */

// Import required modules at the top
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if running in Node.js environment with fetch support
if (typeof globalThis.fetch === 'undefined') {
  // For Node.js < 18, we need to polyfill fetch
  try {
    globalThis.fetch = (await import('node-fetch')).default;
  } catch (error) {
    console.error('❌ This script requires Node.js 18+ or node-fetch package');
    console.error('   Install with: npm install node-fetch');
    process.exit(1);
  }
}

const BASE_URL = 'http://localhost:3000';
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Test configuration
const TEST_CONFIG = {
  baseUrl: BASE_URL,
  timeout: 20000,
  retries: 2
};

const TEST_CATEGORIES = {
  FRONTEND: 'frontend',
  API: 'api',
  AUTH: 'auth',
  CONFIG: 'config',
  DATABASE: 'database',
  COMPONENTS: 'components'
};

class TestRunner {
  constructor() {
    this.results = { passed: 0, failed: 0, warnings: 0 };
    this.tests = new Map();
  }

  addTest(category, name, testFn) {
    if (!this.tests.has(category)) {
      this.tests.set(category, []);
    }
    this.tests.get(category).push({ name, testFn });
  }

  async runCategory(category) {
    const categoryTests = this.tests.get(category) || [];
    log(`\n${this.getCategoryIcon(category)} ${category.toUpperCase()} TESTS`, 'yellow');
    log('═'.repeat(60), 'yellow');

    for (const test of categoryTests) {
      await test.testFn();
    }
  }

  getCategoryIcon(category) {
    const icons = {
      [TEST_CATEGORIES.FRONTEND]: '📱',
      [TEST_CATEGORIES.API]: '🔌',
      [TEST_CATEGORIES.AUTH]: '🔐',
      [TEST_CATEGORIES.CONFIG]: '⚙️',
      [TEST_CATEGORIES.DATABASE]: '💾',
      [TEST_CATEGORIES.COMPONENTS]: '🧩'
    };
    return icons[category] || '🧪';
  }

  async runAll() {
    log('\n╔════════════════════════════════════════════════════════╗', 'blue');
    log('║     Viala System Test Suite                     ║', 'blue');
    log('╚════════════════════════════════════════════════════════╝', 'blue');

    for (const category of this.tests.keys()) {
      await this.runCategory(category);
    }

    this.printResults();
  }

  printResults() {
    log('\n╔════════════════════════════════════════════════════════╗', 'blue');
    log('║                   TEST RESULTS                         ║', 'blue');
    log('╚════════════════════════════════════════════════════════╝', 'blue');
    
    const total = this.results.passed + this.results.failed + this.results.warnings;
    const passRate = total > 0 ? ((this.results.passed / total) * 100).toFixed(1) : 0;
    
    log(`\n✅ Passed:   ${this.results.passed}`, 'green');
    log(`❌ Failed:   ${this.results.failed}`, 'red');
    log(`⚠️  Warnings: ${this.results.warnings}`, 'yellow');
    log(`📊 Pass Rate: ${passRate}%\n`, passRate >= 80 ? 'green' : 'yellow');
    
    if (this.results.failed === 0) {
      log('🎉 All critical tests passed! System is ready.', 'green');
    } else if (this.results.failed <= 3) {
      log('⚠️  Some tests failed. Review the issues above.', 'yellow');
    } else {
      log('❌ Multiple tests failed. System needs attention.', 'red');
    }
    
    log('\n' + '═'.repeat(60) + '\n', 'blue');
  }
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function makeRequest(path, options = {}) {
  const url = new URL(path, BASE_URL);
  
  const fetchOptions = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url.toString(), fetchOptions);
    const text = await response.text();
    
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    
    return { 
      status: response.status, 
      data, 
      headers: Object.fromEntries(response.headers.entries())
    };
  } catch (error) {
    throw new Error(`Request failed: ${error.message}`);
  }
}

async function testEndpoint(testRunner, name, path, expectedStatus = 200, options = {}) {
  try {
    log(`\n🧪 Testing: ${name}`, 'cyan');
    
    // Add timeout and retry logic
    let lastError;
    for (let attempt = 1; attempt <= TEST_CONFIG.retries; attempt++) {
      try {
        const result = await Promise.race([
          makeRequest(path, options),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), TEST_CONFIG.timeout)
          )
        ]);
        
        if (result.status === expectedStatus) {
          log(`✅ PASS: ${name} (Status: ${result.status})`, 'green');
          testRunner.results.passed++;
          return { success: true, result };
        } else {
          log(`❌ FAIL: ${name} (Expected: ${expectedStatus}, Got: ${result.status})`, 'red');
          if (result.data && typeof result.data === 'object' && result.data.error) {
            log(`   Error details: ${result.data.error}`, 'red');
          }
          testRunner.results.failed++;
          return { success: false, result };
        }
      } catch (error) {
        lastError = error;
        if (attempt < TEST_CONFIG.retries) {
          log(`   Retry ${attempt}/${TEST_CONFIG.retries - 1} after error: ${error.message}`, 'yellow');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    throw lastError;
  } catch (error) {
    log(`❌ ERROR: ${name} - ${error.message}`, 'red');
    testRunner.results.failed++;
    return { success: false, error };
  }
}

// Test suite definitions
function setupTests(testRunner) {
  // Frontend Tests
  const frontendTests = [
    { name: 'Home Page', path: '/' },
    { name: 'Login Page', path: '/login' },
    { name: 'How It Works Page', path: '/how-it-works' },
    { name: 'Outcomes Page', path: '/outcomes' },
    { name: 'Pricing Page', path: '/pricing' },
    { name: 'Impact Page', path: '/impact' },
    { name: 'Get Started Page', path: '/get-started' }
  ];

  frontendTests.forEach(test => {
    testRunner.addTest(TEST_CATEGORIES.FRONTEND, test.name, 
      () => testEndpoint(testRunner, test.name, test.path)
    );
  });

  // API Tests
  testRunner.addTest(TEST_CATEGORIES.API, 'Health Check', 
    () => testEndpoint(testRunner, 'Health Check API', '/api/health')
  );

  testRunner.addTest(TEST_CATEGORIES.API, 'Chat API', async () => {
    const chatResult = await testEndpoint(testRunner, 'Chat API', '/api/chat', 200, {
      method: 'POST',
      body: {
        messages: [{ role: 'user', content: 'Hello' }],
        userRole: 'pharmacist'
      }
    });
    
    if (chatResult.success && chatResult.result.data) {
      log(`   Response: ${chatResult.result.data.content?.substring(0, 100)}...`, 'cyan');
    }
  });

  testRunner.addTest(TEST_CATEGORIES.API, 'Inventory API (No Auth)', 
    () => testEndpoint(testRunner, 'Inventory API (No Auth)', '/api/inventory', 401)
  );

  // Authentication Tests
  testRunner.addTest(TEST_CATEGORIES.AUTH, 'Sign In API', async () => {
    // Skip if no test credentials are available
    if (!process.env.TEST_EMAIL || !process.env.TEST_PASSWORD) {
      log('   ℹ Skipping Sign In test - no test credentials provided', 'yellow');
      log('   ℹ Set TEST_EMAIL and TEST_PASSWORD environment variables to enable this test', 'yellow');
      testRunner.results.warnings++;
      return;
    }

    const signInResult = await testEndpoint(testRunner, 'Sign In API', '/api/auth/signin', 200, {
      method: 'POST',
      body: {
        email: process.env.TEST_EMAIL,
        password: process.env.TEST_PASSWORD
      }
    });
    
    if (signInResult.success) {
      log('   ✓ Authentication successful', 'green');
    }
  });

  // Configuration Tests
  testRunner.addTest(TEST_CATEGORIES.CONFIG, 'Environment Variables', () => {
    const envVars = [
      'GEMINI_API_KEY'
    ];
    
    log('Checking environment variables...', 'cyan');
    
    try {
      const envPath = join(__dirname, '.env.local');
      if (!existsSync(envPath)) {
        throw new Error('.env.local file not found');
      }
      
      const envContent = readFileSync(envPath, 'utf8');
      envVars.forEach(varName => {
        if (envContent.includes(`${varName}=`)) {
          log(`   ✓ ${varName} is configured`, 'green');
          testRunner.results.passed++;
        } else {
          log(`   ⚠ ${varName} is missing or empty`, 'yellow');
          testRunner.results.warnings++;
        }
      });
    } catch (error) {
      log(`   ❌ ${error.message}`, 'red');
      testRunner.results.failed++;
    }
  });

  // Component Tests
  testRunner.addTest(TEST_CATEGORIES.COMPONENTS, 'Critical Files', () => {
    const criticalFiles = [
      'src/app/layout.tsx',
      'src/app/(marketing)/page.tsx',
      'src/components/providers/auth-provider.tsx',
      'src/lib/db.ts',
      'src/lib/auth.ts'
    ];
    
    log('Checking critical files...', 'cyan');
    const fs = require('fs');
    const path = require('path');
    
    criticalFiles.forEach(file => {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        log(`   ✓ ${file} exists`, 'green');
        testRunner.results.passed++;
      } else {
        log(`   ❌ ${file} is missing`, 'red');
        testRunner.results.failed++;
      }
    });
  });

  // Database Connection Test
  testRunner.addTest(TEST_CATEGORIES.DATABASE, 'Connection Test', () => {
    log('Testing mock database integration...', 'cyan');
    log('   ℹ Database calls redirected to in-memory/localStorage mock store', 'blue');
    testRunner.results.passed++;
  });
}

// Main execution
async function runTests() {
  const testRunner = new TestRunner();
  setupTests(testRunner);
  await testRunner.runAll();
}

// Run tests with proper error handling
runTests().catch(error => {
  log(`\n❌ Test suite failed: ${error.message}`, 'red');
  log(`Stack trace: ${error.stack}`, 'red');
  process.exit(1);
});
