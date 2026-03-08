/**
 * GET /api/admin/health
 * Returns the health status of all registered Source Providers.
 * Calculates success rate and highlights failing providers.
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sourceProviders } from '@/lib/schema';
import { desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const providers = await db
            .select({
                id: sourceProviders.id,
                name: sourceProviders.name,
                category: sourceProviders.category,
                consecutiveFailures: sourceProviders.consecutiveFailures,
                totalItemsCrawled: sourceProviders.totalItemsCrawled,
                lastSuccessAt: sourceProviders.lastSuccessAt,
                status: sourceProviders.status,
            })
            .from(sourceProviders)
            .orderBy(desc(sourceProviders.lastSuccessAt));

        const healthStats = providers.map(p => {
            // Logic for determining provider health
            const isHealthy = (p.consecutiveFailures ?? 0) < 3;
            const requiresAttention = (p.consecutiveFailures ?? 0) >= 3;

            return {
                ...p,
                isHealthy,
                requiresAttention,
            };
        });

        const failingCount = healthStats.filter(p => !p.isHealthy).length;

        return NextResponse.json({
            providers: healthStats,
            totalCount: healthStats.length,
            failingCount,
            systemStatus: failingCount === 0 ? 'Healthy' : failingCount > 2 ? 'Critical' : 'Degraded',
        });
    } catch (error) {
        console.error('[API/Health Error]', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
