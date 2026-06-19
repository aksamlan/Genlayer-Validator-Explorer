export interface ValidatorInfo {
    address: string;
    moniker: string;
    identity: string;     // website (kept for backwards compat)
    logoUri?: string;

    // Status
    isActive: boolean;
    isBanned: boolean;
    bannedEpoch?: string;
    primedEpoch?: string;

    // Stake
    stake: string;
    selfStake: string;
    delegatedStake: string;
    commission: string;
    shares: string;
    delegatedShares?: string;
    pendingDeposits: string;
    pendingWithdrawals: string;

    // Profile / socials
    description?: string;
    email?: string;
    twitter?: string;
    telegram?: string;
    github?: string;

    // On-chain roles
    operator?: string;
    owner?: string;

    // Tree position (staking BST)
    leftNode?: string;
    rightNode?: string;
    parentNode?: string;

    // Performance (reserved for future)
    uptime: number;
    missedBlocks: number;
    blocksProduced: number;
    lastBlockTime?: number;
    consensusScore: number;
    appealSuccessRate: number;
    jailedReason?: string;
    unlockTime?: number;
}

export interface EpochInfo {
    currentEpoch: number;
    totalValidators: number;
    activeValidators: number;
    bannedValidators: number;
    inflation: string;
    validatorMinStake: string;
    nextEpochEstimate: Date | null;
}

export interface NetworkStats {
    epochInfo: EpochInfo;
    validators: ValidatorInfo[];
    lastUpdated: Date;
}
