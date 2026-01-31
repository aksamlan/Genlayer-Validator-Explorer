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
    rpcUrl: 'https://genlayer-testnet.rpc.caldera.xyz/http',
    tokenSymbol: 'GEN',
    chainConfig: {
        ...testnetAsimov,
        stakingContract: {
            ...testnetAsimov.stakingContract,
            address: "0x03f410748EBdb4026a6b8299E9B6603A273709D1",
        },
        consensusMain: {
            address: "0x67fd4aC71530FB220E0B7F90668BAF977B88fF07",
        },
        consensusData: {
            address: "0xB6E1316E57d47d82FDcEa5002028a554754EF243",
        }
    }
};

export const NETWORKS: NetworkConfig[] = [ASIMOV_NETWORK];
export const DEFAULT_NETWORK = ASIMOV_NETWORK;

