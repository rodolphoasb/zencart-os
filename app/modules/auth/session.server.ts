import { createCookieSessionStorage } from '@remix-run/node'

export const authSessionStorage = createCookieSessionStorage({
  cookie: {
    name: '_auth',
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    secrets: [process.env.SESSION_SECRET || 'NOT_A_STRONG_SECRET???'],
    secure: process.env.NODE_ENV === 'production',
  },
})

export const { getSession, commitSession, destroySession } = authSessionStorage
