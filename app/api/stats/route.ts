import { NextResponse } from 'next/server';
import { mockDb } from '@/lib/storage/mock-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stats = mockDb.getEnhancedStats();
    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to retrieve stats' }, { status: 500 });
  }
}
