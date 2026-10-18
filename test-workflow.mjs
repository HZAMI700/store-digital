// test-workflow.mjs - End-to-end automated verification for Velto Digital Store
// Includes: Server-Side Auth, IDOR Protection, Admin Route Hardening, Customer Orders, Inventory & Delivery

async function runTests() {
  console.log('====================================================');
  console.log('STARTING VELTO DIGITAL STORE FULL AUDIT & TEST SUITE');
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

  // 1. SECURITY & AUTHENTICATION ENFORCEMENT
  console.log('--- Step 1: Testing Security Boundaries & Admin Access Control ---');

  // 1a. Unauthenticated access to /api/admin/orders must be blocked (401)
  const unauthAdminRes = await fetch(`${BASE_URL}/api/admin/orders`);
  assert(unauthAdminRes.status === 401, 'Unauthenticated GET /api/admin/orders blocked with 401');

  // 1b. Unauthenticated access to /api/orders without query params must be blocked (401 IDOR fix)
  const unauthOrdersDumpRes = await fetch(`${BASE_URL}/api/orders`);
  assert(unauthOrdersDumpRes.status === 401, 'Public IDOR order dumping blocked on GET /api/orders (401)');

  // 1c. Invalid login credentials rejected
  const badLoginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'wrongpassword' }),
  });
  assert(badLoginRes.status === 401, 'Invalid admin login credentials rejected with 401');

  // 1d. Valid login credentials accepted
  const validLoginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'yassine700', password: 'yassine700' }),
  });
  assert(validLoginRes.status === 200, 'Valid admin credentials accepted with 200');
  const loginData = await validLoginRes.json();
  assert(loginData.token !== undefined, 'Admin auth token returned');
  const adminToken = loginData.token;
  const adminHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`,
  };

  // 1e. Admin /api/admin/me session validation
  const meRes = await fetch(`${BASE_URL}/api/admin/me`, { headers: adminHeaders });
  const meData = await meRes.json();
  assert(meRes.status === 200 && meData.authenticated === true && meData.username === 'yassine700', 'GET /api/admin/me confirms active admin session');

  // 1f. Authenticated admin orders access
  const initialAdminRes = await fetch(`${BASE_URL}/api/admin/orders`, { headers: adminHeaders });
  const initialAdminData = await initialAdminRes.json();
  assert(initialAdminRes.status === 200, 'Authenticated admin orders endpoint responds 200');
  assert(initialAdminData.stats !== undefined, 'Stats object is provided');
  assert(typeof initialAdminData.stats.totalOrderValue === 'number', 'Total order value is computed');

  // 2. SERVER-SIDE ORDER VALIDATION & SAFETY
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
      customerWhatsapp: '+216 50 022 767',
      countryCode: '+216',
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
      customerWhatsapp: '+216 50 022 767',
      countryCode: '+216',
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
      countryCode: '+216',
      consentGiven: true,
    }),
  });
  assert(badPhoneRes.status === 400, 'Rejects order with invalid phone number (400)');

  // 3. SUBMITTING VALID CUSTOMER ORDER
  console.log('\n--- Step 3: Submitting Valid Customer Order Request ---');
  const uniqueEmail = `velto.customer.${Date.now()}@gmail.com`;
  const validOrderPayload = {
    productId: 'prod-gemini-advanced',
    productName: 'Google Gemini Pro (1 Year)',
    quantity: 1,
    customerName: 'Karim Ben Ali',
    customerEmail: uniqueEmail,
    customerWhatsapp: '+216 50 022 767',
    countryCode: '+216',
    customerMessage: 'Gemini 3.8 and Gemini 4 Argon access verification.',
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
  assert(submitData.order.totalAmount === 30, 'Server accurately calculated price snapshot (30 TND for Gemini Pro 1Y)');
  assert(submitData.order.internalNotes === undefined, 'Internal notes strictly hidden from customer response');

  const createdOrder = submitData.order;

  // 4. DUPLICATE SUBMISSION DETECTION
  console.log('\n--- Step 4: Testing Duplicate Order Protection ---');
  const dupRes = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validOrderPayload),
  });
  assert(dupRes.status === 429, 'Duplicate submission blocked within cooldown window (429)');

  // 5. SECURE GUEST ORDER LOOKUP
  console.log('\n--- Step 5: Testing Dual-Authorization Guest Order Lookup ---');

  // 5a. Unauthorized lookup (wrong email)
  const badLookupRes = await fetch(`${BASE_URL}/api/lookup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderReference: createdOrder.orderReference,
      email: 'unauthorized@attacker.com',
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
  assert(authLookupData.order.customerName === 'Karim Ben Ali', 'Customer name matches');
  assert(authLookupData.order.internalNotes === undefined, 'Private admin notes omitted from customer lookup');

  // 6. ADMIN DASHBOARD & PROCESSING
  console.log('\n--- Step 6: Testing Admin Dashboard Actions with Authenticated Token ---');

  // 6a. Admin fetches orders, new order appears immediately
  const adminOrdersRes = await fetch(`${BASE_URL}/api/admin/orders`, { headers: adminHeaders });
  const adminOrdersData = await adminOrdersRes.json();
  const foundInAdmin = adminOrdersData.orders.find((o) => o.orderReference === createdOrder.orderReference);
  assert(foundInAdmin !== undefined, 'Newly submitted order immediately visible in admin dashboard');
  assert(foundInAdmin.status === 'new_order', 'Order is in "new_order" state in dashboard');

  // 6b. Admin records WhatsApp contact attempt
  const contactRes = await fetch(`${BASE_URL}/api/admin/orders/${createdOrder.id}/contact`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      method: 'whatsapp',
      timestamp: new Date().toISOString(),
      note: 'Admin initiated WhatsApp chat (+216 50 022 767) with customer for confirmation.',
    }),
  });
  const contactData = await contactRes.json();
  assert(contactRes.status === 200, 'Admin WhatsApp contact attempt recorded in order history');
  assert(contactData.order.contactMethod === 'whatsapp', 'Order contactMethod updated to "whatsapp"');
  assert(contactData.order.status === 'contacting_customer', 'Order automatically advanced to "contacting_customer"');

  // 6c. Admin saves private internal note
  const notesRes = await fetch(`${BASE_URL}/api/admin/orders/${createdOrder.id}/notes`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      notes: 'Customer verified on WhatsApp +21650022767. Payment confirmed.',
    }),
  });
  const notesData = await notesRes.json();
  assert(notesRes.status === 200, 'Admin internal note saved successfully');
  assert(notesData.order.internalNotes.includes('Customer verified on WhatsApp'), 'Internal note content preserved');

  // 6d. Admin updates status to "payment_confirmed"
  const statusRes = await fetch(`${BASE_URL}/api/admin/orders/${createdOrder.id}/status`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ status: 'payment_confirmed' }),
  });
  const statusData = await statusRes.json();
  assert(statusData.order.status === 'payment_confirmed', 'Status updated to "payment_confirmed"');

  // 7. INVENTORY ALLOCATION & DELIVERY
  console.log('\n--- Step 7: Testing Single-Use Inventory Assignment & Safe Delivery ---');

  // Create test inventory item in vault
  const createInvRes = await fetch(`${BASE_URL}/api/admin/inventory`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      productId: 'prod-gemini-advanced',
      productName: 'Google Gemini Pro (1 Year)',
      accountData: `gemini_user_${Date.now()}@google.com | Secure_${Date.now()} | Gemini 3.8 & 4 Argon`,
      adminNotes: 'Automated test vault batch for Gemini 1 Year',
    }),
  });
  const createInvData = await createInvRes.json();
  assert(createInvRes.status === 201, 'Inventory item successfully added to vault (201)');
  const testInvId = createInvData.item.id;

  // Assign available account to this order
  const assignRes = await fetch(`${BASE_URL}/api/admin/orders/${createdOrder.id}/assign`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ inventoryId: testInvId }),
  });
  const assignData = await assignRes.json();
  assert(assignRes.status === 200, `Inventory item ${testInvId} assigned to order`);
  assert(assignData.order.assignedInventoryId === testInvId, 'Order holds assigned inventory ID');

  // Reveal credentials
  const revealRes = await fetch(`${BASE_URL}/api/admin/orders/${createdOrder.id}/reveal`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ revealed: true }),
  });
  assert(revealRes.status === 200, 'Admin explicitly revealed credentials');

  // Customer now sees delivered credentials safely
  const postRevealLookup = await fetch(`${BASE_URL}/api/lookup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderReference: createdOrder.orderReference,
      email: uniqueEmail,
    }),
  });
  const postRevealData = await postRevealLookup.json();
  assert(postRevealData.order.deliveredCredentials !== null, 'Delivered credentials accessible to authorized customer');
  assert(postRevealData.order.internalNotes === undefined, 'Private admin notes remain hidden from customer');

  // 8. LOGOUT TEST
  console.log('\n--- Step 8: Testing Admin Logout ---');
  const logoutRes = await fetch(`${BASE_URL}/api/admin/logout`, {
    method: 'POST',
    headers: adminHeaders,
  });
  assert(logoutRes.status === 200, 'Admin logout succeeds (200)');

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('====================================================');

  if (passedTests === totalTests) {
    console.log('ALL WORKFLOW & SECURITY CRITERIA VERIFIED SUCCESSFULLY! ✓');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
