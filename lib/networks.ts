import { testnetAsimov } from "genlayer-js/chains";
import { GENLAYER_CONFIG } from "@/config/genlayer";

export interface NetworkConfig {
    id: string;
    name: string;
    rpcUrl: string;
    tokenSymbol: string;
    chainConfig: any;
}

const ASIMOV_CONFIG = GENLAYER_CONFIG.asimov;

// RPC önceliği:
// 1) Varsa env (Vercel env) → NEXT_PUBLIC_GENLAYER_RPC_URL
// 2) Yoksa config/genlayer.ts içindeki rpcUrl
const ASIMOV_RPC_URL =
    process.env.NEXT_PUBLIC_GENLAYER_RPC_URL ||
    ASIMOV_CONFIG.rpcUrl;

export const ASIMOV_NETWORK: NetworkConfig = {
    id: 'asimov',
    name: 'Asimov',
    rpcUrl: ASIMOV_RPC_URL,
    tokenSymbol: 'GEN',
    chainConfig: {
        ...testnetAsimov,
        stakingContract: {
            ...testnetAsimov.stakingContract,
            address: ASIMOV_CONFIG.stakingContractAddress,
        },
        consensusMain: {
            address: ASIMOV_CONFIG.consensusAddress,
        },
        consensusData: {
            address: ASIMOV_CONFIG.consensusAddress,
        }
    }
};

export const NETWORKS: NetworkConfig[] = [ASIMOV_NETWORK];
export const DEFAULT_NETWORK = ASIMOV_NETWORK;