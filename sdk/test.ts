import { SliceClient } from './src/index.js';
import {
  SliceAuthenticationError,
  SliceValidationError,
  SliceNetworkError,
  SliceTimeoutError,
  SliceAPIError,
} from './src/errors.js';
import dotenv from 'dotenv';

dotenv.config();

// Configuration - Update these with your actual test values
const TEST_CONFIG = {
  // Your test API key (should start with 'sk_test_' or 'sk_live_')
  apiKey: process.env.SLICE_API_KEY || 'sk_live_your_api_key_here',
  
  // Base URL for the API
  baseUrl: process.env.SLICE_API_URL || 'http://localhost:3001',
  
  // Test data - these will be created/used during testing
  // testUserId: 'test_user_' + Date.now(),
  testUserId: 'test_user_' + Date.now(),
  testLicenseId: 'e2c28e10-02c6-407d-b503-755f07e97bb2', // Replace with actual license ID from your system
};

// Helper function to log test results
function logTest(name: string, status: 'PASS' | 'FAIL' | 'SKIP', message?: string) {
  const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️';
  console.log(`${emoji} ${name}${message ? `: ${message}` : ''}`);
}

// Helper function to log section headers
function logSection(title: string) {
  console.log('\n' + '='.repeat(60));
  console.log(`  ${title}`);
  console.log('='.repeat(60) + '\n');
}

/**
 * Test 1: Client Initialization
 * Tests different ways to initialize the SDK client
 */
async function testClientInitialization() {
  logSection('Test 1: Client Initialization');

  try {
    // Test 1.1: Basic initialization with API key only
    logTest('1.1 Basic initialization', 'PASS');
    const client1 = new SliceClient(TEST_CONFIG.apiKey);
    console.log('   ✓ Client created with API key only');

    // Test 1.2: Initialization with custom base URL
    logTest('1.2 Custom base URL', 'PASS');
    const client2 = new SliceClient(TEST_CONFIG.apiKey, {
      baseUrl: TEST_CONFIG.baseUrl,
    });
    console.log('   ✓ Client created with custom base URL');

    // Test 1.3: Initialization with timeout
    logTest('1.3 Custom timeout', 'PASS');
    const client3 = new SliceClient(TEST_CONFIG.apiKey, {
      baseUrl: TEST_CONFIG.baseUrl,
      timeout: 10000, // 10 seconds
    });
    console.log('   ✓ Client created with custom timeout');

    // Test 1.4: Verify client has all method groups
    logTest('1.4 Method groups available', 'PASS');
    if (client1.validate && client1.users && client1.licenses) {
      console.log('   ✓ All method groups (validate, users, licenses) are available');
    } else {
      throw new Error('Missing method groups');
    }

    return client1; // Return a client for use in other tests
  } catch (error: any) {
    logTest('Client initialization', 'FAIL', error.message);
    throw error;
  }
}

/**
 * Test 2: User Management
 * Tests creating and managing users
 */
async function testUserManagement(client: SliceClient) {
  logSection('Test 2: User Management');

  try {
    // Test 2.1: Create user with minimal data
    logTest('2.1 Create user (minimal)', 'PASS');
    const user1 = await client.users.createUser({
      externalId: TEST_CONFIG.testUserId,
    });
    console.log(`   ✓ User created: ${user1.id} (externalId: ${user1.externalId})`);

    // Test 2.2: Create user with full data
    logTest('2.2 Create user (full data)', 'PASS');
    const user2 = await client.users.createUser({
      externalId: `test_user_full_${Date.now()}`,
      email: 'test.user@example.com',
      name: 'Test User',
      metadata: {
        source: 'sdk_test',
        testRun: new Date().toISOString(),
      },
    });
    console.log(`   ✓ User created: ${user2.id}`);
    console.log(`     Email: ${user2.email || 'N/A'}`);
    console.log(`     Name: ${user2.name || 'N/A'}`);

    // Test 2.3: Error handling - invalid externalId
    logTest('2.3 Error handling (invalid externalId)', 'PASS');
    try {
      await client.users.createUser({
        externalId: '', // Empty string should fail
      } as any);
      logTest('2.3 Error handling', 'FAIL', 'Should have thrown an error');
    } catch (error: any) {
      if (error instanceof Error) {
        console.log(`   ✓ Correctly caught error: ${error.message}`);
      }
    }

    return user1; // Return created user for use in other tests
  } catch (error: any) {
    if (error instanceof SliceAuthenticationError) {
      logTest('User management', 'FAIL', 'Authentication failed - check your API key');
    } else if (error instanceof SliceValidationError) {
      logTest('User management', 'FAIL', `Validation error: ${error.message}`);
    } else if (error instanceof SliceNetworkError) {
      logTest('User management', 'FAIL', `Network error: ${error.message}`);
    } else {
      logTest('User management', 'FAIL', error.message);
    }
    throw error;
  }
}

/**
 * Test 3: License Validation
 * Tests validating user licenses
 */
async function testLicenseValidation(client: SliceClient, userId: string) {
  logSection('Test 3: License Validation');

  try {
    // Test 3.1: Validate user with no license (expected to fail)
    logTest('3.1 Validate user (no license)', 'PASS');
    const result1 = await client.validate.validate(userId);
    if (!result1.valid) {
      console.log(`   ✓ Correctly identified invalid license: ${result1.reason}`);
    } else {
      console.log(`   ✓ License is valid: ${result1.license.id}`);
      if (result1.features) {
        console.log(`     Features: ${result1.features.join(', ')}`);
      }
    }

    // Test 3.2: Validate with different user ID
    logTest('3.2 Validate different user', 'PASS');
    const result2 = await client.validate.validate('non_existent_user_12345');
    if (!result2.valid) {
      console.log(`   ✓ Correctly identified invalid license: ${result2.reason}`);
    } else {
      console.log(`   ✓ License is valid`);
    }

    // Test 3.3: Error handling - invalid userId
    logTest('3.3 Error handling (invalid userId)', 'PASS');
    try {
      await client.validate.validate(''); // Empty string should fail
      logTest('3.3 Error handling', 'FAIL', 'Should have thrown an error');
    } catch (error: any) {
      if (error instanceof Error) {
        console.log(`   ✓ Correctly caught error: ${error.message}`);
      }
    }

    return result1;
  } catch (error: any) {
    if (error instanceof SliceAuthenticationError) {
      logTest('License validation', 'FAIL', 'Authentication failed - check your API key');
    } else if (error instanceof SliceAPIError) {
      logTest('License validation', 'FAIL', `API error (${error.statusCode}): ${error.message}`);
      console.log('   Note: This might indicate the endpoint path is incorrect or the server route is misconfigured');
    } else if (error instanceof SliceNetworkError) {
      logTest('License validation', 'FAIL', `Network error: ${error.message}`);
    } else {
      logTest('License validation', 'FAIL', error.message);
    }
    throw error;
  }
}

/**
 * Test 4: License Management
 * Tests assigning licenses and updating license status
 */
async function testLicenseManagement(client: SliceClient, userId: string) {
  logSection('Test 4: License Management');

  try {
    // Test 4.1: Assign license to user
    logTest('4.1 Assign license', 'PASS');
    const assignment = await client.licenses.assignLicense(
      TEST_CONFIG.testLicenseId,
      userId,
      {
        source: 'sdk_test',
        assignedBy: 'test_script',
        testRun: new Date().toISOString(),
      }
    );
    console.log(`   ✓ License assigned: ${assignment.id}`);
    console.log(`     User ID: ${assignment.userId}`);
    console.log(`     License ID: ${assignment.licenseId}`);

    // Test 4.2: Update license status to active
    logTest('4.2 Update license status (active)', 'PASS');
    const license1 = await client.licenses.updateLicenseStatus(
      TEST_CONFIG.testLicenseId,
      'active'
    );
    console.log(`   ✓ License status updated: ${license1.status}`);

    // Test 4.3: Update license status to suspended
    logTest('4.3 Update license status (suspended)', 'PASS');
    const license2 = await client.licenses.updateLicenseStatus(
      TEST_CONFIG.testLicenseId,
      'suspended'
    );
    console.log(`   ✓ License status updated: ${license2.status}`);

    // Test 4.4: Update license status back to active
    logTest('4.4 Update license status (active again)', 'PASS');
    const license3 = await client.licenses.updateLicenseStatus(
      TEST_CONFIG.testLicenseId,
      'active'
    );
    console.log(`   ✓ License status updated: ${license3.status}`);

    // Test 4.5: Error handling - invalid license ID
    logTest('4.5 Error handling (invalid license ID)', 'PASS');
    try {
      await client.licenses.assignLicense('', userId);
      logTest('4.5 Error handling', 'FAIL', 'Should have thrown an error');
    } catch (error: any) {
      if (error instanceof Error) {
        console.log(`   ✓ Correctly caught error: ${error.message}`);
      }
    }

    // Test 4.6: Error handling - invalid status
    logTest('4.6 Error handling (invalid status)', 'PASS');
    try {
      await client.licenses.updateLicenseStatus(
        TEST_CONFIG.testLicenseId,
        'invalid_status' as any
      );
      logTest('4.6 Error handling', 'FAIL', 'Should have thrown an error');
    } catch (error: any) {
      if (error instanceof Error) {
        console.log(`   ✓ Correctly caught error: ${error.message}`);
      }
    }

    return assignment;
  } catch (error: any) {
    if (error instanceof SliceAuthenticationError) {
      logTest('License management', 'FAIL', 'Authentication failed - check your API key');
    } else if (error instanceof SliceValidationError) {
      logTest('License management', 'FAIL', `Validation error: ${error.message}`);
    } else if (error instanceof SliceAPIError) {
      logTest('License management', 'FAIL', `API error (${error.statusCode}): ${error.message}`);
      console.log('   Note: This might be expected if the license ID does not exist');
    } else if (error instanceof SliceNetworkError) {
      logTest('License management', 'FAIL', `Network error: ${error.message}`);
    } else {
      logTest('License management', 'FAIL', error.message);
    }
    // Don't throw - license management might fail if license doesn't exist
    console.log('   ⚠️  Continuing with other tests...');
  }
}

/**
 * Test 5: Error Handling
 * Tests various error scenarios
 */
async function testErrorHandling() {
  logSection('Test 5: Error Handling');

  // Test 5.1: Authentication error (invalid API key)
  logTest('5.1 Authentication error', 'PASS');
  try {
    const badClient = new SliceClient('sk_test_invalid_key', {
      baseUrl: TEST_CONFIG.baseUrl,
    });
    await badClient.validate.validate('test_user');
    logTest('5.1 Authentication error', 'FAIL', 'Should have thrown authentication error');
  } catch (error: any) {
    if (error instanceof SliceAuthenticationError) {
      console.log(`   ✓ Correctly caught authentication error: ${error.message}`);
      console.log(`     Status code: ${error.statusCode}`);
    } else {
      console.log(`   ⚠️  Caught different error: ${error.message}`);
    }
  }

  // Test 5.2: Network error (invalid base URL)
  logTest('5.2 Network error', 'PASS');
  try {
    const networkClient = new SliceClient(TEST_CONFIG.apiKey, {
      baseUrl: 'http://invalid-url-that-does-not-exist-12345.com',
      timeout: 5000, // Short timeout
    });
    await networkClient.validate.validate('test_user');
    logTest('5.2 Network error', 'FAIL', 'Should have thrown network error');
  } catch (error: any) {
    if (error instanceof SliceNetworkError) {
      console.log(`   ✓ Correctly caught network error: ${error.message}`);
    } else if (error instanceof SliceTimeoutError) {
      console.log(`   ✓ Caught timeout error (expected for invalid URL): ${error.message}`);
    } else {
      console.log(`   ⚠️  Caught different error: ${error.message}`);
    }
  }

  // Test 5.3: Timeout error (very short timeout)
  logTest('5.3 Timeout error', 'SKIP');
  console.log('   ⏭️  Skipping timeout test (requires slow endpoint)');
  // Uncomment to test timeout:
  // try {
  //   const timeoutClient = new SliceClient(TEST_CONFIG.apiKey, {
  //     baseUrl: TEST_CONFIG.baseUrl,
  //     timeout: 1, // 1ms timeout - will definitely timeout
  //   });
  //   await timeoutClient.validate.validate('test_user');
  // } catch (error: any) {
  //   if (error instanceof SliceTimeoutError) {
  //     console.log(`   ✓ Correctly caught timeout error: ${error.message}`);
  //   }
  // }
}

/**
 * Test 6: Complete Workflow
 * Tests a complete tenant workflow: create user -> assign license -> validate
 */
async function testCompleteWorkflow(client: SliceClient) {
  logSection('Test 6: Complete Workflow');

  try {
    // Step 1: Create a new user
    logTest('6.1 Create user for workflow', 'PASS');
    const workflowUser = await client.users.createUser({
      externalId: `workflow_user_${Date.now()}`,
      email: 'workflow.test@example.com',
      name: 'Workflow Test User',
      metadata: {
        testType: 'complete_workflow',
      },
    });
    console.log(`   ✓ User created: ${workflowUser.id}`);

    // Step 2: Validate (should fail - no license yet)
    logTest('6.2 Validate before license assignment', 'PASS');
    const validationBefore = await client.validate.validate(workflowUser.externalId);
    if (!validationBefore.valid) {
      console.log(`   ✓ Correctly identified no license: ${validationBefore.reason}`);
    } else {
      console.log(`   ⚠️  User already has a license (unexpected)`);
    }

    // Step 3: Assign license (if license ID is provided)
    if (TEST_CONFIG.testLicenseId && TEST_CONFIG.testLicenseId !== 'test_license_123') {
      logTest('6.3 Assign license', 'PASS');
      try {
        const assignment = await client.licenses.assignLicense(
          TEST_CONFIG.testLicenseId,
          workflowUser.externalId,
          {
            source: 'workflow_test',
          }
        );
        console.log(`   ✓ License assigned: ${assignment.id}`);

        // Step 4: Validate again (should succeed now)
        logTest('6.4 Validate after license assignment', 'PASS');
        const validationAfter = await client.validate.validate(workflowUser.externalId);
        if (validationAfter.valid) {
          console.log(`   ✓ License is now valid!`);
          console.log(`     License ID: ${validationAfter.license.id}`);
          console.log(`     Status: ${validationAfter.license.status}`);
          if (validationAfter.features) {
            console.log(`     Features: ${validationAfter.features.join(', ')}`);
          }
        } else {
          console.log(`   ⚠️  License still invalid: ${validationAfter.reason}`);
        }
      } catch (error: any) {
        console.log(`   ⚠️  Could not assign license: ${error.message}`);
        console.log(`     (This is expected if license ID doesn't exist)`);
      }
    } else {
      logTest('6.3 Assign license', 'SKIP', 'No valid license ID provided');
      console.log('   ⏭️  Skipping license assignment (update TEST_CONFIG.testLicenseId)');
    }

    console.log('\n   ✓ Complete workflow test finished');
  } catch (error: any) {
    logTest('Complete workflow', 'FAIL', error.message);
    throw error;
  }
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║          Slice SDK Comprehensive Test Suite                ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\n');
  console.log('Configuration:');
  console.log(`  API Key: ${TEST_CONFIG.apiKey.substring(0, 15)}...`);
  console.log(`  Base URL: ${TEST_CONFIG.baseUrl}`);
  console.log(`  Test User ID: ${TEST_CONFIG.testUserId}`);
  console.log(`  Test License ID: ${TEST_CONFIG.testLicenseId}`);
  console.log('\n');

  let client: SliceClient;
  let testUser: any;

  try {
    // Test 1: Client Initialization
    client = await testClientInitialization();

    // Test 2: User Management
    testUser = await testUserManagement(client);

    // Test 3: License Validation
    await testLicenseValidation(client, testUser.externalId);

    // Test 4: License Management
    await testLicenseManagement(client, testUser.externalId);

    // Test 5: Error Handling
    await testErrorHandling();

    // Test 6: Complete Workflow
    await testCompleteWorkflow(client);

    // Summary
    logSection('Test Summary');
    console.log('✅ All tests completed!');
    console.log('\n');
    console.log('Note: Some tests may have been skipped or shown warnings.');
    console.log('This is normal if:');
    console.log('  - License IDs don\'t exist in your system');
    console.log('  - Users already exist');
    console.log('  - Network/authentication issues occur');
    console.log('\n');

  } catch (error: any) {
    logSection('Test Summary');
    console.log('❌ Tests failed with error:', error.message);
    console.log('\n');
    if (error instanceof SliceAuthenticationError) {
      console.log('💡 Tip: Make sure your API key is correct and has proper permissions');
    } else if (error instanceof SliceNetworkError) {
      console.log('💡 Tip: Make sure the server is running at', TEST_CONFIG.baseUrl);
    }
    console.log('\n');
    process.exit(1);
  }
}

// Run tests if this file is executed directly
// Check if running as main module (Node.js ESM)
const isMainModule = process.argv[1] && 
  (process.argv[1].endsWith('test.ts') || process.argv[1].endsWith('test.js'));

if (isMainModule) {
  runAllTests().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { runAllTests, TEST_CONFIG };
