/**
 * GenLayer Rally JSON-RPC helpers for GenVM intelligent contracts.
 *
 * The Rally testnet exposes both standard eth_* methods AND gen_* methods specific
 * to GenLayer's intelligent (LLM-augmented) smart contracts.
 */

import type { Address } from 'viem';
import { GENLAYER_RPC, rpcCall } from './explorer-rpc';

export interface GenVmMethod {
    name: string;
    inputs?: Array<{ name: string; type: string }>;
    outputs?: Array<{ name: string; type: string }>;
    readonly?: boolean;
}

export interface GenVmContractSchema {
    contract_address: string;
    methods?: Record<string, unknown>;
    state?: Record<string, unknown>;
    /** Raw schema as returned by the RPC — preserved so the UI can render unknowns gracefully. */
    raw: unknown;
}

export async function pingGenLayer(): Promise<boolean> {
    try {
        const r = await rpcCall<string>(GENLAYER_RPC, 'ping', []);
        return r === 'OK' || r === 'pong';
    } catch {
        return false;
    }
}

export async function getContractSchema(contract: Address): Promise<GenVmContractSchema | null> {
    try {
        const raw = await rpcCall<unknown>(GENLAYER_RPC, 'gen_getContractSchema', {
            contract_address: contract,
        });

        if (!raw || typeof raw !== 'object') {
            return { contract_address: contract, raw };
        }

        const obj = raw as Record<string, unknown>;
        return {
            contract_address: contract,
            methods: (obj.methods as Record<string, unknown>) || undefined,
            state: (obj.state as Record<string, unknown>) || undefined,
            raw,
        };
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes('not found') || msg.includes('-32001')) {
            return null;
        }
        throw e;
    }
}

export async function callGenVmReadMethod(
    contract: Address,
    method: string,
    args: unknown[] = []
): Promise<unknown> {
    return rpcCall(GENLAYER_RPC, 'gen_call', {
        to: contract,
        data: { method, args },
    });
}

/**
 * Curated list of known intelligent contracts on the Rally testnet.
 * Operators can extend this via NEXT_PUBLIC_KNOWN_CONTRACTS (comma-separated addr:name pairs).
 */
export interface KnownContract {
    address: Address;
    name: string;
    description?: string;
}

export function getKnownContracts(): KnownContract[] {
    const base: KnownContract[] = [
        // Curated by HusoNode — extend via env. These are example placeholders;
        // they will simply show "not found" if the schema RPC returns no data.
    ];

    const extra = process.env.NEXT_PUBLIC_KNOWN_CONTRACTS;
    if (extra) {
        for (const part of extra.split(',')) {
            const [addr, ...rest] = part.split(':');
            if (!addr) continue;
            const trimmed = addr.trim();
            if (!/^0x[0-9a-fA-F]{40}$/.test(trimmed)) continue;
            base.push({
                address: trimmed as Address,
                name: rest.join(':').trim() || trimmed.slice(0, 10),
            });
        }
    }

    return base;
}
