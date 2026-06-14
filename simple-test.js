import http from 'http';

/**
 * Test API endpoint with proper error handling
 * @param {string} path - API endpoint path
 * @param {string} method - HTTP method
 * @param {object|null} body - Request body
 * @returns {Promise<{status: number, data: any}>}
 */
async function testAPI(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : null;
          resolve({ 
            status: res.statusCode, 
            data: jsonData,
            success: res.statusCode >= 200 && res.statusCode < 300
          });
        } catch (parseError) {
          // If JSON parsing fails, return raw data
          resolve({ 
            status: res.statusCode, 
            data: data,
            success: res.statusCode >= 200 && res.statusCode < 300,
            parseError: true
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout after 5 seconds'));
    });
    
    if (body) {
      try {
        req.write(JSON.stringify(body));
      } catch (error) {
        reject(new Error(`Failed to serialize request body: ${error.message}`));
        return;
      }
    }
    
    req.end();
  });
}

/**
 * Test configuration
 */
const TEST_CONFIG = {
  baseUrl: process.env.TEST_HOST || 'localhost',
  port: parseInt(process.env.TEST_PORT || '3000'),
  timeout: parseInt(process.env.TEST_TIMEOUT || '5000'),
  tests: [
    {
      name: 'Health Check',
      path: '/api/health',
      method: 'GET',
      expectedStatus: 200
    },
    {
      name: 'Chat API',
      path: '/api/chat',
      method: 'POST',
      body: {
        messages: [{ role: 'user', content: 'Hello' }],
        userRole: 'pharmacist'
      },
      expectedStatus: 200
    },
    {
      name: 'Auth API',
      path: '/api/auth/signin',
      method: 'POST',
      body: {
        email: 'admin@viala.com',
        password: 'demo123'
      },
      expectedStatus: [200, 401] // Both success and auth failure are valid responses
    }
  ]
};

/**
 * Execute a single test case
 * @param {object} testCase - Test configuration
 * @returns {Promise<{name: string, success: boolean, details: string}>}
 */
async function executeTest(testCase) {
  try {
    const result = await testAPI(testCase.path, testCase.method, testCase.body);
    const expectedStatuses = Array.isArray(testCase.expectedStatus) 
      ? testCase.expectedStatus 
      : [testCase.expectedStatus];
    
    const statusMatch = expectedStatuses.includes(result.status);
    const success = result.success || statusMatch;
    
    let details = `${result.status}`;
    if (result.data?.message) {
      details += ` - ${result.data.message}`;
    } else if (result.data?.error) {
      details += ` - Error: ${result.data.error}`;
    } else if (result.parseError) {
      details += ' - Response parsing failed';
    } else {
      details += ' - Response received';
    }
    
    return {
      name: testCase.name,
      success,
      details,
      status: result.status,
      hasError: !!result.data?.error
    };
  } catch (error) {
    return {
      name: testCase.name,
      success: false,
      details: error.message,
      status: null,
      hasError: true
    };
  }
}

async function runTests() {
  console.log('🧪 Testing Viala APIs...\n');

  const results = [];
  
  for (const testCase of TEST_CONFIG.tests) {
    const result = await executeTest(testCase);
    results.push(result);
    
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${result.name}: ${result.details}`);
    
    if (result.hasError && result.success) {
      console.log(`   ⚠️  Note: API returned an error but responded correctly`);
    }
  }

  // Summary
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log('\n' + '='.repeat(50));
  console.log(`🎉 API Tests Completed: ${passed}/${total} passed`);
  
  if (passed === total) {
    console.log('✅ All APIs are responding correctly!');
  } else {
    console.log('⚠️  Some APIs may need attention.');
    console.log('\nFailed tests:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   • ${r.name}: ${r.details}`);
    });
  }
  
  return results;
}

runTests();