export const GENLAYER_CONFIG = {
    rallyTestnet: {
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
    },
};
