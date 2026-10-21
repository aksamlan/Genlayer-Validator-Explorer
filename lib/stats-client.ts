import type { NetworkConfig } from './networks';
import type { NetworkStats } from '@/types/validator';
import { validatorService } from './validator-service';

/**
 * Network stats for the browser. Reads the cached /api/stats endpoint (one
 * request instead of ~90 RPC calls) and falls back to reading the chain
 * directly if the API is unavailable (e.g. a static/standalone build without it).
 * Concurrent callers for the same network share one request.
 */

const inflight = new Map<string, Promise<NetworkStats>>();

function revive(raw: any): NetworkStats {
    const toDate = (v: unknown) => (v ? new Date(v as string) : null);
    return {
        ...raw,
        lastUpdated: new Date(raw.lastUpdated),
        epochInfo: {
            ...raw.epochInfo,
            nextEpochEstimate: toDate(raw.epochInfo?.nextEpochEstimate),
            epochStart: toDate(raw.epochInfo?.epochStart),
        },
    };
}

async function load(network: NetworkConfig): Promise<NetworkStats> {
    try {
        const res = await fetch(`/api/stats?network=${encodeURIComponent(network.id)}`);
        if (!res.ok) throw new Error(`stats API ${res.status}`);
        return revive(await res.json());
    } catch (e) {
        console.warn('[stats] API unavailable, reading the chain directly:', e);
        return validatorService.getNetworkStats(network);
    }
}

export function fetchNetworkStats(network: NetworkConfig): Promise<NetworkStats> {
    let p = inflight.get(network.id);
    if (!p) {
        p = load(network).finally(() => inflight.delete(network.id));
        inflight.set(network.id, p);
    }
    return p;
}
