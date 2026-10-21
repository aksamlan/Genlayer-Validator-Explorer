import { createPublicClient, parseAbi, type Address, type Abi } from 'viem';
import { throttledHttp } from './rpc-transport';
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
            transport: throttledHttp(rpcUrl)
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

// Staking ABI for v0.6 deployments (Bradbury Phase 2+), taken from
// genlayer-js@2.0.0-rc.2. activeValidators() is gone (selectableValidators()
// replaces it), the joined registry is paginated, and validatorView dropped the
// tree pointers + live flag in favour of hasUnclaimedRewards.
const EPOCH_DATA_OUTPUTS = [
    { name: 'start', type: 'uint256' },
    { name: 'end', type: 'uint256' },
    { name: 'inflation', type: 'uint256' },
    { name: 'weight', type: 'uint256' },
    { name: 'weightDeposit', type: 'uint256' },
    { name: 'weightWithdrawal', type: 'uint256' },
    { name: 'vcount', type: 'uint256' },
    { name: 'claimed', type: 'uint256' },
    { name: 'stakeDeposit', type: 'uint256' },
    { name: 'stakeWithdrawal', type: 'uint256' },
    { name: 'slashed', type: 'uint256' },
] as const;

export const STAKING_V06_ABI = [
    { name: 'epoch', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
    { name: 'finalized', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
    { name: 'validatorMinStake', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
    { name: 'delegatorMinStake', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
    { name: 'epochMinDuration', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
    { name: 'epochZeroMinDuration', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
    { name: 'selectableValidators', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'address[]' }] },
    { name: 'validatorsJoinedCount', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
    { name: 'getValidatorQuarantineList', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'address[]' }] },
    { name: 'epochOdd', type: 'function', stateMutability: 'view', inputs: [], outputs: EPOCH_DATA_OUTPUTS },
    { name: 'epochEven', type: 'function', stateMutability: 'view', inputs: [], outputs: EPOCH_DATA_OUTPUTS },
    {
        name: 'getValidatorsJoined',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: '_startIndex', type: 'uint256' }, { name: '_pageSize', type: 'uint256' }],
        outputs: [{ name: '', type: 'address[]' }],
    },
    {
        name: 'getAllBannedValidators',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: '_startIndex', type: 'uint256' }, { name: '_size', type: 'uint256' }],
        outputs: [
            {
                name: 'validatorList',
                type: 'tuple[]',
                components: [
                    { name: 'validator', type: 'address' },
                    { name: 'untilEpochBanned', type: 'uint256' },
                    { name: 'permanentlyBanned', type: 'bool' },
                ],
            },
        ],
    },
    {
        name: 'isValidatorBanned',
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
                    { name: 'eBanned', type: 'uint256' },
                    { name: 'ePrimed', type: 'uint256' },
                    { name: 'vStake', type: 'uint256' },
                    { name: 'vShares', type: 'uint256' },
                    { name: 'dStake', type: 'uint256' },
                    { name: 'dShares', type: 'uint256' },
                    { name: 'vDeposit', type: 'uint256' },
                    { name: 'vWithdrawal', type: 'uint256' },
                    { name: 'hasUnclaimedRewards', type: 'bool' },
                ],
            },
        ],
    },
] as const satisfies Abi;

const JOINED_PAGE_SIZE = 100n;

const isV06 = (network: NetworkConfig) => network.stakingVersion === 'v0.6';

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
    delegatedShares: bigint;
    live: boolean;
    banned: boolean;
    bannedEpoch: bigint;
    primedEpoch: bigint;
    moniker: string;
    website: string;
    logoUri: string;
    description: string;
    email: string;
    twitter: string;
    telegram: string;
    github: string;
    operator: string;
    owner: string;
    leftNode: string;
    rightNode: string;
    parentNode: string;
    uptime: number;
    missedBlocks: number;
    blocksProduced: number;
    consensusScore: number;
    appealSuccessRate: number;
    // v0.6 only
    hasUnclaimedRewards?: boolean;
    quarantined?: boolean;
    pending?: boolean;
}

/** Shared per-refresh reads so per-validator lookups don't repeat them. */
export interface ValidatorReadContext {
    quarantined?: Set<string>;
    banned?: Set<string>;
    minStake?: bigint;
}

// Wallet identity/owner/operator change rarely; caching them keeps a refresh to
// one staking read per validator, which matters on rate-limited RPCs.
const WALLET_TTL_MS = 10 * 60_000;
const walletCache = new Map<string, { at: number; value: Promise<WalletInfo> }>();

interface WalletInfo {
    identity: any;
    operator: string;
    owner: string;
}

function readWalletCached(network: NetworkConfig, validatorAddress: Address): Promise<WalletInfo> {
    const key = `${network.id}:${validatorAddress.toLowerCase()}`;
    const hit = walletCache.get(key);
    if (hit && Date.now() - hit.at < WALLET_TTL_MS) return hit.value;

    const client = getViemClient(network);
    // Track real failures (e.g. 429 after retries) separately from an identity
    // that is simply empty: an empty result may be cached, a failed one must not
    // be, or the validator would show as unnamed for the whole TTL.
    let failed = false;
    const soft = <T,>(p: Promise<T>, fallback: T) => p.catch(() => { failed = true; return fallback; });
    const value = Promise.all([
        soft(client.readContract({ address: validatorAddress, abi: VALIDATOR_WALLET_ABI, functionName: 'getIdentity' }), null),
        soft(client.readContract({ address: validatorAddress, abi: VALIDATOR_WALLET_ABI, functionName: 'operator' }), ''),
        soft(client.readContract({ address: validatorAddress, abi: VALIDATOR_WALLET_ABI, functionName: 'owner' }), ''),
    ]).then(([identity, operator, owner]) => ({
        identity,
        operator: String(operator).toLowerCase(),
        owner: String(owner).toLowerCase(),
    }));
    walletCache.set(key, { at: Date.now(), value });
    value.then(() => { if (failed) walletCache.delete(key); });
    return value;
}

export async function getActiveValidatorAddresses(network: NetworkConfig = DEFAULT_NETWORK): Promise<Address[]> {
    const client = getViemClient(network);
    const stakingAddress = network.chainConfig.stakingContract.address as Address;

    try {
        const validators = (isV06(network)
            ? await client.readContract({
                address: stakingAddress,
                abi: STAKING_V06_ABI,
                functionName: 'selectableValidators',
            })
            : await client.readContract({
                address: stakingAddress,
                abi: STAKING_ABI,
                functionName: 'activeValidators',
            })) as readonly Address[];

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
 * v0.6 exposes the append-only joined registry, so every validator that joined
 * is listed — not just the selectable set (which is empty during epoch 0).
 * v0.5 has no such registry and the EVM RPC limits log ranges, so it falls back
 * to the active set.
 */
export async function getAllValidatorAddresses(network: NetworkConfig = DEFAULT_NETWORK): Promise<Address[]> {
    if (!isV06(network)) return getActiveValidatorAddresses(network);

    const client = getViemClient(network);
    const stakingAddress = network.chainConfig.stakingContract.address as Address;
    const total = await client.readContract({
        address: stakingAddress,
        abi: STAKING_V06_ABI,
        functionName: 'validatorsJoinedCount',
    });
    const out: Address[] = [];
    for (let start = 0n; start < total; start += JOINED_PAGE_SIZE) {
        const page = await client.readContract({
            address: stakingAddress,
            abi: STAKING_V06_ABI,
            functionName: 'getValidatorsJoined',
            args: [start, JOINED_PAGE_SIZE],
        });
        if (page.length === 0) break;
        out.push(...page);
    }
    return Array.from(new Set(
        out
            .filter(addr => addr !== '0x0000000000000000000000000000000000000000')
            .map(addr => addr.toLowerCase() as Address)
    ));
}

export async function getValidatorContractInfo(
    validatorAddress: Address,
    network: NetworkConfig = DEFAULT_NETWORK,
    activeAddresses?: Address[],
    ctx: ValidatorReadContext = {}
): Promise<ValidatorContractInfo> {
    if (isV06(network)) return getValidatorContractInfoV06(validatorAddress, network, activeAddresses, ctx);
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

        // Read identity + operator + owner from validator wallet contract in parallel
        const [identityRes, operatorRes, ownerRes] = await Promise.allSettled([
            client.readContract({
                address: validatorAddress,
                abi: VALIDATOR_WALLET_ABI,
                functionName: 'getIdentity',
            }),
            client.readContract({
                address: validatorAddress,
                abi: VALIDATOR_WALLET_ABI,
                functionName: 'operator',
            }),
            client.readContract({
                address: validatorAddress,
                abi: VALIDATOR_WALLET_ABI,
                functionName: 'owner',
            }),
        ]);
        const identity: any = identityRes.status === 'fulfilled' ? identityRes.value : null;
        const operator = operatorRes.status === 'fulfilled' ? String(operatorRes.value).toLowerCase() : '';
        const owner = ownerRes.status === 'fulfilled' ? String(ownerRes.value).toLowerCase() : '';

        const stake = view ? BigInt(view.vStake ?? 0) : 0n;
        const delegatedStake = view ? BigInt(view.dStake ?? 0) : 0n;
        const shares = view ? BigInt(view.vShares ?? 0) : 0n;
        const delegatedShares = view ? BigInt(view.dShares ?? 0) : 0n;
        const deposit = view ? BigInt(view.vDeposit ?? 0) : 0n;
        const withdrawal = view ? BigInt(view.vWithdrawal ?? 0) : 0n;
        const bannedEpoch = view ? BigInt(view.eBanned ?? 0) : 0n;
        const primedEpoch = view ? BigInt(view.ePrimed ?? 0) : 0n;
        // isActive comes from activeValidators() — the authoritative source for active status.
        // view.live is a separate contract flag and does NOT reliably reflect active set membership.
        const live = isActive;
        const banned = bannedEpoch > 0n;

        return {
            stake,
            selfStake: stake,
            delegatedStake,
            commission: 0,
            shares,
            delegatedShares,
            deposit,
            withdrawal,
            live,
            banned,
            bannedEpoch,
            primedEpoch,
            moniker: identity?.moniker || '',
            website: identity?.website || '',
            logoUri: identity?.logoUri || '',
            description: identity?.description || '',
            email: identity?.email || '',
            twitter: identity?.twitter || '',
            telegram: identity?.telegram || '',
            github: identity?.github || '',
            operator,
            owner,
            leftNode: view ? String(view.left).toLowerCase() : '',
            rightNode: view ? String(view.right).toLowerCase() : '',
            parentNode: view ? String(view.parent).toLowerCase() : '',
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
            delegatedShares: 0n,
            deposit: 0n,
            withdrawal: 0n,
            live: false,
            banned: false,
            bannedEpoch: 0n,
            primedEpoch: 0n,
            moniker: '',
            website: '',
            logoUri: '',
            description: '',
            email: '',
            twitter: '',
            telegram: '',
            github: '',
            operator: '',
            owner: '',
            leftNode: '',
            rightNode: '',
            parentNode: '',
            uptime: 0,
            missedBlocks: 0,
            blocksProduced: 0,
            consensusScore: 0,
            appealSuccessRate: 0,
        };
    }
}

async function getValidatorContractInfoV06(
    validatorAddress: Address,
    network: NetworkConfig,
    activeAddresses: Address[] | undefined,
    ctx: ValidatorReadContext
): Promise<ValidatorContractInfo> {
    const client = getViemClient(network);
    const stakingAddress = network.chainConfig.stakingContract.address as Address;
    const addr = validatorAddress.toLowerCase();

    const activeSet = activeAddresses || await getActiveValidatorAddresses(network).catch(() => [] as Address[]);
    const isActive = activeSet.some(a => a.toLowerCase() === addr);

    const [view, bannedRes, minStake, wallet] = await Promise.all([
        client.readContract({ address: stakingAddress, abi: STAKING_V06_ABI, functionName: 'validatorView', args: [validatorAddress] })
            .catch(e => { console.warn(`[Viem] validatorView failed for ${validatorAddress}:`, e.shortMessage ?? e); return null; }),
        ctx.banned
            ? Promise.resolve(ctx.banned.has(addr))
            : client.readContract({ address: stakingAddress, abi: STAKING_V06_ABI, functionName: 'isValidatorBanned', args: [validatorAddress] })
                .catch(() => false),
        ctx.minStake !== undefined ? Promise.resolve(ctx.minStake) : getValidatorMinStake(network),
        readWalletCached(network, validatorAddress),
    ]);

    const identity = wallet.identity;
    const stake = view?.vStake ?? 0n;
    const deposit = view?.vDeposit ?? 0n;
    const banned = Boolean(bannedRes);
    const quarantined = ctx.quarantined?.has(addr) ?? false;
    // Staked (or with a deposit landing) but not yet in the selectable set —
    // the state every validator is in during epoch 0.
    const pending = !isActive && !banned && !quarantined && stake + deposit > 0n && stake + deposit >= minStake;

    return {
        stake,
        selfStake: stake,
        delegatedStake: view?.dStake ?? 0n,
        commission: 0,
        shares: view?.vShares ?? 0n,
        delegatedShares: view?.dShares ?? 0n,
        deposit,
        withdrawal: view?.vWithdrawal ?? 0n,
        live: isActive,
        banned,
        bannedEpoch: banned ? (view?.eBanned ?? 0n) : 0n,
        primedEpoch: view?.ePrimed ?? 0n,
        moniker: identity?.moniker || '',
        website: identity?.website || '',
        logoUri: identity?.logoUri || '',
        description: identity?.description || '',
        email: identity?.email || '',
        twitter: identity?.twitter || '',
        telegram: identity?.telegram || '',
        github: identity?.github || '',
        operator: wallet.operator,
        owner: wallet.owner,
        leftNode: '',
        rightNode: '',
        parentNode: '',
        uptime: 0,
        missedBlocks: 0,
        blocksProduced: 0,
        consensusScore: 0,
        appealSuccessRate: 0,
        hasUnclaimedRewards: view?.hasUnclaimedRewards ?? false,
        quarantined,
        pending,
    };
}

export interface EpochDetails {
    lastFinalizedEpoch: bigint | null;
    epochStart: Date | null;
    nextEpochEstimate: Date | null;
    epochMinDurationSec: number | null;
    inflation: bigint | null;
    delegatorMinStake: bigint | null;
    quarantined: Address[];
    banned: Address[] | null; // null when the list couldn't be read
}

/** Epoch timing, inflation and quarantine list (v0.6). v0.5 returns empty details. */
export async function getEpochDetails(network: NetworkConfig = DEFAULT_NETWORK): Promise<EpochDetails> {
    const empty: EpochDetails = {
        lastFinalizedEpoch: null, epochStart: null, nextEpochEstimate: null,
        epochMinDurationSec: null, inflation: null, delegatorMinStake: null, quarantined: [], banned: null,
    };
    if (!isV06(network)) return empty;

    const client = getViemClient(network);
    const address = network.chainConfig.stakingContract.address as Address;
    const abi = STAKING_V06_ABI;

    try {
        const [epoch, finalized, minDur, zeroMinDur, delMin, odd, even, quarantined, banned] = await Promise.all([
            client.readContract({ address, abi, functionName: 'epoch' }),
            client.readContract({ address, abi, functionName: 'finalized' }),
            client.readContract({ address, abi, functionName: 'epochMinDuration' }),
            client.readContract({ address, abi, functionName: 'epochZeroMinDuration' }),
            client.readContract({ address, abi, functionName: 'delegatorMinStake' }).catch(() => null),
            client.readContract({ address, abi, functionName: 'epochOdd' }),
            client.readContract({ address, abi, functionName: 'epochEven' }),
            client.readContract({ address, abi, functionName: 'getValidatorQuarantineList' }).catch(() => [] as readonly Address[]),
            client.readContract({ address, abi, functionName: 'getAllBannedValidators', args: [0n, 1000n] }).catch(() => null),
        ]);
        // Current and previous epoch alternate between the even/odd slots.
        const [start, end, inflation] = epoch % 2n === 0n ? even : odd;
        const duration = epoch === 0n ? zeroMinDur : minDur;
        return {
            lastFinalizedEpoch: finalized,
            epochStart: start > 0n ? new Date(Number(start) * 1000) : null,
            nextEpochEstimate: end === 0n && start > 0n ? new Date(Number(start + duration) * 1000) : null,
            epochMinDurationSec: Number(duration),
            inflation,
            delegatorMinStake: delMin,
            quarantined: quarantined.map(a => a.toLowerCase() as Address),
            banned: banned ? banned.map(b => b.validator.toLowerCase() as Address) : null,
        };
    } catch (e) {
        console.warn('[Viem] epoch details unavailable:', e);
        return empty;
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
