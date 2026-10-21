import { DEFAULT_NETWORK, NetworkConfig } from './networks';
import { ValidatorInfo, EpochInfo, NetworkStats } from '@/types/validator';
import { truncateAddress } from './utils';
import {
    getActiveValidatorAddresses,
    getAllValidatorAddresses,
    getValidatorContractInfo,
    getEpochNumber,
    getValidatorMinStake,
    getEpochDetails,
    type EpochDetails,
    type ValidatorReadContext,
} from './viem-client';
import type { Address } from 'viem';
import { findLegacyIdentity } from './legacy-identity';

export class ValidatorService {
    private static instance: ValidatorService;

    private constructor() { }

    static getInstance(): ValidatorService {
        if (!ValidatorService.instance) {
            ValidatorService.instance = new ValidatorService();
        }
        return ValidatorService.instance;
    }

    async getActiveValidators(network: NetworkConfig = DEFAULT_NETWORK): Promise<Address[]> {
        try {
            console.log(`[ValidatorService] Fetching active validators for ${network.name}...`);
            const validators = await getActiveValidatorAddresses(network);
            console.log(`[ValidatorService] Found ${validators.length} active validators on ${network.name}`);

            return validators;
        } catch (error: any) {
            console.error(`[ValidatorService] Error fetching active validators on ${network.name}:`, error.message);
            return [];
        }
    }

    async getAllValidators(network: NetworkConfig = DEFAULT_NETWORK): Promise<Address[]> {
        try {
            console.log(`[ValidatorService] Discovering all validators for ${network.name}...`);
            const validators = await getAllValidatorAddresses(network);
            console.log(`[ValidatorService] Discovered ${validators.length} total validators on ${network.name}`);

            return validators;
        } catch (error: any) {
            console.error(`[ValidatorService] Error discovering validators on ${network.name}:`, error.message);
            return [];
        }
    }

    async getValidatorInfo(
        address: Address,
        network: NetworkConfig = DEFAULT_NETWORK,
        activeAddresses?: Address[],
        ctx?: ValidatorReadContext
    ): Promise<ValidatorInfo> {
        try {
            const contractInfo = await getValidatorContractInfo(address, network, activeAddresses, ctx);

            // Identities weren't carried over to v0.6 networks; until an operator
            // sets one again, show the one they used on an earlier testnet.
            const hasOnchainIdentity = !!contractInfo.moniker;
            const legacy = !hasOnchainIdentity && network.stakingVersion === 'v0.6'
                ? findLegacyIdentity(contractInfo.operator, contractInfo.owner)
                : null;
            const id = legacy ?? contractInfo;

            return {
                moniker: id.moniker || truncateAddress(address),
                address: address,
                identity: id.website || '',
                logoUri: id.logoUri || undefined,
                identitySource: hasOnchainIdentity ? 'onchain' : legacy ? 'legacy' : 'none',
                identityNetwork: legacy?.network,
                stake: contractInfo.stake.toString(),
                selfStake: contractInfo.selfStake.toString(),
                delegatedStake: contractInfo.delegatedStake.toString(),
                commission: contractInfo.commission.toString(),
                shares: contractInfo.shares.toString(),
                delegatedShares: contractInfo.delegatedShares.toString(),
                isActive: contractInfo.live,
                isBanned: contractInfo.banned,
                isQuarantined: contractInfo.quarantined,
                isPending: contractInfo.pending,
                hasUnclaimedRewards: contractInfo.hasUnclaimedRewards,
                bannedEpoch: contractInfo.bannedEpoch.toString(),
                primedEpoch: contractInfo.primedEpoch.toString(),
                pendingDeposits: contractInfo.deposit.toString(),
                pendingWithdrawals: contractInfo.withdrawal.toString(),
                description: id.description,
                email: id.email,
                twitter: id.twitter,
                telegram: id.telegram,
                github: id.github,
                operator: contractInfo.operator,
                owner: contractInfo.owner,
                leftNode: contractInfo.leftNode,
                rightNode: contractInfo.rightNode,
                parentNode: contractInfo.parentNode,
                uptime: contractInfo.uptime,
                missedBlocks: contractInfo.missedBlocks,
                blocksProduced: contractInfo.blocksProduced,
                consensusScore: contractInfo.consensusScore,
                appealSuccessRate: contractInfo.appealSuccessRate,
            };
        } catch (error: any) {
            console.error(`[ValidatorService] Error fetching validator ${address}:`, error.message);
            return {
                moniker: truncateAddress(address),
                address: address,
                identity: '',
                stake: '0',
                selfStake: '0',
                delegatedStake: '0',
                commission: '0',
                shares: '0',
                isActive: false,
                isBanned: false,
                pendingDeposits: '0',
                pendingWithdrawals: '0',
                uptime: 0,
                missedBlocks: 0,
                blocksProduced: 0,
                consensusScore: 0,
                appealSuccessRate: 0,
            };
        }
    }

    async getEpochInfo(network: NetworkConfig = DEFAULT_NETWORK): Promise<EpochInfo> {
        return (await this.getNetworkStats(network)).epochInfo;
    }

    async getNetworkStats(network: NetworkConfig = DEFAULT_NETWORK): Promise<NetworkStats> {
        console.log(`[ValidatorService] Fetching network stats for ${network.name}...`);

        const [currentEpoch, minStake, activeAddresses, allAddresses, details] = await Promise.all([
            getEpochNumber(network),
            getValidatorMinStake(network),
            this.getActiveValidators(network),
            this.getAllValidators(network),
            getEpochDetails(network),
        ]);

        const ctx: ValidatorReadContext = {
            minStake,
            quarantined: new Set(details.quarantined),
            banned: details.banned ? new Set(details.banned) : undefined,
        };
        const validators = await Promise.all(
            allAddresses.map(addr => this.getValidatorInfo(addr, network, activeAddresses, ctx))
        );

        const epochInfo = buildEpochInfo(Number(currentEpoch), minStake, validators, details, network.stakingVersion === 'v0.6');
        console.log(`[ValidatorService] Epoch: ${epochInfo.currentEpoch}, Active: ${epochInfo.activeValidators}, Pending: ${epochInfo.pendingValidators}, Total: ${epochInfo.totalValidators}`);

        return {
            epochInfo,
            validators,
            lastUpdated: new Date(),
        };
    }
}

function buildEpochInfo(
    currentEpoch: number,
    minStake: bigint,
    validators: ValidatorInfo[],
    details: EpochDetails,
    isV06: boolean
): EpochInfo {
    let totalStake = 0n;
    let pendingDeposits = 0n;
    for (const v of validators) {
        totalStake += BigInt(v.stake || '0') + BigInt(v.delegatedStake || '0');
        pendingDeposits += BigInt(v.pendingDeposits || '0');
    }

    return {
        currentEpoch,
        totalValidators: validators.length,
        activeValidators: validators.filter(v => v.isActive).length,
        bannedValidators: validators.filter(v => v.isBanned).length,
        inflation: details.inflation?.toString() ?? '0',
        validatorMinStake: minStake.toString(),
        nextEpochEstimate: details.nextEpochEstimate,
        // Only v0.6 contracts report these; leave them unset so the UI hides them.
        pendingValidators: isV06 ? validators.filter(v => v.isPending).length : undefined,
        quarantinedValidators: isV06 ? details.quarantined.length : undefined,
        unclaimedRewardsValidators: isV06 ? validators.filter(v => v.hasUnclaimedRewards).length : undefined,
        totalStake: totalStake.toString(),
        pendingDeposits: pendingDeposits.toString(),
        lastFinalizedEpoch: details.lastFinalizedEpoch != null ? Number(details.lastFinalizedEpoch) : null,
        epochStart: details.epochStart,
        epochMinDurationSec: details.epochMinDurationSec,
        epochInflation: details.inflation?.toString() ?? null,
        delegatorMinStake: details.delegatorMinStake?.toString() ?? null,
    };
}

// Export singleton instance
export const validatorService = ValidatorService.getInstance();
