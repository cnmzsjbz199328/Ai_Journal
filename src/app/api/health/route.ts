/**
 * Health check API endpoint.
 * GET /api/health → { status: 'ok', timestamp }
 */

import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
    });
}
