import { createPublicClient, http, parseAbi, type Address } from 'viem';
import { NetworkConfig, DEFAULT_NETWORK } from './networks';

// Cache for client instances
const clients: Record<string, ReturnType<typeof createPublicClient>> = {};

export function getViemClient(network: NetworkConfig = DEFAULT_NETWORK) {
    if (!clients[network.id]) {
        console.log(`[Viem] Initializing client for network: ${network.name} (${network.rpcUrl})`);

        clients[network.id] = createPublicClient({
            transport: http(network.rpcUrl, {
                timeout: 30_000, // 30 second timeout
            })
        });

        console.log(`[Viem] Client for ${network.id} created successfully`);
    }
    return clients[network.id];
}

// Staking contract ABI
export const STAKING_ABI = parseAbi([
    'function activeValidators() view returns (address[])',
    'function activeValidatorsCount() view returns (uint256)',
    'function validatorMinStake() view returns (uint256)',
    'function currentEpoch() view returns (uint256)',
]);

export interface ValidatorContractInfo {
    stake: bigint;
    selfStake: bigint;
    delegatedStake: bigint;
    commission: number;
    shares: bigint;
    deposit: bigint;
    withdrawal: bigint;
    live: boolean;
    banned: boolean;
    moniker: string;
    website: string;
    logoUri: string;
    uptime: number;
    missedBlocks: number;
    blocksProduced: number;
    consensusScore: number;
    appealSuccessRate: number;
}

export async function getActiveValidatorAddresses(network: NetworkConfig = DEFAULT_NETWORK): Promise<Address[]> {
    const client = getViemClient(network);
    const stakingAddress = network.chainConfig.stakingContract.address as Address;

    try {
        const validators = await client.readContract({
            address: stakingAddress,
            abi: STAKING_ABI,
            functionName: 'activeValidators',
        }) as Address[];

        // Filter out zero addresses
        return validators.filter(addr => addr !== '0x0000000000000000000000000000000000000000');
    } catch (error) {
        console.error('[Viem] Error fetching active validators:', error);
        throw error;
    }
}

export async function getValidatorContractInfo(
    validatorAddress: Address,
    network: NetworkConfig = DEFAULT_NETWORK
): Promise<ValidatorContractInfo> {
    try {
        const activeValidators = await getActiveValidatorAddresses(network);
        const isActive = activeValidators.includes(validatorAddress);

        // Simulated data for demonstration since we don't have all getter functions yet
        // In a real environment, we would call individual contract functions for each field.
        // We Use the address as a seed for deterministic simulated values
        const seed = parseInt(validatorAddress.slice(2, 10), 16);
        const selfStakeSim = BigInt(42000 + (seed % 10000)) * BigInt(1e18);
        const delegatedStakeSim = BigInt(seed % 50000) * BigInt(1e18);
        const totalStakeSim = selfStakeSim + delegatedStakeSim;

        const uptimeSim = 95 + (seed % 500) / 100; // 95% - 100%
        const missedSim = seed % 15;
        const producedSim = 1000 + (seed % 5000);
        const commissionSim = 5 + (seed % 10); // 5% - 15%
        const scoreSim = 80 + (seed % 20); // 80 - 100

        return {
            stake: totalStakeSim,
            selfStake: selfStakeSim,
            delegatedStake: delegatedStakeSim,
            commission: commissionSim,
            shares: totalStakeSim,
            deposit: 0n,
            withdrawal: 0n,
            live: isActive,
            banned: false,
            moniker: '',
            website: '',
            logoUri: '',
            uptime: uptimeSim,
            missedBlocks: missedSim,
            blocksProduced: producedSim,
            consensusScore: scoreSim,
            appealSuccessRate: 98 + (seed % 2),
        };
    } catch (error) {
        console.error(`[Viem] Error fetching validator info for ${validatorAddress}:`, error);
        return {
            stake: 0n,
            selfStake: 0n,
            delegatedStake: 0n,
            commission: 0,
            shares: 0n,
            deposit: 0n,
            withdrawal: 0n,
            live: false,
            banned: false,
            moniker: '',
            website: '',
            logoUri: '',
            uptime: 0,
            missedBlocks: 0,
            blocksProduced: 0,
            consensusScore: 0,
            appealSuccessRate: 0,
        };
    }
}

export async function getEpochNumber(network: NetworkConfig = DEFAULT_NETWORK): Promise<bigint> {
    const client = getViemClient(network);
    const stakingAddress = network.chainConfig.stakingContract.address as Address;

    try {
        const epoch = await client.readContract({
            address: stakingAddress,
            abi: STAKING_ABI,
            functionName: 'currentEpoch',
        }) as bigint;

        return epoch;
    } catch (error) {
        console.warn('[Viem] currentEpoch function not available, using default value');
        return 0n; // Return default if function doesn't exist
    }
}

export async function getValidatorMinStake(network: NetworkConfig = DEFAULT_NETWORK): Promise<bigint> {
    const client = getViemClient(network);
    const stakingAddress = network.chainConfig.stakingContract.address as Address;

    try {
        const minStake = await client.readContract({
            address: stakingAddress,
            abi: STAKING_ABI,
            functionName: 'validatorMinStake',
        }) as bigint;

        return minStake;
    } catch (error) {
        console.warn('[Viem] validatorMinStake function not available, using default value');
        return 0n; // Return default if function doesn't exist
    }
}

export async function getBlockNumber(network: NetworkConfig = DEFAULT_NETWORK): Promise<bigint> {
    const client = getViemClient(network);

    try {
        const blockNumber = await client.getBlockNumber();
        return blockNumber;
    } catch (error) {
        console.error('[Viem] Error fetching block number:', error);
        throw error;
    }
}
