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
    // Testnet Bradbury (bradbury-phase1). Same underlying chain as Asimov
    // (zkSync OS settlement, chain 4221) — only the consensus deployment differs.
    // The explorer reads validators/stake from the EVM staking contract over the
    // shared zkSync RPC; note the node's CLI RPC (rpc-bradbury.genlayer.com) is
    // NOT usable by viem (net_version -32601), so we keep the zkSync EVM RPC.
    bradburyTestnet: {
        networkName: 'bradbury-phase1',
        // GenLayer JSON-RPC (GenVM ops) — shared with Asimov
        rpcUrl: 'https://rally-testnet.genlayer.com/api',
        // EVM RPC — zkSync OS Testnet (staking contracts live here)
        evmRpcUrl: 'https://zksync-os-testnet-genlayer.zksync.dev',
        // Bradbury consensus deployment (distinct from Asimov)
        stakingContractAddress: '0x4A4449E617F8D10FDeD0b461CadEf83939E821A5',
        consensusAddress: '0x8aCE036C8C3C5D603dB546b031302FCf149648E8', // AddressManager
        consensusMainAddress: '0x0112Bf6e83497965A5fdD6Dad1E447a6E004271D',
        displayChainId: 4221,
        explorerUrl: 'https://explorer-bradbury.genlayer.com',
        genesisBlock: 501711,
        discoveryStartBlock: 0n,
    },
};
