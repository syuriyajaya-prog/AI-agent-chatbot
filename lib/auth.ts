import { cookies } from 'next/headers';
import { UserRecord, mockDb } from './storage/mock-db';
import { getServerSupabase } from './supabase/server';

const SESSION_COOKIE = 'hiresense_session';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: 'Administrator' | 'HR User';
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);

  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  try {
    const raw = Buffer.from(sessionCookie.value, 'base64').toString('utf-8');
    const parsed = JSON.parse(raw);
    if (parsed && parsed.id && parsed.email && parsed.role) {
      return parsed as SessionUser;
    }
  } catch (err) {
    console.warn('Failed to parse session cookie:', err);
  }

  return null;
}

export function setSessionCookie(user: SessionUser) {
  const payload = Buffer.from(JSON.stringify(user)).toString('base64');
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE, payload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export function clearSessionCookie() {
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
