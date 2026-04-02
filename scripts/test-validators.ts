import { getGenLayerClient } from '../lib/genlayer-client';
import { validatorService } from '../lib/validator-service';

async function main() {
    console.log('Testing GenLayer SDK integration...');

    try {
        console.log('Fetching active validators...');
        const validators = await validatorService.getActiveValidators();
        console.log(`Found ${validators.length} active validators`);

        if (validators.length > 0) {
            console.log('Fetching info for first validator:', validators[0]);
            const info = await validatorService.getValidatorInfo(validators[0]);
            console.log('Validator Info:', JSON.stringify(info, null, 2));
        }

        console.log('Fetching network stats...');
        const stats = await validatorService.getNetworkStats();
        console.log('Network Stats Summary:', {
            activeValidators: stats.epochInfo.activeValidators,
            totalValidators: stats.validators.length,
            currentEpoch: stats.epochInfo.currentEpoch,
        });

    } catch (error) {
        console.error('Test failed:', error);
    }
}

main();
