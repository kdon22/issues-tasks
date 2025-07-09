import { NextResponse } from 'next/server';

// Legacy workspace endpoint - NOT SUPPORTED in new system
export async function GET() {
  return NextResponse.json({ error: 'Legacy workspace API not supported. Use new resource system.' }, { status: 501 });
}

export async function POST() {
  return NextResponse.json({ error: 'Legacy workspace API not supported. Use new resource system.' }, { status: 501 });
} 