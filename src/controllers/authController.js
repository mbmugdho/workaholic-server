import User from '../models/User.js'
import { generateToken } from '../utils/generateToken.js'
import { getFirebaseAdmin } from '../config/firebase-admin.js'

function normalizeRole(role) {
  if (role === 'worker' || role === 'buyer') return role
  return null
}

function signupBonusForRole(role) {
  if (role === 'buyer') return 50
  return 10 // worker default
}

export async function exchangeToken(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const idToken = header.startsWith('Bearer ') ? header.split(' ')[1] : null

    if (!idToken) {
      return res
        .status(401)
        .json({ success: false, message: 'Missing Firebase token' })
    }

    const admin = getFirebaseAdmin()
    if (!admin || !admin.apps?.length) {
      return res.status(500).json({
        success: false,
        message:
          'Firebase Admin is not configured on the server. Add Firebase service account env variables.',
      })
    }

    const decoded = await admin.auth().verifyIdToken(idToken)

    const email = (decoded.email || '').toLowerCase()
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: 'Firebase user email missing' })
    }

    const displayName = decoded.name || 'User'
    const photoURL = decoded.picture || ''

    const requestedRole = normalizeRole(req.body?.role)

    // Find or create user
    let user = await User.findOne({ email })

    if (!user) {
      const role = requestedRole || 'worker'
      const bonus = signupBonusForRole(role)

      user = await User.create({
        displayName,
        email,
        photoURL,
        role,
        coins: bonus,
        signupBonusApplied: true,
      })
    } else {
      // Keep profile updated (safe)
      const updates = {
        displayName: user.displayName || displayName,
        photoURL: user.photoURL || photoURL,
      }

      // If signup bonus never applied (edge case), apply now ONCE.
      if (!user.signupBonusApplied) {
        const roleToUse = user.role || requestedRole || 'worker'
        updates.role = user.role || roleToUse
        updates.coins = (user.coins || 0) + signupBonusForRole(roleToUse)
        updates.signupBonusApplied = true
      }

      user = await User.findOneAndUpdate({ email }, updates, { new: true })
    }

    const token = generateToken({
      email: user.email,
      role: user.role,
      uid: decoded.uid,
    })

    return res.json({
      success: true,
      token,
      user: {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: user.role,
        coins: user.coins,
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function me(req, res, next) {
  try {
    const email = req.user?.email
    if (!email)
      return res.status(401).json({ success: false, message: 'Unauthorized' })

    const user = await User.findOne({ email }).select(
      'email displayName photoURL role coins'
    )
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' })

    return res.json({ success: true, user })
  } catch (err) {
    next(err)
  }
}
