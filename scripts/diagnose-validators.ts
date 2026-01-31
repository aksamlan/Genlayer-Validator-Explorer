import { getGenLayerClient } from '../lib/genlayer-client';
import { NETWORKS } from '../lib/networks';

async function diagnose() {
    for (const network of NETWORKS) {
        console.log(`\n--- Diagnosing Network: ${network.name} (${network.id}) ---`);
        const client = getGenLayerClient(network);

        try {
            const epoch = await client.getEpochInfo();
            console.log(`[${network.id}] Epoch Info:`, JSON.stringify(epoch, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2));

            const activeValidators = await client.getActiveValidators();
            console.log(`[${network.id}] Active Validators List (Length: ${activeValidators?.length || 0}):`, activeValidators);

            const count = await client.getActiveValidatorsCount();
            console.log(`[${network.id}] Active Validators Count (from count() method): ${count}`);

            try {
                const banned = await client.getBannedValidators();
                console.log(`[${network.id}] Banned Validators (Count: ${banned.length})`);
            } catch (e) {
                console.log(`[${network.id}] Failed to fetch banned validators:`, e.message);
            }

            try {
                const quarantined = await client.getQuarantinedValidators();
                console.log(`[${network.id}] Quarantined Validators (Count: ${quarantined.length})`);
            } catch (e) {
                console.log(`[${network.id}] Failed to fetch quarantined validators:`, e.message);
            }

            if (network.id === 'asimov') {
                // Check a few known indices if possible? 
                // The SDK doesn't have listValidators, but we can try to get info for some addresses if we have them.
            }

        } catch (error: any) {
            console.error(`[${network.id}] Diagnosis failed:`, error.message);
        }
    }
}

diagnose();
