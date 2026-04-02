import { createPublicClient, http, encodeFunctionData, parseAbi } from 'viem';
import { ASIMOV_NETWORK } from '../lib/networks';

async function quickCheck() {
    console.log('--- STARTING QUICK CHECK ---');
    console.log('Target RPC:', ASIMOV_NETWORK.rpcUrl);

    const client = createPublicClient({
        transport: http(ASIMOV_NETWORK.rpcUrl)
    });

    try {
        const blockNumber = await client.getBlockNumber();
        console.log('Current Block Number:', blockNumber.toString());

        const stakingAddress = ASIMOV_NETWORK.chainConfig.stakingContract.address;
        console.log('Staking Contract:', stakingAddress);

        // Check active validators count
        const abi = parseAbi(['function activeValidatorsCount() view returns (uint256)']);
        const count = await client.readContract({
            address: stakingAddress as `0x${string}`,
            abi,
            functionName: 'activeValidatorsCount'
        });
        console.log('Active Validators Count:', count.toString());

        // Check active validators list
        const listAbi = parseAbi(['function activeValidators() view returns (address[])']);
        const list = await client.readContract({
            address: stakingAddress as `0x${string}`,
            abi: listAbi,
            functionName: 'activeValidators'
        });
        console.log('Active Validators List Length:', (list as any[]).length);
        const nonZero = (list as any[]).filter(v => v !== '0x0000000000000000000000000000000000000000');
        console.log('Non-zero Validators Count:', nonZero.length);

    } catch (error) {
        console.error('--- CHECK FAILED ---');
        console.error(error);
    }
}

quickCheck();
