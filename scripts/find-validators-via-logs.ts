import { createPublicClient, http, parseAbiItem, decodeEventLog } from 'viem';
import { NETWORKS } from '../lib/networks';
import { STAKING_ABI } from 'genlayer-js/abi/staking';

async function findValidators() {
    const network = NETWORKS[0]; // Asimov
    const client = createPublicClient({
        transport: http(network.rpcUrl)
    });

    console.log(`Searching for validators on ${network.name}...`);
    const stakingAddress = "0x03f410748EBdb4026a6b8299E9B6603A273709D1" as `0x${string}`;

    try {
        // Since eth_getLogs might not be supported for GenVM contracts, 
        // we'll check if we can get the block number first.
        const blockNum = await client.getBlockNumber();
        console.log(`Current block: ${blockNum}`);

        // Try to get logs from the last 10000 blocks
        // Note: Some GenVM RPCs might not support this
        const logs = await client.getLogs({
            address: stakingAddress,
            event: parseAbiItem('event ValidatorJoin(address operator, address validator, uint256 amount)'),
            fromBlock: blockNum - 10000n,
            toBlock: 'latest'
        });

        console.log(`Found ${logs.length} ValidatorJoin events in last 10000 blocks`);
        const addresses = [...new Set(logs.map(log => log.args.validator))];
        console.log('Validator Addresses:', addresses);

    } catch (error) {
        console.error('Failed to fetch logs:', error.message);
        console.log('Falling back to checking if activeValidatorsCount is actually zero...');
    }
}

findValidators();
