import { http, type HttpTransport } from 'viem';

/**
 * viem HTTP transport that caps in-flight requests per RPC URL.
 *
 * The Bradbury Phase 2 public RPC rate-limits bursts (more than ~7 concurrent
 * calls start returning 429 / -32017), while steady traffic is fine. A
 * validator-list refresh fans out dozens of eth_calls at once, so requests are
 * queued here and 429s are retried with backoff by viem.
 */

const MAX_IN_FLIGHT = 4;
// After any 429, hold every request to that URL briefly so the limiter can
// refill, instead of the other in-flight calls burning their retries too.
const COOLDOWN_MS = 1_000;

interface Gate {
    active: number;
    queue: Array<() => void>;
    pausedUntil: number;
}

const gates = new Map<string, Gate>();

function gateFor(url: string): Gate {
    let g = gates.get(url);
    if (!g) {
        g = { active: 0, queue: [], pausedUntil: 0 };
        gates.set(url, g);
    }
    return g;
}

async function acquire(g: Gate) {
    if (g.active < MAX_IN_FLIGHT) {
        g.active++;
    } else {
        await new Promise<void>(resolve => g.queue.push(resolve));
    }
    const wait = g.pausedUntil - Date.now();
    if (wait > 0) await new Promise(r => setTimeout(r, wait));
}

function release(g: Gate) {
    const next = g.queue.shift();
    if (next) next(); // hand the slot straight to the next waiter
    else g.active--;
}

export function throttledHttp(url: string, opts: { timeout?: number } = {}): HttpTransport {
    const gate = gateFor(url);
    return http(url, {
        timeout: opts.timeout ?? 30_000,
        retryCount: 6,
        retryDelay: 400, // viem backs off exponentially from this
        fetchFn: async (input, init) => {
            await acquire(gate);
            try {
                const res = await fetch(input, init);
                if (res.status === 429) gate.pausedUntil = Date.now() + COOLDOWN_MS;
                return res;
            } finally {
                release(gate);
            }
        },
    });
}
