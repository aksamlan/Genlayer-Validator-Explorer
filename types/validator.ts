export interface ValidatorInfo {
    address: string;
    moniker: string;
    identity: string;
    logoUri?: string;
    isActive: boolean;
    isBanned: boolean;
    stake: string;
    selfStake: string;
    delegatedStake: string;
    commission: string;
    shares: string;
    pendingDeposits: string;
    pendingWithdrawals: string;
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
