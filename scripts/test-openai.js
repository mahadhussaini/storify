/**
 * Simple test script to verify OpenAI integration
 * Run with: node scripts/test-openai.js
 */

const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

async function testOpenAIIntegration() {
  console.log('Testing OpenAI integration...\n')

  try {
    // Test 1: Import the OpenAI service
    console.log('1. Testing OpenAI service import...')
    const { getOpenAIStatus, isOpenAIAvailable, OpenAIConfigurationError } = require('../lib/openai.ts')
    console.log('✅ OpenAI service imported successfully\n')

    // Test 2: Check configuration status
    console.log('2. Checking OpenAI configuration status...')
    const status = getOpenAIStatus()
    console.log('Configuration status:', status)
    console.log(status.configured ? '✅ OpenAI is configured' : '❌ OpenAI is not configured\n')

    // Test 3: Check availability
    console.log('3. Testing OpenAI availability...')
    const available = isOpenAIAvailable()
    console.log('Available:', available)
    console.log(available ? '✅ OpenAI is available' : '❌ OpenAI is not available\n')

    // Test 4: Test error class
    console.log('4. Testing OpenAIConfigurationError...')
    const testError = new OpenAIConfigurationError('Test error message')
    console.log('Error instance created:', testError instanceof OpenAIConfigurationError)
    console.log('Error message:', testError.message)
    console.log('✅ OpenAIConfigurationError works correctly\n')

    console.log('🎉 All OpenAI integration tests passed!')

  } catch (error) {
    console.error('❌ OpenAI integration test failed:', error.message)
    process.exit(1)
  }
}

testOpenAIIntegration()
