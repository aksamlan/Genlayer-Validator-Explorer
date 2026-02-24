import { Address } from "genlayer-js/types";
import { testnetAsimov, studionet } from "genlayer-js/chains";

export interface NetworkConfig {
    id: string;
    name: string;
    rpcUrl: string;
    tokenSymbol: string;
    chainConfig: any;
}

export const ASIMOV_NETWORK: NetworkConfig = {
    id: 'asimov',
    name: 'Asimov',
    rpcUrl: 'https://zksync-os-testnet-genlayer.zksync.dev',
    tokenSymbol: 'GEN',
    chainConfig: {
        ...testnetAsimov,
        stakingContract: {
            ...testnetAsimov.stakingContract,
            address: "0xe66B434bc83805f380509642429eC8e43AE9874a",
        },
        consensusMain: {
            address: "0xe66B434bc83805f380509642429eC8e43AE9874a",
        },
        consensusData: {
            address: "0xe66B434bc83805f380509642429eC8e43AE9874a",
        }
    }
};

export const NETWORKS: NetworkConfig[] = [ASIMOV_NETWORK];
export const DEFAULT_NETWORK = ASIMOV_NETWORK;

