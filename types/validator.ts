export interface ValidatorInfo {
    address: string;
    moniker: string;
    identity: string;
    logoUri?: string;
    isActive: boolean;
    isBanned: boolean;
    stake: string;
    shares: string;
    pendingDeposits: string;
    pendingWithdrawals: string;
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
