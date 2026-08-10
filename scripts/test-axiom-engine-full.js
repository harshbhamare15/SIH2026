const crypto = require('crypto');
const fetch = globalThis.fetch;

async function runComprehensiveAxiomAudit() {
  console.log('================================================================');
  console.log('           AXIOM CRYPTOGRAPHIC ENGINE AUDIT SUITE               ');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName) {
    totalTests++;
    if (condition) {
      console.log(`  [PASS] Test ${totalTests}: ${testName}`);
      passedTests++;
    } else {
      console.error(`  [FAIL] Test ${totalTests}: ${testName}`);
      throw new Error(`Assertion failed in: ${testName}`);
    }
  }

  // --- 1. DIRECT CRYPTOGRAPHIC UNIT TESTS ---
  console.log('--- Phase 1: Cryptographic Engine Unit Tests ---');

  const { encryptApplication, decryptApplication, isTenderDeadlinePassed } = require('../src/lib/axiom-crypto.ts');

  const samplePayload = {
    applicationId: 'APP-TEST-9901',
    tenderId: 'TND-TEST-001',
    applicant: {
      fullName: 'Vikramaditya Infrastructure Corp',
      email: 'contact@vikramaditya.in',
      orgName: 'Vikramaditya Infra Group',
      pan: 'AAAAA1111A',
      gst: '24AAAAA1111A1Z1',
      city: 'Ahmedabad',
      state: 'Gujarat',
      deviceFingerprint: 'dfp_hardware_gpu_sha256_audit_981'
    },
    bidDetails: {
      bidAmount: '₹ 45.50 Crores',
      bidAmountNumeric: 45.5,
      technicalProposal: 'Full architectural and EPC structural engineering compliance.',
      documentsAttached: ['GST_CERT', 'PAN_CARD', 'ISO_9001'],
      submissionNonce: crypto.randomBytes(16).toString('hex'),
      submittedAt: new Date().toISOString()
    }
  };

  // Test 1: Encryption and Dual-Key Generation
  const encryptedPkg = encryptApplication(samplePayload.applicationId, samplePayload.tenderId, samplePayload);
  assert(encryptedPkg.encryptedPayload && encryptedPkg.encryptedPayload.length > 0, 'Generates non-empty AES-256-GCM ciphertext');
  assert(encryptedPkg.dbKeyShare && encryptedPkg.dbKeyShare.length === 64, 'Generates valid 256-bit (64 hex chars) DB Key Share (Key 1)');
  assert(encryptedPkg.networkKeyShare && encryptedPkg.networkKeyShare.length === 64, 'Generates valid 256-bit (64 hex chars) Network Vault Key Share (Key 2)');
  assert(encryptedPkg.dbKeyShare !== encryptedPkg.networkKeyShare, 'Key Share 1 and Key Share 2 are mathematically distinct (XOR Secret Sharing)');

  // Test 2: Dual-Key Decryption Correctness
  const decryptedPayload = decryptApplication(
    encryptedPkg.encryptedPayload,
    encryptedPkg.iv,
    encryptedPkg.authTag,
    encryptedPkg.dbKeyShare,
    encryptedPkg.networkKeyShare
  );
  assert(decryptedPayload.applicant.fullName === samplePayload.applicant.fullName, 'Decrypted applicant name matches exactly');
  assert(decryptedPayload.applicant.pan === samplePayload.applicant.pan, 'Decrypted PAN matches exactly');
  assert(decryptedPayload.bidDetails.bidAmount === samplePayload.bidDetails.bidAmount, 'Decrypted quoted bid amount matches exactly');
  assert(decryptedPayload.applicant.deviceFingerprint === samplePayload.applicant.deviceFingerprint, 'Decrypted device fingerprint matches exactly');

  // Test 3: Zero-Knowledge / Incomplete Key Rejection
  let singleKeyFailed = false;
  try {
    const wrongKey = crypto.randomBytes(32).toString('hex');
    decryptApplication(
      encryptedPkg.encryptedPayload,
      encryptedPkg.iv,
      encryptedPkg.authTag,
      encryptedPkg.dbKeyShare,
      wrongKey // Incomplete / corrupted network key
    );
  } catch (e) {
    singleKeyFailed = true;
  }
  assert(singleKeyFailed, 'Decryption strictly FAILS if Network Key is missing or invalid (Zero-Knowledge Guarantee)');

  // Test 4: Tamper Resistance (Corrupted Ciphertext)
  let tamperFailed = false;
  try {
    const corruptedCiphertext = Buffer.from(encryptedPkg.encryptedPayload, 'base64');
    corruptedCiphertext[5] ^= 0xFF; // Flip bits in ciphertext
    decryptApplication(
      corruptedCiphertext.toString('base64'),
      encryptedPkg.iv,
      encryptedPkg.authTag,
      encryptedPkg.dbKeyShare,
      encryptedPkg.networkKeyShare
    );
  } catch (e) {
    tamperFailed = true;
  }
  assert(tamperFailed, 'Authenticated GCM AuthTag rejects tampered or modified ciphertext');

  // --- 2. LIVE BACKEND API & DATABASE INTEGRATION TESTS ---
  console.log('\n--- Phase 2: Live Backend API & Database Storage Tests ---');

  // Fetch or create available tender
  let activeTender = null;
  const tendersRes = await fetch('http://localhost:3000/api/tenders');
  const tendersData = await tendersRes.json();

  if (tendersRes.ok && tendersData.tenders && tendersData.tenders.length > 0) {
    activeTender = tendersData.tenders[0];
  } else {
    // Auto-create tender for test
    const createTenderRes = await fetch('http://localhost:3000/api/tenders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'TND-AXIOM-AUDIT-001',
        title: 'National Expressway Corridor EPC Procurement',
        client: 'Ministry of Road Transport & Highways',
        location: 'Gujarat',
        value: '₹ 150 Crores',
        closingDate: '01d : 00h : 00m : 00s',
        matchType: 'High Match'
      })
    });
    const createData = await createTenderRes.json();
    activeTender = createData.tender;
  }

  assert(activeTender && activeTender.id, 'MySQL database active tender loaded/registered');
  console.log(`  Testing with Active Tender: [ID: ${activeTender.id}] "${activeTender.title}"`);

  // Test 5: Submit Application via API
  const apiSubmitRes = await fetch('http://localhost:3000/api/applications/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tenderId: activeTender.id,
      applicant: {
        userId: 99,
        fullName: 'Audit Enterprise Contractor',
        email: 'audit@axiom.gov.in',
        mobile: '9988776655',
        orgName: 'National Highways & Metro Infra Ltd',
        pan: 'AUDIT1234K',
        gst: '24AUDIT1234K1Z5',
        city: 'Vadodara',
        state: 'Gujarat',
        walletAddress: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
        deviceFingerprint: 'dfp_hardware_audit_test_sha256_node_99'
      },
      bidDetails: {
        bidAmount: '₹ 8.75 Crores',
        bidAmountNumeric: 8.75,
        technicalProposal: 'Verified structural EPC execution package with ISO-9001 compliance.',
        documentsAttached: ['GST_CERT', 'PAN_CARD', 'BID_SECURITY']
      }
    })
  });
  const apiSubmitData = await apiSubmitRes.json();
  assert(apiSubmitRes.ok && apiSubmitData.success, 'Application submitted & encrypted successfully via POST /api/applications/submit');
  assert(apiSubmitData.applicationId && apiSubmitData.applicationId.startsWith('APP-'), 'Generated formatted Application Reference ID');
  assert(apiSubmitData.keyEscrow.dbKeyShareBound && apiSubmitData.keyEscrow.networkKeyShareBound, 'Key 1 stored in MySQL DB and Key 2 stored in Network Vault');

  // Test 6: Pre-Deadline Secrecy Check (Admin sees count ONLY)
  const preDeadlineRes = await fetch(`http://localhost:3000/api/applications?tenderId=${activeTender.id}`);
  const preDeadlineData = await preDeadlineRes.json();
  assert(preDeadlineRes.ok, 'GET /api/applications returns 200 OK');
  assert(typeof preDeadlineData.totalApplications === 'number' && preDeadlineData.totalApplications > 0, 'Total applications count is accurately reported to admin');
  assert(Array.isArray(preDeadlineData.applications) && preDeadlineData.applications.length === 0, 'Applications array is strictly EMPTY during active window (Zero data leaks)');

  // Test 7: Post-Deadline Dual-Key Unsealing
  const unsealRes = await fetch('http://localhost:3000/api/applications/unseal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenderId: activeTender.id, forceUnseal: true })
  });
  const unsealData = await unsealRes.json();
  assert(unsealRes.ok && unsealData.success, 'Axiom Engine executes dual-key unsealing via POST /api/applications/unseal');
  assert(unsealData.unsealedCount > 0, 'Successfully retrieved Key 1 from DB + Key 2 from Network Vault to decrypt applications');

  const unsealedRecord = unsealData.applications.find(a => a.applicationId === apiSubmitData.applicationId);
  assert(unsealedRecord !== undefined, 'Target submitted application is present in unsealed evaluation roster');
  assert(unsealedRecord.payload.applicant.fullName === 'Audit Enterprise Contractor', 'Decrypted applicant name matches');
  assert(unsealedRecord.payload.applicant.pan === 'AUDIT1234K', 'Decrypted PAN matches');
  assert(unsealedRecord.payload.bidDetails.bidAmount === '₹ 8.75 Crores', 'Decrypted financial bid matches');
  assert(unsealedRecord.payload.applicant.deviceFingerprint === 'dfp_hardware_audit_test_sha256_node_99', 'Decrypted device fingerprint matches');

  console.log('\n================================================================');
  console.log(`  ALL ${passedTests}/${totalTests} TESTS PASSED WITH 100% VERIFICATION SUCCESS!  `);
  console.log('================================================================\n');
}

runComprehensiveAxiomAudit().catch((err) => {
  console.error('\nAudit failed:', err);
  process.exit(1);
});
