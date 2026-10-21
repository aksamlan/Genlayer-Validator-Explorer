import { GENLAYER_CONFIG } from "@/config/genlayer";

export interface NetworkConfig {
    id: string;
    name: string;         // short label shown in the switcher (e.g. "Asimov")
    fullName: string;     // full display name (e.g. "GenLayer Asimov Testnet")
    tagline: string;      // one-liner used in the hero / marketing copy
    rpcUrl: string;        // GenLayer JSON-RPC
    evmRpcUrl: string;     // EVM RPC for staking contract reads
    tokenSymbol: string;
    chainConfig: any;
    displayChainId: number;
    explorerUrl: string;
    explorerLabel: string; // label for the external block-explorer link
    // Staking contract generation. 'v0.6' (Bradbury Phase 2+) renamed the
    // active-set reads and slimmed validatorView; see lib/viem-client.ts.
    stakingVersion: 'v0.5' | 'v0.6';
    status: 'active' | 'sunset';
    phase?: string;        // e.g. "Phase 2"
}

const RALLY_CONFIG = GENLAYER_CONFIG.rallyTestnet;
const BRADBURY_CONFIG = GENLAYER_CONFIG.bradburyTestnet;

// ── Asimov / Rally ──────────────────────────────────────────────────────────

const RALLY_RPC_URL =
    process.env.NEXT_PUBLIC_GENLAYER_RPC_URL ||
    RALLY_CONFIG.rpcUrl;

const RALLY_EVM_RPC_URL =
    process.env.NEXT_PUBLIC_EVM_RPC_URL ||
    RALLY_CONFIG.evmRpcUrl;

export const ASIMOV_NETWORK: NetworkConfig = {
    id: 'asimov-testnet',
    name: 'Asimov',
    fullName: 'GenLayer Asimov Testnet',
    tagline: 'Real-time block, transaction, and validator explorer for the GenLayer Asimov / Rally Testnet.',
    rpcUrl: RALLY_RPC_URL,
    evmRpcUrl: RALLY_EVM_RPC_URL,
    tokenSymbol: 'GEN',
    displayChainId: RALLY_CONFIG.displayChainId,
    explorerUrl: RALLY_CONFIG.explorerUrl,
    explorerLabel: 'Rally Testnet Explorer',
    stakingVersion: 'v0.5',
    status: 'sunset',
    chainConfig: {
        stakingContract: {
            address: RALLY_CONFIG.stakingContractAddress,
        },
        consensusMain: {
            address: RALLY_CONFIG.consensusAddress,
        },
        consensusData: {
            address: RALLY_CONFIG.consensusAddress,
        },
    },
};

// Backwards-compatibility alias (older imports referenced RALLY_NETWORK)
export const RALLY_NETWORK = ASIMOV_NETWORK;

// ── Bradbury ────────────────────────────────────────────────────────────────
// Phase 2 runs on its own chain, so it no longer falls back to the Asimov
// RPC env vars — only the BRADBURY_* overrides apply.

const BRADBURY_RPC_URL =
    process.env.NEXT_PUBLIC_BRADBURY_RPC_URL ||
    BRADBURY_CONFIG.rpcUrl;

const BRADBURY_EVM_RPC_URL =
    process.env.NEXT_PUBLIC_BRADBURY_EVM_RPC_URL ||
    BRADBURY_CONFIG.evmRpcUrl;

export const BRADBURY_NETWORK: NetworkConfig = {
    id: 'bradbury-testnet',
    name: 'Bradbury',
    fullName: 'GenLayer Bradbury Testnet',
    tagline: 'Real-time block, transaction, and validator explorer for GenLayer Testnet Bradbury — Phase 2.',
    rpcUrl: BRADBURY_RPC_URL,
    evmRpcUrl: BRADBURY_EVM_RPC_URL,
    tokenSymbol: 'GEN',
    displayChainId: BRADBURY_CONFIG.displayChainId,
    explorerUrl: process.env.NEXT_PUBLIC_BRADBURY_EXPLORER_URL || BRADBURY_CONFIG.explorerUrl,
    explorerLabel: 'Bradbury Testnet Explorer',
    stakingVersion: 'v0.6',
    status: 'active',
    phase: 'Phase 2',
    chainConfig: {
        stakingContract: {
            address: BRADBURY_CONFIG.stakingContractAddress,
        },
        consensusMain: {
            address: BRADBURY_CONFIG.consensusAddress,
        },
        consensusData: {
            address: BRADBURY_CONFIG.consensusAddress,
        },
    },
};

// ── Registry ────────────────────────────────────────────────────────────────

// Bradbury is the only active testnet. Asimov is sunset and hidden; its config
// is kept so it can come back by setting NEXT_PUBLIC_ENABLE_ASIMOV=true.
// Visitors with Asimov saved in localStorage fall back to the default.
const ASIMOV_ENABLED = process.env.NEXT_PUBLIC_ENABLE_ASIMOV === 'true';

export const NETWORKS: NetworkConfig[] = ASIMOV_ENABLED
    ? [BRADBURY_NETWORK, ASIMOV_NETWORK]
    : [BRADBURY_NETWORK];
export const DEFAULT_NETWORK = BRADBURY_NETWORK;

export function getNetworkById(id: string | null | undefined): NetworkConfig {
    return NETWORKS.find(n => n.id === id) ?? DEFAULT_NETWORK;
}
