// test-workflow.mjs - End-to-end automated verification for Manual Orders & Admin Contact

async function runTests() {
  console.log('====================================================');
  console.log('STARTING APEX DIGITAL STORE WORKFLOW VERIFICATION');
  console.log('====================================================\n');

  const BASE_URL = 'http://localhost:3000';
  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName) {
    totalTests++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`[FAIL] ${testName}`);
      process.exitCode = 1;
    }
  }

  // 1. TEST PRODUCT RETRIEVAL & PRICING
  console.log('--- Step 1: Testing Product Catalog & Admin Orders Initial State ---');
  const initialAdminRes = await fetch(`${BASE_URL}/api/admin/orders`);
  const initialAdminData = await initialAdminRes.json();
  assert(initialAdminRes.status === 200, 'Admin orders endpoint responds 200');
  assert(initialAdminData.stats !== undefined, 'Stats object is provided');
  assert(typeof initialAdminData.stats.totalOrderValue === 'number', 'Total order value is computed');

  // 2. TEST SUBMITTING INVALID ORDERS
  console.log('\n--- Step 2: Testing Server Validation & Duplicate Prevention ---');
  
  // 2a. Missing consent
  const noConsentRes = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: 'prod-netflix-4k',
      quantity: 1,
      customerName: 'Test User',
      customerEmail: 'test@example.com',
      customerWhatsapp: '+1 555 123 4567',
      countryCode: '+1',
      consentGiven: false,
    }),
  });
  assert(noConsentRes.status === 400, 'Rejects order when consent is missing (400)');

  // 2b. Invalid email
  const badEmailRes = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: 'prod-netflix-4k',
      quantity: 1,
      customerName: 'Test User',
      customerEmail: 'not-an-email',
      customerWhatsapp: '+1 555 123 4567',
      countryCode: '+1',
      consentGiven: true,
    }),
  });
  assert(badEmailRes.status === 400, 'Rejects order with invalid email format (400)');

  // 2c. Invalid phone
  const badPhoneRes = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: 'prod-netflix-4k',
      quantity: 1,
      customerName: 'Test User',
      customerEmail: 'test@example.com',
      customerWhatsapp: '12',
      countryCode: '+1',
      consentGiven: true,
    }),
  });
  assert(badPhoneRes.status === 400, 'Rejects order with invalid phone number (400)');

  // 3. TEST SUBMITTING VALID ORDER REQUEST
  console.log('\n--- Step 3: Submitting Valid Customer Order Request ---');
  const uniqueEmail = `sarah.jenkins.${Date.now()}@gmail.com`;
  const validOrderPayload = {
    productId: 'prod-netflix-4k',
    productName: 'Netflix Premium 4K UHD',
    quantity: 2,
    customerName: 'Sarah Jenkins',
    customerEmail: uniqueEmail,
    customerWhatsapp: '+1 415 889 2011',
    countryCode: '+1',
    customerMessage: 'Please set profile language to English. Thank you!',
    consentGiven: true,
  };

  const submitRes = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validOrderPayload),
  });

  const submitData = await submitRes.json();
  assert(submitRes.status === 201, 'Valid order submitted successfully (201)');
  assert(submitData.order.orderReference.startsWith('ORD-'), 'Unique order reference generated');
  assert(submitData.order.totalAmount === submitData.order.unitPrice * 2, 'Server accurately calculated price snapshot');
  assert(submitData.order.internalNotes === undefined, 'Internal notes strictly hidden from customer response');

  const createdOrder = submitData.order;

  // 4. TEST DUPLICATE SUBMISSION DETECTION
  console.log('\n--- Step 4: Testing Duplicate Order Protection ---');
  const dupRes = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validOrderPayload),
  });
  assert(dupRes.status === 429, 'Duplicate submission blocked within cooldown window (429)');

  // 5. TEST SECURE GUEST ORDER LOOKUP
  console.log('\n--- Step 5: Testing Dual-Authorization Guest Order Lookup ---');
  
  // 5a. Unauthorized lookup (wrong email)
  const badLookupRes = await fetch(`${BASE_URL}/api/lookup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderReference: createdOrder.orderReference,
      email: 'hacker@target.org',
    }),
  });
  assert(badLookupRes.status === 403, 'Unauthorized email blocked from viewing order (403)');

  // 5b. Authorized lookup (matching email)
  const authLookupRes = await fetch(`${BASE_URL}/api/lookup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderReference: createdOrder.orderReference,
      email: uniqueEmail,
    }),
  });
  const authLookupData = await authLookupRes.json();
  assert(authLookupRes.status === 200, 'Authorized customer views own order (200)');
  assert(authLookupData.order.customerName === 'Sarah Jenkins', 'Customer name matches');
  assert(authLookupData.order.internalNotes === undefined, 'Private admin notes omitted from customer lookup');

  // 6. TEST ADMIN DASHBOARD & QUICK CONTACT ACTIONS
  console.log('\n--- Step 6: Testing Admin Dashboard Actions & Contact Tracking ---');
  
  // 6a. Admin fetches orders, new order appears immediately
  const adminRes = await fetch(`${BASE_URL}/api/admin/orders`);
  const adminData = await adminRes.json();
  const foundInAdmin = adminData.orders.find((o) => o.orderReference === createdOrder.orderReference);
  assert(foundInAdmin !== undefined, 'Newly submitted order immediately visible in admin dashboard');
  assert(foundInAdmin.status === 'new_order', 'Order is in "new_order" state in dashboard');

  // 6b. Admin records WhatsApp contact attempt
  const contactRes = await fetch(`${BASE_URL}/api/admin/orders/${createdOrder.id}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      method: 'whatsapp',
      timestamp: new Date().toISOString(),
      note: 'Admin initiated WhatsApp chat with customer to confirm Netflix profile details.',
    }),
  });
  const contactData = await contactRes.json();
  assert(contactRes.status === 200, 'Admin WhatsApp contact attempt recorded in order history');
  assert(contactData.order.contactMethod === 'whatsapp', 'Order contactMethod updated to "whatsapp"');
  assert(contactData.order.status === 'contacting_customer', 'Order automatically advanced to "contacting_customer"');

  // 6c. Admin saves private internal note
  const notesRes = await fetch(`${BASE_URL}/api/admin/orders/${createdOrder.id}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      notes: 'Customer confirmed via WhatsApp. Arranging PayPal payment. Profile PIN 9911 agreed.',
    }),
  });
  const notesData = await notesRes.json();
  assert(notesRes.status === 200, 'Admin internal note saved successfully');
  assert(notesData.order.internalNotes.includes('Customer confirmed via WhatsApp'), 'Internal note content preserved');

  // 6d. Admin updates status to "payment_confirmed"
  const statusRes = await fetch(`${BASE_URL}/api/admin/orders/${createdOrder.id}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'payment_confirmed' }),
  });
  const statusData = await statusRes.json();
  assert(statusData.order.status === 'payment_confirmed', 'Status updated to "payment_confirmed"');

  // 7. TEST INVENTORY ALLOCATION & SAFE CREDENTIAL REVEAL
  console.log('\n--- Step 7: Testing Single-Use Inventory Assignment & Safe Delivery ---');
  
  // Create a dedicated test inventory item in vault
  const createInvRes = await fetch(`${BASE_URL}/api/admin/inventory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: 'prod-netflix-4k',
      productName: 'Netflix Premium 4K UHD',
      accountData: `netflix_user_${Date.now()}@stream.io | Pass_${Date.now()} | Profile 1 [PIN 9911]`,
      adminNotes: 'Automated test vault batch',
    }),
  });
  const createInvData = await createInvRes.json();
  const testInvId = createInvData.item.id;

  // Assign available account to this order
  const assignRes = await fetch(`${BASE_URL}/api/admin/orders/${createdOrder.id}/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inventoryId: testInvId }),
  });
  const assignData = await assignRes.json();
  assert(assignRes.status === 200, `Inventory item ${testInvId} assigned to order`);
  assert(assignData.order.assignedInventoryId === testInvId, 'Order holds assigned inventory ID');

  // Attempting to re-assign same account to another order MUST FAIL
  const collisionRes = await fetch(`${BASE_URL}/api/admin/orders/ord-102/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inventoryId: testInvId }),
  });
  assert(collisionRes.status === 400, 'Collision prevention blocks re-assigning single-use account to another customer (400)');

  // Verify credentials are NOT revealed to customer before admin approval
  const preRevealLookup = await fetch(`${BASE_URL}/api/lookup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderReference: createdOrder.orderReference,
      email: uniqueEmail,
    }),
  });
  const preRevealData = await preRevealLookup.json();
  assert(preRevealData.order.deliveredCredentials === null, 'Credentials hidden from customer before explicit admin approval');

  // Admin approves and reveals credentials to customer
  const revealRes = await fetch(`${BASE_URL}/api/admin/orders/${createdOrder.id}/reveal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ revealed: true }),
  });
  assert(revealRes.status === 200, 'Admin explicitly revealed credentials');

  // Customer now sees their delivered credentials safely
  const postRevealLookup = await fetch(`${BASE_URL}/api/lookup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderReference: createdOrder.orderReference,
      email: uniqueEmail,
    }),
  });
  const postRevealData = await postRevealLookup.json();
  assert(postRevealData.order.deliveredCredentials !== null, 'Delivered credentials now accessible to authorized customer');
  assert(postRevealData.order.internalNotes === undefined, 'Private admin notes remain hidden from customer');

  // 8. FINAL STATS VERIFICATION
  console.log('\n--- Step 8: Verifying Updated Admin Statistics ---');
  const finalAdminRes = await fetch(`${BASE_URL}/api/admin/orders`);
  const finalAdminData = await finalAdminRes.json();
  assert(finalAdminData.stats.completed >= 1, 'Completed orders counter updated in statistics');

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('====================================================');

  if (passedTests === totalTests) {
    console.log('ALL WORKFLOW CRITERIA VERIFIED SUCCESSFULLY! ✓');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
