/**
 * Verification: API Routes Integration Tests
 * Tests the route handlers directly using NextRequest/NextResponse mocks.
 */

import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getArticles } from '../../src/app/api/articles/route';
import { GET as getSources } from '../../src/app/api/sources/route';
import { GET as getArticleDetail } from '../../src/app/api/articles/[id]/route';

// Mock DB interactions to avoid needing a real DB for these tests
vi.mock('@/services/storage/article-store', () => ({
    getArticles: vi.fn().mockResolvedValue({ rows: [], total: 0 }),
    getArticleById: vi.fn().mockImplementation(async (id: string) => {
        if (id === 'nonexistent-id') return null;
        return { id, title: 'Mock Article', content: 'content' };
    }),
}));

vi.mock('@/lib/db', () => ({
    db: {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockReturnThis(),
        then: function (resolve: any) {
            resolve([{ value: 0 }]);
        }
    }
}));

// Quick mock for Drizzle ORM functions used in routes
vi.mock('drizzle-orm', () => ({
    eq: vi.fn(),
    desc: vi.fn(),
    isNull: vi.fn(),
    and: vi.fn(),
    count: vi.fn(),
}));

describe('GET /api/articles', () => {
    it('returns empty list and total 0 when DB is empty', async () => {
        const req = new NextRequest('http://localhost:3000/api/articles');
        const res = await getArticles(req);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.articles).toEqual([]);
        expect(data.total).toBe(0);
        expect(data.hasMore).toBe(false);
    });

    it('parses pagination params correctly', async () => {
        const req = new NextRequest('http://localhost:3000/api/articles?limit=5&offset=10');
        const res = await getArticles(req);
        expect(res.status).toBe(200);
    });
});

describe('GET /api/articles/[id]', () => {
    it('returns 404 for nonexistent article', async () => {
        // Next.js 15 requires params to be a Promise
        const params = Promise.resolve({ id: 'nonexistent-id' });
        const req = new NextRequest('http://localhost:3000/api/articles/nonexistent-id');
        const res = await getArticleDetail(req, { params });

        expect(res.status).toBe(404);
        const data = await res.json();
        expect(data.error).toBe('Article not found');
    });

    it('returns article data when found', async () => {
        const params = Promise.resolve({ id: 'valid-id' });
        const req = new NextRequest('http://localhost:3000/api/articles/valid-id');
        const res = await getArticleDetail(req, { params });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.article).toBeDefined();
        expect(data.article.id).toBe('valid-id');
    });
});

describe('GET /api/sources', () => {
    it('returns sources list structure', async () => {
        // We mock db to return empty array for the sources select, but the offset() mock returns [{value:0}]
        // For the actual rows, we need to mock the full chain resolution.
        // By default our mock resolves to [{value:0}] which is an array with 1 item.
        // That's fine for structure checking.
        const req = new NextRequest('http://localhost:3000/api/sources');
        const res = await getSources(req);

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data).toHaveProperty('sources');
        expect(data).toHaveProperty('total');
        expect(data).toHaveProperty('hasMore');
    });
});
