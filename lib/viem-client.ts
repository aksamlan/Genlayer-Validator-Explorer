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
    shares: bigint;
    deposit: bigint;
    withdrawal: bigint;
    live: boolean;
    banned: boolean;
    moniker: string;
    website: string;
    logoUri: string;
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
    // For now, return basic info since we don't have individual getter functions
    // The contract likely stores this data differently
    try {
        // We can at least verify the validator exists in the active list
        const activeValidators = await getActiveValidatorAddresses(network);
        const isActive = activeValidators.includes(validatorAddress);

        return {
            stake: 0n, // Will need to fetch from contract if available
            shares: 0n,
            deposit: 0n,
            withdrawal: 0n,
            live: isActive,
            banned: false,
            moniker: '', // Will be empty for now
            website: '',
            logoUri: '',
        };
    } catch (error) {
        console.error(`[Viem] Error fetching validator info for ${validatorAddress}:`, error);
        return {
            stake: 0n,
            shares: 0n,
            deposit: 0n,
            withdrawal: 0n,
            live: false,
            banned: false,
            moniker: '',
            website: '',
            logoUri: '',
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
