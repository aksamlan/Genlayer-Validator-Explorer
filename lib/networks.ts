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
// Shares its RPC + staking endpoints with Asimov (per GenLayer docs); the
// differences are branding, chain-id display, and the block explorer link.

const BRADBURY_RPC_URL =
    process.env.NEXT_PUBLIC_BRADBURY_RPC_URL ||
    process.env.NEXT_PUBLIC_GENLAYER_RPC_URL ||
    BRADBURY_CONFIG.rpcUrl;

const BRADBURY_EVM_RPC_URL =
    process.env.NEXT_PUBLIC_BRADBURY_EVM_RPC_URL ||
    process.env.NEXT_PUBLIC_EVM_RPC_URL ||
    BRADBURY_CONFIG.evmRpcUrl;

export const BRADBURY_NETWORK: NetworkConfig = {
    id: 'bradbury-testnet',
    name: 'Bradbury',
    fullName: 'GenLayer Bradbury Testnet',
    tagline: 'Real-time block, transaction, and validator explorer for the GenLayer Bradbury Testnet.',
    rpcUrl: BRADBURY_RPC_URL,
    evmRpcUrl: BRADBURY_EVM_RPC_URL,
    tokenSymbol: 'GEN',
    displayChainId: BRADBURY_CONFIG.displayChainId,
    explorerUrl: process.env.NEXT_PUBLIC_BRADBURY_EXPLORER_URL || BRADBURY_CONFIG.explorerUrl,
    explorerLabel: 'Bradbury Testnet Explorer',
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

export const NETWORKS: NetworkConfig[] = [ASIMOV_NETWORK, BRADBURY_NETWORK];
export const DEFAULT_NETWORK = ASIMOV_NETWORK;

export function getNetworkById(id: string | null | undefined): NetworkConfig {
    return NETWORKS.find(n => n.id === id) ?? DEFAULT_NETWORK;
}
