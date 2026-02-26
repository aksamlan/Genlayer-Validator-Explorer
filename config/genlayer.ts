export const GENLAYER_CONFIG = {
    asimov: {
        // Ana GenLayer RPC (GenLayerJS ve validator info için)
        rpcUrl: 'https://studio.genlayer.com/api',
        // ZKSync/Asimov EVM RPC (blok ve staking kontratı için)
        zkSyncRpcUrl: 'https://zksync-os-testnet-genlayer.zksync.dev',
        // Testnet Asimov Phase 5 staking / consensus sözleşmeleri
        stakingContractAddress: '0xe66B434bc83805f380509642429eC8e43AE9874a',
        consensusAddress: '0xe66B434bc83805f380509642429eC8e43AE9874a',
        // Validator keşfine başlangıç bloğu
        discoveryStartBlock: 4632386n,
    },
};

