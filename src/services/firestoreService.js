import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db = null;

export function initializeFirestore() {
  if (db) return db;

  try {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 
                                join(__dirname, '..', '..', 'firebase-service-account.json');

    if (!fs.existsSync(serviceAccountPath)) {
      throw new Error(`Firebase service account file not found: ${serviceAccountPath}`);
    }

    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    db = admin.firestore();
    return db;
  } catch (error) {
    console.error('Firestore initialization failed:', error.message);
    throw error;
  }
}

export async function getODRequestsByDate(dateString) {
  try {
    const firestore = initializeFirestore();
    const snapshot = await firestore
      .collection('od_requests')
      .where('toDate', '>=', dateString)
      .get();

    if (snapshot.empty) return [];

    const requests = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      // Filter in-memory for fromDate <= dateString
      // Also ensure fromDate exists, otherwise assume it's a single day event matching toDate
      const fromDate = data.fromDate || data.toDate; 
      
      if (fromDate <= dateString) {
        requests.push({
          id: doc.id,
          studentId: data.studentId,
          fromDate: fromDate,
          toDate: data.toDate,
          reason: data.reason,
          type: data.type,
          status: data.status,
          url: data.url,
          approvalChain: data.approvalChain || []
        });
      }
    });

    return requests;
  } catch (error) {
    console.error('Error fetching OD requests:', error.message);
    throw new Error(`Failed to fetch OD requests: ${error.message}`);
  }
}

export async function getStudentById(studentId) {
  try {
    if (!studentId) return null;
    
    const firestore = initializeFirestore();
    const doc = await firestore.collection('students').doc(studentId).get();

    if (!doc.exists) return null;

    const data = doc.data();
    return {
      // Removing ID to strictly match legacy schema as requested
      name: data.name,
      collegeEmail: data.collegeEmail,
      department: data.department,
      section: data.section,
      gender: data.gender
    };
  } catch (error) {
    console.error(`Error fetching student ${studentId}:`, error.message);
    return null;
  }
}

export async function getAdvisors(department, section) {
  try {
    const firestore = initializeFirestore();
    const docId = `${department}_${section}`;
    const doc = await firestore.collection('advisor_mapping').doc(docId).get();

    if (!doc.exists) return null;

    const data = doc.data();
    return {
      // Removing ID to strictly match legacy schema as requested
      department: data.department,
      section: data.section,
      advisorEmails: data.advisorEmails || []
    };
  } catch (error) {
    console.error(`Error fetching advisors for ${department} - ${section}:`, error.message);
    return null;
  }
}

export async function getFacultyByEmail(email) {
  try {
    if (!email) return null;
    
    const firestore = initializeFirestore();
    const snapshot = await firestore
      .collection('faculty')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const matchedDoc = snapshot.docs[0];
    const data = matchedDoc.data();

    return {
      name: data.facultyName || "Faculty",
      phone: data.phone || "",
      department: data.department || "",
      active: data.active
    };
  } catch (error) {
    console.error(`Error fetching faculty for ${email}:`, error.message);
    return null;
  }
}

export async function checkFirestoreConnection() {
  try {
    const firestore = initializeFirestore();
    await firestore.collection('advisor_mapping').limit(1).get();
    return true;
  } catch (error) {
    return false;
  }
}

export async function getDepartmentRoles(department) {
  try {
    const firestore = initializeFirestore();
    // The collection is 'department_roles', and based on the user screenshot, 
    // the document ID seems to be the department name (e.g., 'CSE').
    // Let's assume the document ID is the department name for now.
    const doc = await firestore.collection('department_roles').doc(department).get();

    if (!doc.exists) return null;

    const data = doc.data();
    return {
      coordinatorEmails: data.coordinatorEmails || [],
      hodEmail: data.hodEmail || null
    };
  } catch (error) {
    console.error(`Error fetching roles for ${department}:`, error.message);
    return null;
  }
}
