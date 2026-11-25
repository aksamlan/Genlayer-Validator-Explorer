/**
 * Snapshots validator identities from earlier testnets (Bradbury Phase 2,
 * Bradbury Phase 1 and Asimov) into lib/legacy-identities.json.
 *
 * Identities are not carried over between phases, so until operators run
 * setIdentity again the explorer falls back to these, matched by operator or
 * owner wallet. Earlier deployments are retired, so this is a one-off snapshot
 * rather than a live read.
 *
 * Sources whose chain is no longer reachable are kept from the existing file
 * instead of failing the run.
 *
 *   npx tsx scripts/snapshot-legacy-identities.ts
 */
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { createPublicClient, http, type Address, type PublicClient } from 'viem';
import { STAKING_ABI, STAKING_V06_ABI, VALIDATOR_WALLET_ABI } from '../lib/viem-client';

const OLD_RPC = 'https://zksync-os-testnet-genlayer.zksync.dev';
const BRADBURY_RPC = 'https://rpc.testnet-chain.genlayer.com';

// Newest first: when an operator appears on several, the newer identity wins.
const SOURCES: { network: string; staking: Address; rpc: string; v06?: boolean }[] = [
    { network: 'Bradbury Phase 2', staking: '0xD8fBa96C0dBB0257028dBc0107060b958e5c7113', rpc: BRADBURY_RPC, v06: true },
    { network: 'Bradbury Phase 1', staking: '0x4A4449E617F8D10FDeD0b461CadEf83939E821A5', rpc: OLD_RPC },
    { network: 'Asimov', staking: '0x63Fa5E0bb10fb6fA98F44726C5518223F767687A', rpc: OLD_RPC },
];

async function listWallets(client: PublicClient, src: (typeof SOURCES)[number]): Promise<Address[]> {
    if (!src.v06) {
        return await client.readContract({
            address: src.staking,
            abi: STAKING_ABI,
            functionName: 'activeValidators',
        }) as Address[];
    }
    // v0.6: every validator that ever joined, not only the active set.
    const count = Number(await client.readContract({
        address: src.staking, abi: STAKING_V06_ABI, functionName: 'validatorsJoinedCount',
    }));
    const out: Address[] = [];
    for (let i = 0; i < count; i += 100) {
        const page = await client.readContract({
            address: src.staking, abi: STAKING_V06_ABI, functionName: 'getValidatorsJoined',
            args: [BigInt(i), 100n],
        }) as Address[];
        out.push(...page);
    }
    return out;
}

export interface LegacyIdentity {
    network: string;
    wallet: string;
    owner: string;
    operator: string;
    moniker: string;
    logoUri: string;
    website: string;
    description: string;
    email: string;
    twitter: string;
    telegram: string;
    github: string;
}

async function main() {
    const file = join(__dirname, '..', 'lib', 'legacy-identities.json');
    const previous: LegacyIdentity[] = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : [];
    const out: LegacyIdentity[] = [];
    const seen = new Set<string>();

    for (const src of SOURCES) {
        const client = createPublicClient({ transport: http(src.rpc, { retryCount: 2, retryDelay: 600 }) }) as PublicClient;
        let wallets: Address[];
        try {
            wallets = await listWallets(client, src);
        } catch {
            const kept = previous.filter(p => p.network === src.network);
            console.log(`${src.network}: unreachable, keeping ${kept.length} from the existing file`);
            for (const p of kept) {
                if (seen.has(p.operator) || seen.has(p.owner)) continue;
                seen.add(p.operator);
                seen.add(p.owner);
                out.push(p);
            }
            continue;
        }
        console.log(`${src.network}: ${wallets.length} validators`);

        for (const wallet of wallets) {
            const [identity, owner, operator] = await Promise.all([
                client.readContract({ address: wallet, abi: VALIDATOR_WALLET_ABI, functionName: 'getIdentity' }).catch(() => null),
                client.readContract({ address: wallet, abi: VALIDATOR_WALLET_ABI, functionName: 'owner' }).catch(() => ''),
                client.readContract({ address: wallet, abi: VALIDATOR_WALLET_ABI, functionName: 'operator' }).catch(() => ''),
            ]);
            const id = identity as any;
            if (!id?.moniker) continue;

            const op = String(operator).toLowerCase();
            const ow = String(owner).toLowerCase();
            if (seen.has(op) || seen.has(ow)) continue; // newer network already has them
            seen.add(op);
            seen.add(ow);

            out.push({
                network: src.network,
                wallet: wallet.toLowerCase(),
                owner: ow,
                operator: op,
                moniker: id.moniker,
                logoUri: id.logoUri || '',
                website: id.website || '',
                description: id.description || '',
                email: id.email || '',
                twitter: id.twitter || '',
                telegram: id.telegram || '',
                github: id.github || '',
            });
        }
    }

    writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    console.log(`Wrote ${out.length} identities to ${file}`);
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
