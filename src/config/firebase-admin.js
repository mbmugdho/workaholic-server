import admin from 'firebase-admin'

let initialized = false

export function getFirebaseAdmin() {
  if (initialized) return admin

  // Option A: one JSON env var
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (json) {
    const serviceAccount = JSON.parse(json)
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
    initialized = true
    return admin
  }

  // Option B: individual env vars
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  let privateKey = process.env.FIREBASE_PRIVATE_KEY

  if (projectId && clientEmail && privateKey) {
    // Render/CI often stores \n escaped newlines
    privateKey = privateKey.replace(/\\n/g, '\n')
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    })
    initialized = true
    return admin
  }

  // Not configured yet (ok for Phase 1)
  console.warn(' Firebase Admin not configured. Skipping initialization.')
  initialized = true
  return admin
}
