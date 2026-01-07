import admin from 'firebase-admin'

export function getFirebaseAdmin() {
  // Already initialized?
  if (admin.apps?.length) return admin

  // Option A: One JSON env var
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (json) {
    const serviceAccount = JSON.parse(json)

    // Fix private_key newlines if needed
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(
        /\\n/g,
        '\n'
      )
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })

    return admin
  }

  // Option B: Separate env vars
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  let privateKey = process.env.FIREBASE_PRIVATE_KEY

  if (projectId && clientEmail && privateKey) {
    privateKey = privateKey.replace(/\\n/g, '\n')

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    })

    return admin
  }

  // Not configured
  return null
}
