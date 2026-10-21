/**
 * Snapshots validator identities from earlier testnets (Bradbury Phase 1 and
 * Asimov) into lib/legacy-identities.json.
 *
 * Identities were not carried over to Bradbury Phase 2, so until operators run
 * setIdentity again the explorer falls back to these, matched by operator or
 * owner wallet. The old chain is sunset, so this is a one-off snapshot rather
 * than a live read.
 *
 *   npx tsx scripts/snapshot-legacy-identities.ts
 */
import { writeFileSync } from 'fs';
import { join } from 'path';
import { createPublicClient, http, type Address } from 'viem';
import { STAKING_ABI, VALIDATOR_WALLET_ABI } from '../lib/viem-client';

const OLD_RPC = 'https://zksync-os-testnet-genlayer.zksync.dev';

// Newest first: when an operator appears on both, the newer identity wins.
const SOURCES: { network: string; staking: Address }[] = [
    { network: 'Bradbury Phase 1', staking: '0x4A4449E617F8D10FDeD0b461CadEf83939E821A5' },
    { network: 'Asimov', staking: '0x63Fa5E0bb10fb6fA98F44726C5518223F767687A' },
];

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
    const client = createPublicClient({ transport: http(OLD_RPC, { retryCount: 6, retryDelay: 600 }) });
    const out: LegacyIdentity[] = [];
    const seen = new Set<string>();

    for (const src of SOURCES) {
        const wallets = await client.readContract({
            address: src.staking,
            abi: STAKING_ABI,
            functionName: 'activeValidators',
        }) as Address[];
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

    const file = join(__dirname, '..', 'lib', 'legacy-identities.json');
    writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    console.log(`Wrote ${out.length} identities to ${file}`);
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
