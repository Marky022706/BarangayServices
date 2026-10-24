import pool from '../database/db';

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting End-to-End Backend & MySQL Integration Tests...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: any) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`, detail || '');
      failed++;
    }
  }

  try {
    // Test 1: Health check
    const healthRes = await fetch(`${BASE_URL}/health`).then(r => r.json());
    assert(healthRes.status === 'healthy', '1. Backend health check returns healthy status');

    // Test 2: Invalid Login
    const badLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'incorrectpassword' })
    });
    assert(badLoginRes.status === 401, '2. Invalid login returns HTTP 401 Unauthorized');

    // Test 3: Valid Staff Login
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'barangay2026' })
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200 && !!loginData.token, '3. Valid login returns JWT token and HTTP 200');
    const token = loginData.token;

    // Test 4: Auth Me
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const meData = await meRes.json();
    assert(meRes.status === 200 && meData.user?.username === 'admin', '4. GET /api/auth/me returns authenticated staff profile');

    // Test 5: Services from MySQL
    const servicesRes = await fetch(`${BASE_URL}/services`).then(r => r.json());
    assert(servicesRes.success === true && servicesRes.data?.length === 3, '5. GET /api/services returns 3 active services from MySQL');

    // Test 6: Create Application (Barangay Clearance)
    const appPayload = {
      documentType: 'clearance',
      personalInfo: {
        firstName: 'Juan',
        middleName: 'Protacio',
        lastName: 'Rizal',
        dateOfBirth: '1995-06-19',
        placeOfBirth: 'Calamba, Laguna',
        civilStatus: 'Single',
        contactNumber: '09171239999',
        email: 'juan.rizal@example.ph',
        houseStreet: 'Block 5 Lot 12 Kalayaan St.',
        purokSitio: 'Purok 3',
        barangay: 'Barangay San Isidro',
        cityMunicipality: 'Quezon City',
        province: 'Metro Manila'
      },
      details: {
        purpose: 'Local Employment Application'
      },
      payment: {
        method: 'pay_on_pickup',
        status: 'Pending',
        amountPaid: '₱100.00'
      }
    };

    const createRes = await fetch(`${BASE_URL}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appPayload)
    });
    const createData = await createRes.json();
    assert(
      createRes.status === 201 && !!createData.referenceNumber && createData.referenceNumber.startsWith('BRGY-'),
      '6. POST /api/applications generates unique reference number and persists record in MySQL',
      createData
    );

    const refNum = createData.referenceNumber;
    const appId = createData.data?.id;

    // Test 7: Direct MySQL DB Verification
    const [dbRows] = await pool.query<any[]>(
      'SELECT id, app_code, reference_number, first_name, last_name, status FROM applications WHERE reference_number = ?',
      [refNum]
    );
    assert(
      dbRows.length === 1 && dbRows[0].first_name === 'Juan' && dbRows[0].last_name === 'Rizal',
      '7. Direct MySQL query confirms record physically stored in `applications` table'
    );

    // Test 8: Public Tracking
    const trackRes = await fetch(`${BASE_URL}/applications/track/${encodeURIComponent(refNum)}`);
    const trackData = await trackRes.json();
    assert(
      trackRes.status === 200 && trackData.data?.referenceNumber === refNum && trackData.data?.status === 'Pending Review',
      '8. GET /api/applications/track/:ref returns live tracking data for the submitted application'
    );

    // Test 9: Move to Under Verification
    const verifyRes = await fetch(`${BASE_URL}/staff/applications/${appId}/verify`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ remarks: 'Purok coordinator validated residency in registry.' })
    });
    const verifyData = await verifyRes.json();
    assert(
      verifyRes.status === 200 && verifyData.data?.status === 'Under Verification',
      '9. PATCH /api/staff/applications/:id/verify transitions status to Under Verification'
    );

    // Test 10: Approve Application
    const approveRes = await fetch(`${BASE_URL}/staff/applications/${appId}/approve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ remarks: 'Clearance approved for printing.' })
    });
    const approveData = await approveRes.json();
    assert(
      approveRes.status === 200 && approveData.data?.status === 'Approved' && !!approveData.data?.controlNumber,
      '10. PATCH /api/staff/applications/:id/approve sets status to Approved and assigns Control Number',
      approveData.data?.controlNumber
    );

    // Test 11: Mark Ready for Claiming
    const readyRes = await fetch(`${BASE_URL}/staff/applications/${appId}/ready`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ remarks: 'Sealed document waiting at Window 2.' })
    });
    const readyData = await readyRes.json();
    assert(
      readyRes.status === 200 && readyData.data?.status === 'Ready for Claiming',
      '11. PATCH /api/staff/applications/:id/ready marks application Ready for Claiming'
    );

    // Test 12: Audit History Log
    const historyRes = await fetch(`${BASE_URL}/applications/${appId}/history`);
    const historyData = await historyRes.json();
    assert(
      historyRes.status === 200 && historyData.history?.length >= 4,
      '12. GET /api/applications/:id/history retrieves complete audit trail from `application_history` table'
    );

    // Test 13: Dashboard Statistics
    const statsRes = await fetch(`${BASE_URL}/dashboard/statistics`).then(r => r.json());
    assert(
      statsRes.success === true && statsRes.data?.totalApplications >= 1 && statsRes.data?.readyForClaiming >= 1,
      '13. GET /api/dashboard/statistics calculates real counts from MySQL database'
    );

    // Test 14: Reject workflow test with second application
    const app2Payload = {
      documentType: 'indigency',
      personalInfo: {
        firstName: 'Andres',
        lastName: 'Bonifacio',
        dateOfBirth: '1988-11-30',
        placeOfBirth: 'Tondo, Manila',
        civilStatus: 'Married',
        contactNumber: '09187771234',
        purokSitio: 'Purok 1',
        barangay: 'Barangay San Isidro',
        cityMunicipality: 'Quezon City',
        province: 'Metro Manila'
      },
      details: {
        purpose: 'Medical Assistance',
        assistanceType: 'Hospitalization Aid'
      },
      payment: {
        method: 'pay_on_pickup',
        status: 'Waived'
      }
    };

    const create2Res = await fetch(`${BASE_URL}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(app2Payload)
    }).then(r => r.json());

    const app2Id = create2Res.data?.id;

    const rejectRes = await fetch(`${BASE_URL}/staff/applications/${app2Id}/reject`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ reason: 'Discrepancy in purok residential records. Please visit office.' })
    });
    const rejectData = await rejectRes.json();
    assert(
      rejectRes.status === 200 && rejectData.data?.status === 'Rejected' && !!rejectData.data?.rejectionReason,
      '14. PATCH /api/staff/applications/:id/reject validates rejection reason and stores in database'
    );

  } catch (err) {
    console.error('Unhandled test exception:', err);
    failed++;
  } finally {
    console.log(`\n========================================`);
    console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);
    await pool.end();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
