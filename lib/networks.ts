<<<<<<< HEAD
import { testnetAsimov } from "genlayer-js/chains";
import { GENLAYER_CONFIG } from "@/config/genlayer";
=======
import { Address } from "genlayer-js/types";
import { testnetAsimov, studionet } from "genlayer-js/chains";
>>>>>>> a4943ccea23d73a81043e6f20ec0b40fea1eb486

export interface NetworkConfig {
    id: string;
    name: string;
    rpcUrl: string;
    tokenSymbol: string;
    chainConfig: any;
}

<<<<<<< HEAD
const ASIMOV_CONFIG = GENLAYER_CONFIG.asimov;

// RPC önceliğini buradan yönetebilirsin:
// 1) Varsa env (Vercel ayarları) kullanılır
// 2) Yoksa config/genlayer.ts içindeki rpcUrl kullanılır
const ASIMOV_RPC_URL =
    process.env.NEXT_PUBLIC_GENLAYER_RPC_URL ||
    ASIMOV_CONFIG.rpcUrl;

export const ASIMOV_NETWORK: NetworkConfig = {
    id: 'asimov',
    name: 'Asimov',
    rpcUrl: ASIMOV_RPC_URL,
=======
export const ASIMOV_NETWORK: NetworkConfig = {
    id: 'asimov',
    name: 'Asimov',
    rpcUrl: 'https://zksync-os-testnet-genlayer.zksync.dev',
>>>>>>> a4943ccea23d73a81043e6f20ec0b40fea1eb486
    tokenSymbol: 'GEN',
    chainConfig: {
        ...testnetAsimov,
        stakingContract: {
            ...testnetAsimov.stakingContract,
<<<<<<< HEAD
            address: ASIMOV_CONFIG.stakingContractAddress,
        },
        consensusMain: {
            address: ASIMOV_CONFIG.consensusAddress,
        },
        consensusData: {
            address: ASIMOV_CONFIG.consensusAddress,
=======
            address: "0xe66B434bc83805f380509642429eC8e43AE9874a",
        },
        consensusMain: {
            address: "0xe66B434bc83805f380509642429eC8e43AE9874a",
        },
        consensusData: {
            address: "0xe66B434bc83805f380509642429eC8e43AE9874a",
>>>>>>> a4943ccea23d73a81043e6f20ec0b40fea1eb486
        }
    }
};

export const NETWORKS: NetworkConfig[] = [ASIMOV_NETWORK];
export const DEFAULT_NETWORK = ASIMOV_NETWORK;

