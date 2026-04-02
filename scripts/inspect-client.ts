import { getGenLayerClient } from '../lib/genlayer-client';
import { NETWORKS } from '../lib/networks';

async function inspect() {
    const network = NETWORKS[0];
    const client = getGenLayerClient(network);
    
    console.log('--- Inspecting Client ---');
    console.log('Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(client)));
    console.log('Keys:', Object.keys(client));
    
    try {
        const epoch = await client.getEpochInfo();
        console.log('Epoch info structure:', Object.keys(epoch));
    } catch (e) {}

    try {
        const validators = await client.getActiveValidators();
        if (validators.length > 0) {
            console.log('First validator:', validators[0]);
            // Try to find a way to get details
            console.log('Trying various getValidator methods...');
            const methods = ['getValidator', 'getValidatorInfo', 'getValidatorDetails', 'getValidatorData'];
            for (const m of methods) {
                try {
                    const data = await (client as any)[m](validators[0]);
                    console.log(`Method ${m} success:`, Object.keys(data));
                } catch (e) {
                    // console.log(`Method ${m} failed`);
                }
            }
        }
    } catch (e) {}
}

inspect();
