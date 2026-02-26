import { createPublicClient, http, parseAbi, type Address, parseAbiItem } from 'viem';
import { NetworkConfig, DEFAULT_NETWORK } from './networks';
import { getGenLayerClient } from './genlayer-client';
import { GENLAYER_CONFIG } from '@/config/genlayer';

// Genesis block for asimov network or discovery start
export const DISCOVERY_START_BLOCK = GENLAYER_CONFIG.asimov.discoveryStartBlock;

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

        // Filter out zero addresses and normalize to lowercase
        return validators
            .filter(addr => addr !== '0x0000000000000000000000000000000000000000')
            .map(addr => addr.toLowerCase() as Address);
    } catch (error) {
        console.error('[Viem] Error fetching active validators:', error);
        throw error;
    }
}

/**
 * Discovers all validators by scanning for ValidatorJoin events.
 * This includes both active and inactive/pending validators.
 */
export async function getAllValidatorAddresses(network: NetworkConfig = DEFAULT_NETWORK): Promise<Address[]> {
    const client = getViemClient(network);
    const stakingAddress = network.chainConfig.stakingContract.address as Address;

    try {
        const currentBlock = await client.getBlockNumber();
        const validators = new Set<string>();

        const logs = await client.getLogs({
            address: stakingAddress,
            event: parseAbiItem('event ValidatorJoin(address operator, address validator, uint256 amount)'),
            fromBlock: DISCOVERY_START_BLOCK,
            toBlock: currentBlock
        });

        logs.forEach(log => {
            if (log.args.validator) {
                validators.add(log.args.validator.toLowerCase());
            }
        });

        return Array.from(validators) as Address[];
    } catch (error) {
        console.error('[Viem] Error discovered validators via logs:', error);
        // Fallback to active addresses if discovery fails
        return getActiveValidatorAddresses(network);
    }
}

export async function getValidatorContractInfo(
    validatorAddress: Address,
    network: NetworkConfig = DEFAULT_NETWORK,
    activeAddresses?: Address[]
): Promise<ValidatorContractInfo> {
    try {
        const activeSet = activeAddresses || await getActiveValidatorAddresses(network);
        const isActive = activeSet.some(a => a.toLowerCase() === validatorAddress.toLowerCase());

        // Gerçek validator verisini GenLayer Node API üzerinden al
        const client = getGenLayerClient(network);
        const rawInfo: any = await (client as any).getValidatorInfo(validatorAddress);

        // BigInt alanları güvenli şekilde parse et
        const toBigInt = (v: any): bigint => {
            if (typeof v === 'bigint') return v;
            if (typeof v === 'number') return BigInt(v);
            if (typeof v === 'string' && v !== '') return BigInt(v);
            return 0n;
        };

        const stake = toBigInt(rawInfo.vStakeRaw ?? rawInfo.stake ?? 0);
        const selfStake = toBigInt(rawInfo.selfStakeRaw ?? rawInfo.selfStake ?? 0);
        const delegatedStake = toBigInt(rawInfo.delegatedStakeRaw ?? rawInfo.delegatedStake ?? 0);
        const shares = toBigInt(rawInfo.sharesRaw ?? rawInfo.shares ?? stake);
        const deposit = toBigInt(rawInfo.pendingDepositsRaw ?? rawInfo.deposit ?? 0);
        const withdrawal = toBigInt(rawInfo.pendingWithdrawalsRaw ?? rawInfo.withdrawal ?? 0);

        return {
            stake,
            selfStake,
            delegatedStake,
            commission: Number(rawInfo.commission ?? 0),
            shares,
            deposit,
            withdrawal,
            live: Boolean(rawInfo.live ?? isActive),
            banned: Boolean(rawInfo.banned ?? false),
            moniker: rawInfo.moniker || '',
            website: rawInfo.website || '',
            logoUri: rawInfo.logoUri || '',
            uptime: Number(rawInfo.uptime ?? 0),
            missedBlocks: Number(rawInfo.missedBlocks ?? 0),
            blocksProduced: Number(rawInfo.blocksProduced ?? 0),
            consensusScore: Number(rawInfo.consensusScore ?? 0),
            appealSuccessRate: Number(rawInfo.appealSuccessRate ?? 0),
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
