import { createPublicClient, http, parseAbi, type Address, type Abi } from 'viem';
import { NetworkConfig, DEFAULT_NETWORK } from './networks';
import { GENLAYER_CONFIG } from '@/config/genlayer';

export const DISCOVERY_START_BLOCK = GENLAYER_CONFIG.rallyTestnet.discoveryStartBlock;

// Cache for EVM client instances (uses evmRpcUrl)
const clients: Record<string, ReturnType<typeof createPublicClient>> = {};

export function getViemClient(network: NetworkConfig = DEFAULT_NETWORK) {
    const rpcUrl = network.evmRpcUrl || network.rpcUrl;
    const cacheKey = `${network.id}:${rpcUrl}`;

    if (!clients[cacheKey]) {
        console.log(`[Viem] Initializing EVM client for network: ${network.name} (${rpcUrl})`);

        clients[cacheKey] = createPublicClient({
            transport: http(rpcUrl, {
                timeout: 30_000,
            })
        });

        console.log(`[Viem] EVM client for ${network.id} created successfully`);
    }
    return clients[cacheKey];
}

// Updated Staking ABI - matches the new staking contract on ZKSync OS Testnet
export const STAKING_ABI = parseAbi([
    'function activeValidators() view returns (address[])',
    'function activeValidatorsCount() view returns (uint256)',
    'function validatorMinStake() view returns (uint256)',
    'function epoch() view returns (uint256)',
]);

// Extended staking ABI for validatorView (using object format for tuple support)
export const STAKING_ABI_EXTENDED = [
    {
        name: 'activeValidators',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'address[]' }],
    },
    {
        name: 'validatorMinStake',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
    },
    {
        name: 'epoch',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
    },
    {
        name: 'isValidator',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: '_validator', type: 'address' }],
        outputs: [{ name: '', type: 'bool' }],
    },
    {
        name: 'validatorView',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: '_validator', type: 'address' }],
        outputs: [
            {
                name: '',
                type: 'tuple',
                components: [
                    { name: 'left', type: 'address' },
                    { name: 'right', type: 'address' },
                    { name: 'parent', type: 'address' },
                    { name: 'eBanned', type: 'uint256' },
                    { name: 'ePrimed', type: 'uint256' },
                    { name: 'vStake', type: 'uint256' },
                    { name: 'vShares', type: 'uint256' },
                    { name: 'dStake', type: 'uint256' },
                    { name: 'dShares', type: 'uint256' },
                    { name: 'vDeposit', type: 'uint256' },
                    { name: 'vWithdrawal', type: 'uint256' },
                    { name: 'live', type: 'bool' },
                ],
            },
        ],
    },
] as const satisfies Abi;

// Validator Wallet ABI for identity info
export const VALIDATOR_WALLET_ABI = [
    {
        name: 'getIdentity',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [
            {
                name: '',
                type: 'tuple',
                components: [
                    { name: 'moniker', type: 'string' },
                    { name: 'logoUri', type: 'string' },
                    { name: 'website', type: 'string' },
                    { name: 'description', type: 'string' },
                    { name: 'email', type: 'string' },
                    { name: 'twitter', type: 'string' },
                    { name: 'telegram', type: 'string' },
                    { name: 'github', type: 'string' },
                    { name: 'extraCid', type: 'bytes' },
                ],
            },
        ],
    },
    {
        name: 'operator',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'address' }],
    },
    {
        name: 'owner',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'address' }],
    },
] as const satisfies Abi;

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

        return validators
            .filter(addr => addr !== '0x0000000000000000000000000000000000000000')
            .map(addr => addr.toLowerCase() as Address);
    } catch (error) {
        console.error('[Viem] Error fetching active validators:', error);
        throw error;
    }
}

/**
 * Returns all known validators.
 * Uses activeValidators() directly since the EVM RPC has log range limits.
 */
export async function getAllValidatorAddresses(network: NetworkConfig = DEFAULT_NETWORK): Promise<Address[]> {
    return getActiveValidatorAddresses(network);
}

export async function getValidatorContractInfo(
    validatorAddress: Address,
    network: NetworkConfig = DEFAULT_NETWORK,
    activeAddresses?: Address[]
): Promise<ValidatorContractInfo> {
    try {
        const client = getViemClient(network);
        const stakingAddress = network.chainConfig.stakingContract.address as Address;

        const activeSet = activeAddresses || await getActiveValidatorAddresses(network);
        const isActive = activeSet.some(a => a.toLowerCase() === validatorAddress.toLowerCase());

        // Read validatorView from staking contract
        let view: any = null;
        try {
            view = await client.readContract({
                address: stakingAddress,
                abi: STAKING_ABI_EXTENDED,
                functionName: 'validatorView',
                args: [validatorAddress],
            });
        } catch (e) {
            console.warn(`[Viem] validatorView failed for ${validatorAddress}:`, e);
        }

        // Read identity from validator wallet contract
        let identity: any = null;
        try {
            identity = await client.readContract({
                address: validatorAddress,
                abi: VALIDATOR_WALLET_ABI,
                functionName: 'getIdentity',
            });
        } catch (e) {
            // Many wallets may not have identity set - this is expected
        }

        const stake = view ? BigInt(view.vStake ?? 0) : 0n;
        const delegatedStake = view ? BigInt(view.dStake ?? 0) : 0n;
        const shares = view ? BigInt(view.vShares ?? 0) : 0n;
        const deposit = view ? BigInt(view.vDeposit ?? 0) : 0n;
        const withdrawal = view ? BigInt(view.vWithdrawal ?? 0) : 0n;
        // isActive comes from activeValidators() — the authoritative source for active status.
        // view.live is a separate contract flag and does NOT reliably reflect active set membership.
        const live = isActive;
        const banned = view ? BigInt(view.eBanned ?? 0) > 0n : false;

        return {
            stake,
            selfStake: stake,
            delegatedStake,
            commission: 0,
            shares,
            deposit,
            withdrawal,
            live,
            banned,
            moniker: identity?.moniker || '',
            website: identity?.website || '',
            logoUri: identity?.logoUri || '',
            uptime: 0,
            missedBlocks: 0,
            blocksProduced: 0,
            consensusScore: 0,
            appealSuccessRate: 0,
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
            functionName: 'epoch',
        }) as bigint;

        return epoch;
    } catch (error) {
        console.warn('[Viem] epoch() not available, using default');
        return 0n;
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
        console.warn('[Viem] validatorMinStake() not available, using default');
        return 0n;
    }
}

export async function getBlockNumber(network: NetworkConfig = DEFAULT_NETWORK): Promise<bigint> {
    const client = getViemClient(network);

    try {
        return await client.getBlockNumber();
    } catch (error) {
        console.error('[Viem] Error fetching block number:', error);
        throw error;
    }
}
