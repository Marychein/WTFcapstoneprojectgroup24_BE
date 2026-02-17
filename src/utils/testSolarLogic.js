const { 
  calculateSolarSizing, 
  validateInput, 
  formatNaira, 
  getMatchingVendors,
  saveQuoteRequest,
  getSystemAnalytics
} = require('./solarLogic.js');

console.log('========================================');
console.log('   SUNFI SOLAR SIZING ENGINE TEST');
console.log('   WITH PROFESSIONAL VALIDATION');
console.log('========================================\n');

// ============================================
// PART 1: STANDARD TEST CASES
// ============================================

const testCases = [
  { name: "Small Salon", bill: 80000 },
  { name: "Medium Bakery (Chioma)", bill: 225000 },
  { name: "Large Welding Shop", bill: 450000 }
];

console.log('PART 1: STANDARD TEST CASES\n');

testCases.forEach((testCase, index) => {
  console.log(`\n--- TEST ${index + 1}: ${testCase.name} ---`);
  console.log(`Monthly Bill: ${formatNaira(testCase.bill)}\n`);
  
  try {
    // Validate input with new validation system
    const validation = validateInput(testCase.bill);
    
    console.log(' VALIDATION RESULT:');
    console.log(`   Status: ${validation.type.toUpperCase()}`);
    console.log(`   Valid: ${validation.isValid ? 'Yes' : 'No'}`);
    console.log(`   Message: ${validation.message}`);
    
    if (!validation.isValid) {
      console.log('\n Cannot proceed - validation failed');
      console.log('='.repeat(50));
      return;
    }
    
    // Show warning if present
    if (validation.type === 'warning') {
      console.log(`\n  WARNING: ${validation.message}`);
    }
    
    const result = calculateSolarSizing(testCase.bill);
    
    console.log('\n CONSUMPTION:');
    console.log(`   Daily: ${result.consumption.dailyKWh} kWh`);
    console.log(`   Monthly: ${result.consumption.monthlyKWh} kWh`);
    
    console.log('\n SYSTEM SIZE:');
    console.log(`   Recommended: ${result.systemSize.actualCapacityKW} kW`);
    
    console.log('\n COMPONENTS:');
    console.log(`   Panels: ${result.components.panels.quantity} x ${result.components.panels.wattagePerPanel}W`);
    console.log(`   Inverter: ${result.components.inverter.sizeKVA} kVA`);
    console.log(`   Batteries: ${result.components.batteries.quantity} x ${result.components.batteries.capacityPerBattery}Ah`);
    
    console.log('\n COSTS:');
    console.log(`   Panels: ${formatNaira(result.costs.panels)}`);
    console.log(`   Inverter: ${formatNaira(result.costs.inverter)}`);
    console.log(`   Batteries: ${formatNaira(result.costs.batteries)}`);
    console.log(`   Installation: ${formatNaira(result.costs.installation)}`);
    console.log(`   TOTAL: ${formatNaira(result.costs.total)}`);
    
    console.log('\n FINANCIALS:');
    console.log(`   Monthly Savings: ${formatNaira(result.financials.monthlySavings)}`);
    console.log(`   Payback Period: ${result.financials.paybackPeriodYears} years`);
    console.log(`   25-Year ROI: ${result.financials.roi}%`);
    
    console.log('\n' + '='.repeat(50));
    
  } catch (error) {
    console.error(' Error:', error.message);
  }
});

// ============================================
// PART 2: STRESS TESTS (Edge Cases)
// ============================================

console.log('\n\n========================================');
console.log('   PART 2: STRESS TESTS');
console.log('   (Edge Case Validation)');
console.log('========================================\n');

const stressTests = [
  { 
    name: "Zero Bill Test", 
    bill: 0,
    description: "Testing validation with ₦0 bill"
  },
  { 
    name: "Negative Bill Test", 
    bill: -50000,
    description: "Testing validation with negative bill"
  },
  { 
    name: "Very Low Bill Test", 
    bill: 5000,
    description: "Testing warning for unusually low SME bill"
  },
  { 
    name: "Industrial Scale Test", 
    bill: 5000000,
    description: "Testing warning for very high consumption"
  },
  { 
    name: "Exceeds Maximum Test", 
    bill: 15000000,
    description: "Testing error for industrial loads requiring custom audit"
  },
  {
    name: "Null Value Test",
    bill: null,
    description: "Testing validation with null value"
  },
  {
    name: "String Value Test",
    bill: "not-a-number",
    description: "Testing validation with invalid data type"
  }
];

stressTests.forEach((test, index) => {
  console.log(`\n STRESS TEST ${index + 1}: ${test.name}`);
  console.log(`   Description: ${test.description}`);
  console.log(`   Input: ${test.bill === null ? 'null' : test.bill}`);
  
  try {
    const validation = validateInput(test.bill);
    
    console.log('\n    VALIDATION RESULT:');
    console.log(`      Status: ${validation.type.toUpperCase()}`);
    console.log(`      Valid: ${validation.isValid ? ' Yes' : ' No'}`);
    console.log(`      Message: "${validation.message}"`);
    
    if (validation.isValid && validation.type === 'success') {
      console.log('\n    PASSED: Input accepted, can proceed with calculation');
    } else if (validation.isValid && validation.type === 'warning') {
      console.log('\n     PASSED WITH WARNING: Can proceed but user should be informed');
    } else {
      console.log('\n    BLOCKED: Input rejected, cannot proceed');
    }
    
  } catch (error) {
    console.error(`\n    UNEXPECTED ERROR: ${error.message}`);
  }
  
  console.log('\n' + '-'.repeat(50));
});

// ============================================
// PART 3: LOCATION GUARD TESTS
// ============================================

console.log('\n\n========================================');
console.log('   PART 3: LOCATION GUARD TESTS');
console.log('========================================\n');

const locationTests = [
  {
    location: "Lagos",
    systemSize: 10,
    expected: "Should find vendors"
  },
  {
    location: "Unknown City",
    systemSize: 10,
    expected: "Should return 'no vendors' message"
  },
  {
    location: "Kigali",
    systemSize: 5,
    expected: "Should find vendors in Rwanda"
  },
  {
    location: "New York",
    systemSize: 15,
    expected: "Should return 'no vendors' message"
  },
  {
    location: "Abuja",
    systemSize: 100,
    expected: "Should find some vendors (system size filter)"
  }
];

locationTests.forEach((test, index) => {
  console.log(`\n LOCATION TEST ${index + 1}: ${test.location}`);
  console.log(`   System Size: ${test.systemSize}kW`);
  console.log(`   Expected: ${test.expected}\n`);
  
  try {
    const result = getMatchingVendors(test.systemSize, test.location);
    
    if (result.success) {
      console.log(`    SUCCESS: ${result.message}`);
      console.log(`    Found ${result.vendors.length} vendor(s):`);
      result.vendors.slice(0, 3).forEach((vendor, idx) => {
        console.log(`      ${idx + 1}. ${vendor.company_name} - ${vendor.rating}⭐`);
      });
    } else {
      console.log(`     NO VENDORS: ${result.message}`);
      if (result.availableLocations && result.availableLocations.length > 0) {
        console.log(`\n    Available locations: ${result.availableLocations.slice(0, 10).join(', ')}`);
      }
    }
    
  } catch (error) {
    console.error(`    ERROR: ${error.message}`);
  }
  
  console.log('\n' + '-'.repeat(50));
});

// ============================================
// PART 4: INTEGRATED WORKFLOW TEST
// ============================================

console.log('\n\n========================================');
console.log('   PART 4: INTEGRATED WORKFLOW TEST');
console.log('   (Validation → Sizing → Vendors)');
console.log('========================================\n');

try {
  console.log(' SCENARIO: Chioma\'s Bakery (Lagos) - Full Workflow\n');
  
  const chiomasBill = 225000;
  const chiomasLocation = 'Lagos';
  
  // Step 1: Validate input
  console.log('STEP 1: Validating monthly bill...');
  const validation = validateInput(chiomasBill);
  console.log(`   ✓ Status: ${validation.type}`);
  console.log(`   ✓ Message: ${validation.message}`);
  
  if (!validation.isValid) {
    console.log('    Cannot proceed - validation failed');
    process.exit(1);
  }
  
  // Step 2: Calculate sizing
  console.log('\nSTEP 2: Calculating solar system sizing...');
  const sizing = calculateSolarSizing(chiomasBill);
  console.log(`   ✓ Recommended: ${sizing.systemSize.actualCapacityKW}kW system`);
  console.log(`   ✓ Total Cost: ${formatNaira(sizing.costs.total)}`);
  console.log(`   ✓ Payback: ${sizing.financials.paybackPeriodYears} years`);
  
  // Step 3: Find vendors
  console.log('\nSTEP 3: Finding matching vendors...');
  const vendorResult = getMatchingVendors(sizing.systemSize.actualCapacityKW, chiomasLocation);
  
  if (vendorResult.success) {
    console.log(`   ✓ ${vendorResult.message}`);
    console.log(`\n   Top 3 Vendors:`);
    vendorResult.vendors.slice(0, 3).forEach((vendor, idx) => {
      console.log(`      ${idx + 1}. ${vendor.company_name}`);
      console.log(`         Rating: ${vendor.rating}⭐ | ${vendor.years_in_business} years`);
      console.log(`         Response: ${vendor.avg_response_time}`);
    });
    
    // Step 4: Save quote request
    console.log('\nSTEP 4: Submitting quote request...');
    const topVendor = vendorResult.vendors[0];
    const userData = {
      name: "Chioma Okafor",
      email: "chioma.bakery@gmail.com",
      phone: "+234 803 123 4567",
      businessName: "Chioma's Premium Bakery",
      location: chiomasLocation
    };
    
    const quoteResponse = saveQuoteRequest(userData, topVendor.id, sizing);
    console.log(`   ✓ Quote ID: ${quoteResponse.quoteId}`);
    console.log(`   ✓ Status: ${quoteResponse.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`   ✓ Message: ${quoteResponse.message}`);
    
    console.log('\n COMPLETE WORKFLOW: ALL STEPS PASSED!');
    
  } else {
    console.log(`    ${vendorResult.message}`);
  }
  
} catch (error) {
  console.error('\n Workflow Failed:', error.message);
  console.error(error.stack);
}

// ============================================
// SUMMARY
// ============================================

console.log('\n\n========================================');
console.log('   TEST SUITE COMPLETE');
console.log('========================================');
console.log('\n Test Coverage:');
console.log('   ✓ Standard calculations (3 test cases)');
console.log('   ✓ Edge case validation (7 stress tests)');
console.log('   ✓ Location guards (5 location tests)');
console.log('   ✓ Integrated workflow (1 end-to-end test)');
console.log('\n Files created: quote_requests.json');
console.log('\n');
// ============================================
// PART 5: FINAL ADMIN REPORT
// ============================================

console.log('\n\n========================================');
console.log('   PART 5: FINAL ADMIN REPORT');
console.log('   (Analytics Engine Output)');
console.log('========================================\n');

try {
  const analytics = getSystemAnalytics();

  if (!analytics.success) {
    // Graceful empty/missing file handling
    console.log('WARNING - ANALYTICS STATUS: No Data Available');
    console.log('   Reason: ' + analytics.message);
    console.log('\n   This is expected if no quotes have been submitted yet.');
  } else {
    console.log('SUNFI PLATFORM -- ADMIN ANALYTICS DASHBOARD');
    console.log('   ' + '-'.repeat(44));
    console.log('   ' + analytics.message);
    console.log('   ' + '-'.repeat(44));

    const d = analytics.data;

    console.log('\n   QUOTE REQUESTS');
    console.log('      Total Quotes Submitted : ' + d.totalQuotes);

    console.log('\n   PORTFOLIO VALUE');
    console.log('      Total Value of All Quotes : ' + formatNaira(d.totalValue));

    console.log('\n   LOCATION INSIGHTS');
    console.log('      Most Active Location : ' + d.popularLocation + ' (' + d.popularLocationCount + (d.popularLocationCount > 1 ? ' quotes' : ' quote') + ')');

    if (Object.keys(d.locationBreakdown).length > 1) {
      console.log('\n      Full Location Breakdown:');
      Object.entries(d.locationBreakdown)
        .sort(([, a], [, b]) => b - a)
        .forEach(([location, count]) => {
          const bar = '#'.repeat(count);
          console.log('         ' + location.padEnd(25) + ' ' + bar + ' (' + count + ')');
        });
    }

    console.log('\n   SYSTEM SIZING');
    console.log('      Average System Size Requested : ' + d.averageSystemSizeKW + ' kW');

    console.log('\n   ' + '-'.repeat(44));
    console.log('   Admin report generated successfully.');
  }

} catch (error) {
  console.error('Analytics Engine Error:', error.message);
}

console.log('\n========================================');
console.log('   ALL TESTS + ADMIN REPORT COMPLETE');
console.log('========================================\n');