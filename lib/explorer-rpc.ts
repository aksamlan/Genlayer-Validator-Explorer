/**
 * Unified read-only RPC layer for the GenLayer Explorer.
 *
 * Two chains in play:
 *   - GenLayer Rally Testnet (chain 61899) — intelligent contracts + epoch + native eth_* methods
 *   - ZKSync OS Testnet      (chain 4221)  — staking contracts + real EVM blocks/txs
 *
 * Blocks/transactions/address-history all live on ZKSync OS (the settlement layer).
 * Rally's eth_blockNumber is timestamp-based; it is NOT a traditional block stream.
 */

import {
    createPublicClient,
    http,
    type Address,
    type Block,
    type Hash,
    type Transaction,
    type TransactionReceipt,
} from 'viem';
import { GENLAYER_CONFIG } from '@/config/genlayer';

export const SETTLEMENT_RPC = GENLAYER_CONFIG.rallyTestnet.evmRpcUrl;
export const GENLAYER_RPC = GENLAYER_CONFIG.rallyTestnet.rpcUrl;

export const SETTLEMENT_CHAIN_ID = 4221;
export const GENLAYER_CHAIN_ID = GENLAYER_CONFIG.rallyTestnet.displayChainId;

const settlementClient = createPublicClient({
    transport: http(SETTLEMENT_RPC, { timeout: 20_000, retryCount: 1 }),
});

export function getSettlementClient() {
    return settlementClient;
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

export async function getLatestBlockNumber(): Promise<bigint> {
    return settlementClient.getBlockNumber();
}

export async function getBlock(numberOrHash: bigint | Hash): Promise<Block> {
    if (typeof numberOrHash === 'bigint') {
        return settlementClient.getBlock({ blockNumber: numberOrHash, includeTransactions: false });
    }
    return settlementClient.getBlock({ blockHash: numberOrHash, includeTransactions: false });
}

export async function getBlockWithTransactions(numberOrHash: bigint | Hash) {
    if (typeof numberOrHash === 'bigint') {
        return settlementClient.getBlock({ blockNumber: numberOrHash, includeTransactions: true });
    }
    return settlementClient.getBlock({ blockHash: numberOrHash, includeTransactions: true });
}

export async function getRecentBlocks(count = 15): Promise<Block[]> {
    const head = await getLatestBlockNumber();
    const numbers: bigint[] = [];
    for (let i = 0n; i < BigInt(count); i++) {
        if (head - i < 0n) break;
        numbers.push(head - i);
    }
    return Promise.all(numbers.map(n => getBlock(n)));
}

export async function getTransaction(hash: Hash): Promise<Transaction> {
    return settlementClient.getTransaction({ hash });
}

export async function getTransactionReceipt(hash: Hash): Promise<TransactionReceipt | null> {
    try {
        return await settlementClient.getTransactionReceipt({ hash });
    } catch {
        return null;
    }
}

export async function getRecentTransactions(blockScan = 5, maxTxs = 25) {
    const blocks = await getRecentBlocks(blockScan).then(bs =>
        Promise.all(bs.map(b => getBlockWithTransactions(b.number!)))
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

export async function getAddressBalance(address: Address): Promise<bigint> {
    return settlementClient.getBalance({ address });
}

export async function getAddressCode(address: Address): Promise<string> {
    const code = await settlementClient.getCode({ address });
    return code ?? '0x';
}

export async function getAddressTxCount(address: Address): Promise<number> {
    return settlementClient.getTransactionCount({ address });
}

export async function getGasPrice(): Promise<bigint> {
    return settlementClient.getGasPrice();
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
