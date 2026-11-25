import { http, type HttpTransport } from 'viem';

/**
 * viem HTTP transport for the rate-limited public RPC.
 *
 * - Batching (opt-in): calls made in the same tick go out as one JSON-RPC
 *   batch, so a page that needs ~30 blocks makes a couple of HTTP requests
 *   instead of 30 queued ones. Only for block/tx reads: batched eth_calls
 *   (contract reads) hit the RPC's rate limit far sooner than single ones, so
 *   the staking/identity client keeps one call per request.
 * - In-flight cap: at most MAX_IN_FLIGHT HTTP requests per URL; bursts beyond
 *   that start returning 429.
 * - Call budget: the RPC rate-limits by calls, not HTTP requests (every item in
 *   a batch counts). Measured: ~30 calls/s sustained is fine, 40/s is not. A
 *   token bucket keeps each URL under CALLS_PER_SEC, with a small burst so a
 *   page load's first ~30 calls still go out at once.
 * - Rate-limit retry: items over the limit come back as error -32017 inside an
 *   HTTP 200, which viem does not retry. Those items are re-sent on their own
 *   after a short pause and merged back, so callers see a slower answer, not
 *   an error.
 */

const MAX_IN_FLIGHT = 4;
const BATCH_SIZE = 25;
const BATCH_WAIT_MS = 10;
// After any rate limit, hold every request to that URL briefly so the limiter
// can refill, instead of the other in-flight calls burning their retries too.
const COOLDOWN_MS = 1_000;
const RATE_LIMIT_RETRIES = 6;
const CALLS_PER_SEC = 25;
const CALL_BURST = 50;

interface Gate {
    active: number;
    queue: Array<() => void>;
    pausedUntil: number;
    tokens: number;
    refilledAt: number;
    budget: Promise<void>; // serialises token waits so calls go out in order
}

const gates = new Map<string, Gate>();

function gateFor(url: string): Gate {
    let g = gates.get(url);
    if (!g) {
        g = { active: 0, queue: [], pausedUntil: 0, tokens: CALL_BURST, refilledAt: Date.now(), budget: Promise.resolve() };
        gates.set(url, g);
    }
    return g;
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function acquire(g: Gate) {
    if (g.active < MAX_IN_FLIGHT) {
        g.active++;
    } else {
        await new Promise<void>(resolve => g.queue.push(resolve));
    }
    const wait = g.pausedUntil - Date.now();
    if (wait > 0) await sleep(wait);
}

/** Waits until `calls` tokens are available, then spends them. */
function spend(g: Gate, calls: number): Promise<void> {
    const need = Math.min(calls, CALL_BURST);
    const turn = g.budget.then(async () => {
        for (;;) {
            const now = Date.now();
            g.tokens = Math.min(CALL_BURST, g.tokens + ((now - g.refilledAt) / 1000) * CALLS_PER_SEC);
            g.refilledAt = now;
            if (g.tokens >= need) {
                g.tokens -= need;
                return;
            }
            await sleep(Math.ceil(((need - g.tokens) / CALLS_PER_SEC) * 1000));
        }
    });
    g.budget = turn;
    return turn;
}

function callCount(body: unknown): number {
    if (typeof body !== 'string') return 1;
    try {
        const parsed = JSON.parse(body);
        return Array.isArray(parsed) ? parsed.length : 1;
    } catch {
        return 1;
    }
}

function release(g: Gate) {
    const next = g.queue.shift();
    if (next) next(); // hand the slot straight to the next waiter
    else g.active--;
}

interface RpcMessage {
    id?: unknown;
    error?: { code?: number; message?: string };
    [k: string]: unknown;
}

const isRateLimited = (m: RpcMessage) =>
    !!m?.error && (m.error.code === -32017 || /rate limit/i.test(m.error.message ?? ''));

/** Re-sends the rate-limited items of a JSON-RPC response and merges the answers. */
async function retryRateLimited(
    gate: Gate,
    input: Parameters<typeof fetch>[0],
    init: RequestInit,
    res: Response,
): Promise<Response> {
    if (!res.ok || typeof init.body !== 'string') return res;

    let sent: unknown;
    let got: unknown;
    try {
        sent = JSON.parse(init.body);
        got = await res.clone().json();
    } catch {
        return res;
    }
    const batched = Array.isArray(got);
    const requests = (Array.isArray(sent) ? sent : [sent]) as RpcMessage[];
    const answers = (batched ? got : [got]) as RpcMessage[];

    const byId = new Map(answers.map(a => [a?.id, a]));
    let pending = answers.filter(isRateLimited).map(a => a.id);
    if (pending.length === 0) return res;

    for (let attempt = 1; attempt <= RATE_LIMIT_RETRIES && pending.length > 0; attempt++) {
        gate.pausedUntil = Math.max(gate.pausedUntil, Date.now() + COOLDOWN_MS);
        await sleep(COOLDOWN_MS * attempt);

        const resend = requests.filter(r => pending.includes(r.id));
        await spend(gate, resend.length);
        const retry = await fetch(input, { ...init, body: JSON.stringify(resend) });
        if (!retry.ok) continue;
        let retried: RpcMessage[];
        try {
            const body = await retry.json();
            retried = Array.isArray(body) ? body : [body];
        } catch {
            continue;
        }
        for (const a of retried) if (!isRateLimited(a)) byId.set(a.id, a);
        pending = pending.filter(id => isRateLimited(byId.get(id) as RpcMessage));
    }

    const merged = answers.map(a => byId.get(a?.id) ?? a);
    return new Response(JSON.stringify(batched ? merged : merged[0]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}

export function throttledHttp(url: string, opts: { timeout?: number; batch?: boolean } = {}): HttpTransport {
    const gate = gateFor(url);
    return http(url, {
        batch: opts.batch ? { batchSize: BATCH_SIZE, wait: BATCH_WAIT_MS } : false,
        timeout: opts.timeout ?? 30_000,
        retryCount: 6,
        retryDelay: 400, // viem backs off exponentially from this
        fetchFn: async (input, init = {}) => {
            await acquire(gate);
            try {
                await spend(gate, callCount(init.body));
                const res = await fetch(input, init);
                if (res.status === 429) {
                    gate.pausedUntil = Date.now() + COOLDOWN_MS;
                    return res;
                }
                return await retryRateLimited(gate, input, init, res);
            } finally {
                release(gate);
            }
        },
    });
}
