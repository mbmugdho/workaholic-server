import jwt from 'jsonwebtoken'

export function generateToken(payload, expiresIn = '7d') {
  const secret = process.env.JWT_SECRET
  if (!secret)
    throw new Error('JWT_SECRET is missing in environment variables.')

  return jwt.sign(payload, secret, { expiresIn })
}
