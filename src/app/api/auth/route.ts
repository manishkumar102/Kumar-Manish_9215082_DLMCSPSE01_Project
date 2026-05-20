import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hash, compare } from 'bcryptjs'

const SALT_ROUNDS = 12

/**
 * Check if a stored password looks like a plain-text password (legacy).
 * bcrypt hashes always start with '$2a$' or '$2b$'.
 */
function isLegacyPassword(password: string): boolean {
  return !password.startsWith('$2')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, name, email, password, role, googleId, avatar } = body

    if (action === 'register') {
      // ── Register ──
      if (!name || !email || !password) {
        return NextResponse.json(
          { error: 'Name, email, and password are required' },
          { status: 400 }
        )
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        )
      }

      // Validate password length
      if (password.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters' },
          { status: 400 }
        )
      }

      // Validate name length
      if (name.length < 2 || name.length > 100) {
        return NextResponse.json(
          { error: 'Name must be between 2 and 100 characters' },
          { status: 400 }
        )
      }

      const existingUser = await db.user.findUnique({ where: { email } })
      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 409 }
        )
      }

      // Hash password with bcrypt
      const hashedPassword = await hash(password, SALT_ROUNDS)

      const user = await db.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role || 'client',
        },
      })

      const { password: _, ...safeUser } = user
      return NextResponse.json({ user: safeUser }, { status: 201 })
    }

    if (action === 'login') {
      // ── Login ──
      if (!email || !password) {
        return NextResponse.json(
          { error: 'Email and password are required' },
          { status: 400 }
        )
      }

      const user = await db.user.findUnique({ where: { email } })
      if (!user) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }

      // Support both legacy plain-text passwords and bcrypt hashed passwords
      let passwordValid: boolean
      if (isLegacyPassword(user.password)) {
        // Legacy: compare plain text
        passwordValid = user.password === password
        // Transparently upgrade to bcrypt on successful login
        if (passwordValid) {
          const hashed = await hash(password, SALT_ROUNDS)
          await db.user.update({ where: { id: user.id }, data: { password: hashed } })
        }
      } else {
        // Modern: compare bcrypt hash
        passwordValid = await compare(password, user.password)
      }

      if (!passwordValid) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }

      const { password: _, ...safeUser } = user
      return NextResponse.json({ user: safeUser })
    }

    if (action === 'google-login') {
      // ── Google Sign-In / Auto-Register ──
      if (!email || !googleId) {
        return NextResponse.json(
          { error: 'Google account information is missing' },
          { status: 400 }
        )
      }

      // Check if user already exists
      let isNew = false
      let user = await db.user.findUnique({ where: { email } })

      if (!user) {
        isNew = true
        // Auto-create account for new Google users
        // Use a random bcrypt hash as placeholder (Google users don't use passwords)
        const randomHash = await hash('google_oauth_' + googleId + Date.now(), SALT_ROUNDS)

        user = await db.user.create({
          data: {
            name: name || email.split('@')[0],
            email,
            password: randomHash,
            role: role || 'client',
            avatar: avatar || null,
            verified: true, // Google accounts are pre-verified
          },
        })
      }

      const { password: _, ...safeUser } = user
      return NextResponse.json({ user: safeUser, isNew })
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "login", "register", or "google-login".' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[AUTH_POST]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
