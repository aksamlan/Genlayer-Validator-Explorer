/**
 * Unified read-only RPC layer for the GenLayer Explorer.
 *
 * Blocks, transactions and address state are read from the selected network's
 * EVM RPC (`network.evmRpcUrl`), the same chain its staking contracts live on.
 * Every reader takes an optional `network` and falls back to the default one.
 *
 * GENLAYER_RPC (Rally) is kept for GenVM `gen_*` calls in genvm-rpc.ts.
 */

import {
    createPublicClient,
    type Address,
    type Block,
    type Hash,
    type Transaction,
    type TransactionReceipt,
} from 'viem';
import { GENLAYER_CONFIG } from '@/config/genlayer';
import { DEFAULT_NETWORK, type NetworkConfig } from './networks';
import { throttledHttp } from './rpc-transport';

export const GENLAYER_RPC = GENLAYER_CONFIG.rallyTestnet.rpcUrl;
export const GENLAYER_CHAIN_ID = GENLAYER_CONFIG.rallyTestnet.displayChainId;

const settlementClients: Record<string, ReturnType<typeof createPublicClient>> = {};

export function getSettlementClient(network: NetworkConfig = DEFAULT_NETWORK) {
    const url = network.evmRpcUrl || network.rpcUrl;
    if (!settlementClients[url]) {
        settlementClients[url] = createPublicClient({
            transport: throttledHttp(url, { timeout: 20_000 }),
        });
    }
    return settlementClients[url];
}

// ── Raw JSON-RPC helper (used for endpoints viem doesn't natively shape nicely) ──

export async function rpcCall<T = unknown>(
    url: string,
    method: string,
    params: unknown[] | object = []
): Promise<T> {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params }),
    });
    if (!res.ok) {
        throw new Error(`RPC ${method} HTTP ${res.status}`);
    }
    const data = await res.json();
    if (data.error) {
        const msg = data.error.message || `RPC error ${data.error.code}`;
        throw new Error(`${method}: ${msg}`);
    }
    return data.result as T;
}

// ── Settlement layer reads (real blocks, txs, addresses) ──

type Net = NetworkConfig;

// Several widgets poll the same head and the same recent blocks. Mined blocks
// never change, so they are fetched once per page session; the head number is
// shared for a couple of seconds. Both also merge concurrent identical requests.
const HEAD_TTL_MS = 2_000;
const MAX_CACHED_BLOCKS = 500;

const headCache = new Map<string, { at: number; value: Promise<bigint> }>();
const blockCache = new Map<string, Promise<any>>();

function cachedBlock<T>(key: string, load: () => Promise<T>): Promise<T> {
    const hit = blockCache.get(key);
    if (hit) return hit;
    const p = load();
    blockCache.set(key, p);
    p.catch(() => blockCache.delete(key)); // don't keep failures
    if (blockCache.size > MAX_CACHED_BLOCKS) {
        blockCache.delete(blockCache.keys().next().value!); // oldest first
    }
    return p;
}

export async function getLatestBlockNumber(network: Net = DEFAULT_NETWORK): Promise<bigint> {
    const hit = headCache.get(network.id);
    if (hit && Date.now() - hit.at < HEAD_TTL_MS) return hit.value;
    const value = getSettlementClient(network).getBlockNumber();
    headCache.set(network.id, { at: Date.now(), value });
    value.catch(() => headCache.delete(network.id));
    return value;
}

export async function getBlock(numberOrHash: bigint | Hash, network: Net = DEFAULT_NETWORK): Promise<Block> {
    const client = getSettlementClient(network);
    if (typeof numberOrHash === 'bigint') {
        // A block already fetched with its transactions has the header too.
        const full = blockCache.get(`${network.id}:${numberOrHash}:full`);
        if (full) return full;
        return cachedBlock(`${network.id}:${numberOrHash}:head`, () =>
            client.getBlock({ blockNumber: numberOrHash, includeTransactions: false }));
    }
    return client.getBlock({ blockHash: numberOrHash, includeTransactions: false });
}

export async function getBlockWithTransactions(numberOrHash: bigint | Hash, network: Net = DEFAULT_NETWORK) {
    const client = getSettlementClient(network);
    if (typeof numberOrHash === 'bigint') {
        return cachedBlock(`${network.id}:${numberOrHash}:full`, () =>
            client.getBlock({ blockNumber: numberOrHash, includeTransactions: true }));
    }
    return client.getBlock({ blockHash: numberOrHash, includeTransactions: true });
}

export async function getRecentBlocks(count = 15, network: Net = DEFAULT_NETWORK): Promise<Block[]> {
    const head = await getLatestBlockNumber(network);
    const numbers: bigint[] = [];
    for (let i = 0n; i < BigInt(count); i++) {
        if (head - i < 0n) break;
        numbers.push(head - i);
    }
    return Promise.all(numbers.map(n => getBlock(n, network)));
}

export async function getTransaction(hash: Hash, network: Net = DEFAULT_NETWORK): Promise<Transaction> {
    return getSettlementClient(network).getTransaction({ hash });
}

export async function getTransactionReceipt(hash: Hash, network: Net = DEFAULT_NETWORK): Promise<TransactionReceipt | null> {
    try {
        return await getSettlementClient(network).getTransactionReceipt({ hash });
    } catch {
        return null;
    }
}

export async function getRecentTransactions(blockScan = 5, maxTxs = 25, network: Net = DEFAULT_NETWORK) {
    const blocks = await getRecentBlocks(blockScan, network).then(bs =>
        Promise.all(bs.map(b => getBlockWithTransactions(b.number!, network)))
    );
    const txs: Array<Transaction & { blockTimestamp: bigint }> = [];
    for (const b of blocks) {
        for (const t of b.transactions as Transaction[]) {
            txs.push({ ...t, blockTimestamp: b.timestamp });
            if (txs.length >= maxTxs) return txs;
        }
    }
    return txs;
}

export async function getAddressBalance(address: Address, network: Net = DEFAULT_NETWORK): Promise<bigint> {
    return getSettlementClient(network).getBalance({ address });
}

export async function getAddressCode(address: Address, network: Net = DEFAULT_NETWORK): Promise<string> {
    const code = await getSettlementClient(network).getCode({ address });
    return code ?? '0x';
}

export async function getAddressTxCount(address: Address, network: Net = DEFAULT_NETWORK): Promise<number> {
    return getSettlementClient(network).getTransactionCount({ address });
}

export async function getGasPrice(network: Net = DEFAULT_NETWORK): Promise<bigint> {
    return getSettlementClient(network).getGasPrice();
}

// ── Search heuristics ──

export type SearchTarget =
    | { kind: 'block'; number: bigint }
    | { kind: 'tx'; hash: Hash }
    | { kind: 'address'; address: Address }
    | { kind: 'unknown' };

export function classifySearch(raw: string): SearchTarget {
    const q = raw.trim();
    if (!q) return { kind: 'unknown' };

    // Pure number → block
    if (/^\d+$/.test(q)) {
        try {
            return { kind: 'block', number: BigInt(q) };
        } catch {
            return { kind: 'unknown' };
        }
    }

    // Hex strings
    if (/^0x[0-9a-fA-F]+$/.test(q)) {
        if (q.length === 66) return { kind: 'tx', hash: q as Hash };
        if (q.length === 42) return { kind: 'address', address: q.toLowerCase() as Address };
    }

    return { kind: 'unknown' };
}
