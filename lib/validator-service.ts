import { ASIMOV_NETWORK, DEFAULT_NETWORK, NetworkConfig } from './networks';
import { ValidatorInfo, EpochInfo, NetworkStats } from '@/types/validator';
import { truncateAddress } from './utils';
import {
    getActiveValidatorAddresses,
    getValidatorContractInfo,
    getEpochNumber,
    getValidatorMinStake,
    type ValidatorContractInfo
} from './viem-client';
import type { Address } from 'viem';

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

            if (validators.length === 0) {
                console.warn(`[ValidatorService] No validators returned from ${network.name}`);
            }

            return validators;
        } catch (error: any) {
            console.error(`[ValidatorService] Error fetching active validators on ${network.name}:`, error.message);
            console.error(`[ValidatorService] Full error:`, error);
            return [];
        }
    }

    async getValidatorInfo(address: Address, network: NetworkConfig = DEFAULT_NETWORK): Promise<ValidatorInfo> {
        try {
            const contractInfo = await getValidatorContractInfo(address, network);

            return {
                moniker: contractInfo.moniker || truncateAddress(address),
                address: address,
                identity: contractInfo.website || '',
                logoUri: contractInfo.logoUri || undefined,
                stake: contractInfo.stake.toString(),
                shares: contractInfo.shares.toString(),
                isActive: contractInfo.live,
                isBanned: contractInfo.banned,
                pendingDeposits: contractInfo.deposit.toString(),
                pendingWithdrawals: contractInfo.withdrawal.toString(),
            };
        } catch (error: any) {
            console.error(`[ValidatorService] Error fetching validator ${address}:`, error.message);
            return {
                moniker: truncateAddress(address),
                address: address,
                identity: '',
                stake: '0',
                shares: '0',
                isActive: false,
                isBanned: false,
                pendingDeposits: '0',
                pendingWithdrawals: '0',
            };
        }
    }

    async getEpochInfo(network: NetworkConfig = DEFAULT_NETWORK): Promise<EpochInfo> {
        try {
            console.log(`[ValidatorService] Fetching epoch info for ${network.name}...`);

            const [currentEpoch, minStake, validators] = await Promise.all([
                getEpochNumber(network),
                getValidatorMinStake(network),
                this.getActiveValidators(network)
            ]);

            const validatorInfos = await Promise.all(
                validators.map(addr => this.getValidatorInfo(addr, network))
            );

            const activeCount = validatorInfos.filter(v => v.isActive).length;
            const bannedCount = validatorInfos.filter(v => v.isBanned).length;

            console.log(`[ValidatorService] Epoch: ${currentEpoch}, Active Count: ${activeCount}, Total: ${validators.length}`);

            return {
                currentEpoch: Number(currentEpoch),
                totalValidators: validators.length,
                activeValidators: activeCount,
                bannedValidators: bannedCount,
                inflation: '0',
                validatorMinStake: minStake.toString(),
                nextEpochEstimate: null,
            };
        } catch (error: any) {
            console.error(`[ValidatorService] Error fetching epoch info on ${network.name}:`, error.message);
            return {
                currentEpoch: 0,
                totalValidators: 0,
                activeValidators: 0,
                bannedValidators: 0,
                inflation: '0',
                validatorMinStake: '0',
                nextEpochEstimate: null,
            };
        }
    }

    async getNetworkStats(network: NetworkConfig = DEFAULT_NETWORK): Promise<NetworkStats> {
        try {
            const validators = await this.getActiveValidators(network);
            const validatorInfos = await Promise.all(
                validators.map(addr => this.getValidatorInfo(addr, network))
            );
            const epochInfo = await this.getEpochInfo(network);

            return {
                epochInfo,
                validators: validatorInfos,
                lastUpdated: new Date(),
            };
        } catch (error) {
            console.error(`[ValidatorService] Error fetching network stats on ${network.name}:`, error);
            throw error;
        }
    }
}

// Export singleton instance
export const validatorService = ValidatorService.getInstance();
