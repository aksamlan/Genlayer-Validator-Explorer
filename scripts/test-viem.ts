import { createPublicClient, http, parseAbi } from 'viem';

async function test() {
    const RPC_ENDPOINT = 'https://studio.genlayer.com/api';
    const STAKING_ADDRESS = '0x03f410748EBdb4026a6b8299E9B6603A273709D1';

    const client = createPublicClient({
        transport: http(RPC_ENDPOINT)
    });

    const abi = parseAbi([
        'function activeValidators() view returns (address[])',
        'function activeValidatorsCount() view returns (uint256)',
        'function epoch() view returns (uint256)'
    ]);

    try {
        console.log('Testing endpoint:', RPC_ENDPOINT);
        console.log('Staking address:', STAKING_ADDRESS);

        const count = await client.readContract({
            address: STAKING_ADDRESS,
            abi,
            functionName: 'activeValidatorsCount'
        });
        console.log('Active Validators Count:', count.toString());

        const validators = await client.readContract({
            address: STAKING_ADDRESS,
            abi,
            functionName: 'activeValidators'
        });
        console.log('Active Validators List:', validators);

        const currentEpoch = await client.readContract({
            address: STAKING_ADDRESS,
            abi,
            functionName: 'epoch'
        });
        console.log('Current Epoch:', currentEpoch.toString());

    } catch (error) {
        console.error('Error during test:', error);
    }
}

test();
