import { GENLAYER_CONFIG } from "@/config/genlayer";

export interface NetworkConfig {
    id: string;
    name: string;
    rpcUrl: string;        // GenLayer JSON-RPC
    evmRpcUrl: string;     // EVM RPC for staking contract reads
    tokenSymbol: string;
    chainConfig: any;
    displayChainId: number;
    explorerUrl: string;
}

const RALLY_CONFIG = GENLAYER_CONFIG.rallyTestnet;

const RALLY_RPC_URL =
    process.env.NEXT_PUBLIC_GENLAYER_RPC_URL ||
    RALLY_CONFIG.rpcUrl;

const RALLY_EVM_RPC_URL =
    process.env.NEXT_PUBLIC_EVM_RPC_URL ||
    RALLY_CONFIG.evmRpcUrl;

export const RALLY_NETWORK: NetworkConfig = {
    id: 'rally-testnet',
    name: 'GenLayer Testnet',
    rpcUrl: RALLY_RPC_URL,
    evmRpcUrl: RALLY_EVM_RPC_URL,
    tokenSymbol: 'GEN',
    displayChainId: RALLY_CONFIG.displayChainId,
    explorerUrl: RALLY_CONFIG.explorerUrl,
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

export const NETWORKS: NetworkConfig[] = [RALLY_NETWORK];
export const DEFAULT_NETWORK = RALLY_NETWORK;
// Backwards compatibility alias
export const ASIMOV_NETWORK = RALLY_NETWORK;
