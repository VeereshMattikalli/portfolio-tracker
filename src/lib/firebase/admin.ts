import * as admin from 'firebase-admin';

let initialized = false;

export function getDb(): admin.firestore.Firestore | null {
  if (!admin.apps.length && !initialized) {
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
        initialized = true;
      } else {
        console.warn('FIREBASE_SERVICE_ACCOUNT_KEY is not defined. Firebase Admin SDK not initialized.');
        initialized = true; // Mark as attempted to avoid repeated logs
        return null;
      }
    } catch (error) {
      console.error('Firebase Admin SDK initialization error', error);
      initialized = true;
      return null;
    }
  }

  // Return null if not initialized, otherwise return firestore
  if (!admin.apps.length) {
    return null;
  }
  
  try {
    return admin.firestore();
  } catch (error) {
    console.error('Error accessing Firestore:', error);
    return null;
  }
}
