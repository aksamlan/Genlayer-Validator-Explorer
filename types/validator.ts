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
    // v0.6 (Bradbury Phase 2+)
    isQuarantined?: boolean;
    isPending?: boolean;          // staked, waiting to enter the selectable set
    hasUnclaimedRewards?: boolean;

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

    // v0.6 (Bradbury Phase 2+); absent/null on older deployments
    pendingValidators?: number;
    quarantinedValidators?: number;
    unclaimedRewardsValidators?: number;
    totalStake?: string;          // wei: self + delegated across all validators
    pendingDeposits?: string;     // wei: deposits waiting to activate
    lastFinalizedEpoch?: number | null;
    epochStart?: Date | null;
    epochMinDurationSec?: number | null;
    epochInflation?: string | null;
    delegatorMinStake?: string | null;
}

export type ValidatorStatus = 'active' | 'pending' | 'quarantined' | 'banned' | 'inactive';

export function getValidatorStatus(v: Pick<ValidatorInfo, 'isActive' | 'isBanned' | 'isQuarantined' | 'isPending'>): ValidatorStatus {
    if (v.isBanned) return 'banned';
    if (v.isQuarantined) return 'quarantined';
    if (v.isActive) return 'active';
    if (v.isPending) return 'pending';
    return 'inactive';
}

export const VALIDATOR_STATUS_LABEL: Record<ValidatorStatus, string> = {
    active: 'Active',
    pending: 'Pending',
    quarantined: 'Quarantined',
    banned: 'Banned',
    inactive: 'Inactive',
};

export interface NetworkStats {
    epochInfo: EpochInfo;
    validators: ValidatorInfo[];
    lastUpdated: Date;
}
