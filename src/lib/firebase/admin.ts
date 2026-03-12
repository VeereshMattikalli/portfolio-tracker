import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (serviceAccountJson) {
      // Parse the JSON string
      const serviceAccount = JSON.parse(serviceAccountJson);
      
      // Fix potential unescaped newline characters in the private key specifically for Vercel/Env loaders
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('Firebase Admin SDK initialized successfully.');
    } else {
      console.warn('FIREBASE_SERVICE_ACCOUNT_KEY is not defined. Firebase Admin SDK not initialized.');
    }
  } catch (error) {
    console.error('Firebase Admin SDK initialization error', error);
  }
}

const db = (admin.apps.length > 0 ? admin.firestore() : null) as admin.firestore.Firestore;

export { admin, db };
