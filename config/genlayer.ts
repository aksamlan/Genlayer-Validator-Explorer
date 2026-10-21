const RALLY_TESTNET = {
    // GenLayer JSON-RPC (for GenVM operations)
    rpcUrl: 'https://rally-testnet.genlayer.com/api',
    // EVM RPC - ZKSync OS Testnet (staking contracts live here)
    evmRpcUrl: 'https://zksync-os-testnet-genlayer.zksync.dev',
    // Updated staking contract on ZKSync OS Testnet (Chain ID 4221)
    stakingContractAddress: '0x63Fa5E0bb10fb6fA98F44726C5518223F767687A',
    consensusAddress: '0x63Fa5E0bb10fb6fA98F44726C5518223F767687A',
    // Rally Testnet display info
    displayChainId: 61899,
    explorerUrl: 'https://devnet-explorer.rally.fun',
    // Discovery start block on ZKSync (not used for log scanning due to 10k block limit)
    discoveryStartBlock: 0n,
};

export const GENLAYER_CONFIG = {
    rallyTestnet: RALLY_TESTNET,
    // Testnet Bradbury, Phase 2 (node network name bradbury-phase2, node v0.6).
    // A fresh chain: Phase 1 validators/stake were not carried over. One RPC
    // serves both the GenLayer and EVM methods, so blocks, txs and staking reads
    // all go through it. Contracts: genlayer-consensus deployments/bradbury-phase-2.json
    bradburyTestnet: {
        networkName: 'bradbury-phase2',
        rpcUrl: 'https://rpc.testnet-chain.genlayer.com',
        evmRpcUrl: 'https://rpc.testnet-chain.genlayer.com',
        stakingContractAddress: '0xD8fBa96C0dBB0257028dBc0107060b958e5c7113',
        consensusAddress: '0x3F71AE080BD6270A91dBcc7960d88797828538E0', // AddressManager
        validatorWalletFactoryAddress: '0x399FCBe6b442903cbA4d3B647B4b30EddF729314',
        vestingFactoryAddress: '0x82cA5e0e7A9345CF3ED5ee68A7fba41EF2202316',
        displayChainId: 4221,
        explorerUrl: 'https://scan.testnet-chain.genlayer.com',
        discoveryStartBlock: 0n,
    },
};
