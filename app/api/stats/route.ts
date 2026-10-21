import { NextResponse } from 'next/server';
import { NETWORKS } from '@/lib/networks';
import { validatorService } from '@/lib/validator-service';
import type { NetworkStats } from '@/types/validator';

/**
 * Validator + epoch stats for one network, computed on the server and cached.
 *
 * A full refresh is ~90 RPC calls and the public RPC rate-limits bursts, so
 * doing it in every visitor's browser is slow. Here it runs at most once per
 * FRESH_MS per server instance (stale results are served while it refreshes),
 * and the CDN caches the response on top.
 */

export const dynamic = 'force-dynamic';

const FRESH_MS = 15_000;

interface Entry {
    value?: NetworkStats;
    at: number;
    inflight?: Promise<NetworkStats>;
}

const cache = new Map<string, Entry>();

function getStats(networkId: string): Promise<NetworkStats> {
    const network = NETWORKS.find(n => n.id === networkId)!;
    let entry = cache.get(networkId);
    if (!entry) {
        entry = { at: 0 };
        cache.set(networkId, entry);
    }
    const e = entry;

    if (e.value && Date.now() - e.at < FRESH_MS) return Promise.resolve(e.value);

    if (!e.inflight) {
        e.inflight = validatorService.getNetworkStats(network)
            .then(v => {
                e.value = v;
                e.at = Date.now();
                return v;
            })
            .finally(() => { e.inflight = undefined; });
    }
    // Stale but present: answer now, the refresh above lands for the next request.
    return e.value ? Promise.resolve(e.value) : e.inflight;
}

export async function GET(req: Request) {
    const id = new URL(req.url).searchParams.get('network') ?? '';
    if (!NETWORKS.some(n => n.id === id)) {
        return NextResponse.json({ error: 'unknown network' }, { status: 400 });
    }
    try {
        const stats = await getStats(id);
        return NextResponse.json(stats, {
            headers: { 'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=120' },
        });
    } catch (e) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'failed' }, { status: 502 });
    }
}
