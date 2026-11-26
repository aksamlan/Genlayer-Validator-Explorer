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
    // Testnet Bradbury, Phase 3 (node network name bradbury-phase3, node v0.6.1,
    // v0.6 consensus contracts). A new deployment on the same chain as Phase 2:
    // validators and stake were not carried over. One RPC serves both the
    // GenLayer and EVM methods, so blocks, txs and staking reads all go through
    // it. Addresses resolved from the AddressManager via getAddress(name).
    bradburyTestnet: {
        networkName: 'bradbury-phase3',
        rpcUrl: 'https://rpc.testnet-chain.genlayer.com',
        evmRpcUrl: 'https://rpc.testnet-chain.genlayer.com',
        stakingContractAddress: '0xcE16862EAf10B97A0619BeBb662991fb4a52e346',
        consensusAddress: '0x0192C6C9482251790965B7136352B26234d81d79', // AddressManager
        validatorWalletFactoryAddress: '0xfE7bA48e90FeA19C955c18bBDE8BdC0810C2e6ed',
        vestingFactoryAddress: '0x753B5DC3841F640cD93d61F26E5EAa088Da6f1B6',
        displayChainId: 4221,
        explorerUrl: 'https://scan.bradbury.genlayer.com',
        discoveryStartBlock: 694191n, // Phase 3 genesis block
    },
    // Testnet Clarke, the Mainnet release candidate (node network name clarke,
    // node v0.6.1). A separate deployment of the Bradbury Phase 3 contracts on
    // the same chain, so it shares Bradbury's chain ID, RPC and GEN balances —
    // only the contracts differ. Addresses resolved from the AddressManager.
    clarkeTestnet: {
        networkName: 'clarke',
        rpcUrl: 'https://rpc.testnet-chain.genlayer.com',
        evmRpcUrl: 'https://rpc.testnet-chain.genlayer.com',
        stakingContractAddress: '0x711d111510Af2Bb35c3929b709677a1E9f8ffce2',
        consensusAddress: '0xA79dA7c238905fD0F10298cD579B0733ad1B1d0E', // AddressManager
        validatorWalletFactoryAddress: '0xB169708a4a1C14503906C4eCfA07A61E5968209E',
        vestingFactoryAddress: '0x9Cd92364FaBD6821A0550d1D738c997CF216167C',
        displayChainId: 4221,
        explorerUrl: 'https://scan.testnet-chain.genlayer.com',
        discoveryStartBlock: 0n,
    },
};
