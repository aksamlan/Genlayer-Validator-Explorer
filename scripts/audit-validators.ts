import { createPublicClient, http, parseAbiItem, type Address, parseAbi } from 'viem';
import { ASIMOV_NETWORK } from '../lib/networks';
import { getGenLayerClient } from '../lib/genlayer-client';

async function main() {
    const client = createPublicClient({ transport: http(ASIMOV_NETWORK.rpcUrl) });
    const glClient = getGenLayerClient(ASIMOV_NETWORK);
    const stakingAddress = ASIMOV_NETWORK.chainConfig.stakingContract.address as Address;

    console.log('--- Validator Audit ---');

    // 1. Get activeValidators array
    const activeArray = await client.readContract({
        address: stakingAddress,
        abi: parseAbi(['function activeValidators() view returns (address[])']),
        functionName: 'activeValidators',
    }) as Address[];
    const activeSet = new Set(activeArray.map(a => a.toLowerCase()));
    console.log(`Contract activeValidators array size: ${activeArray.length}`);
    const nonZeroActive = activeArray.filter(a => a !== '0x0000000000000000000000000000000000000000');
    console.log(`Non-zero active validators: ${nonZeroActive.length}`);

    // 2. Discover all validators via logs
    const blockNum = await client.getBlockNumber();
    const allKnown = new Set<string>();
    const batchSize = 100000n;
    for (let from = blockNum - 1000000n; from < blockNum; from += batchSize) {
        const to = from + batchSize > blockNum ? blockNum : from + batchSize;
        try {
            const logs = await client.getLogs({
                address: stakingAddress,
                event: parseAbiItem('event ValidatorJoin(address operator, address validator, uint256 amount)'),
                fromBlock: from,
                toBlock: to
            });
            logs.forEach(log => { if (log.args.validator) allKnown.add(log.args.validator.toLowerCase()); });
        } catch (e) { }
    }
    console.log(`Total unique validators ever joint: ${allKnown.size}`);

    // 3. Audit each one
    const minStake = 42000000000000000000000n;
    const results = [];
    for (const addr of allKnown) {
        try {
            const info = await glClient.getValidatorInfo(addr as Address);
            results.push({
                address: addr,
                live: info.live,
                stake: info.vStake,
                stakeRaw: BigInt(info.vStakeRaw || 0),
                inActiveArray: activeSet.has(addr.toLowerCase())
            });
        } catch (e) {
            console.log(`Failed to fetch info for ${addr}`);
        }
    }

    // 4. Report
    console.log('\nQualified but NOT in activeValidators array:');
    const qualifiedMissing = results.filter(r => r.stakeRaw >= minStake && !r.inActiveArray);
    qualifiedMissing.forEach(r => console.log(`- ${r.address} (Stake: ${r.stake}, Live: ${r.live})`));

    console.log('\nIn activeValidators array but NOT LIVE:');
    const ghostActive = results.filter(r => r.inActiveArray && !r.live);
    ghostActive.forEach(r => console.log(`- ${r.address} (Stake: ${r.stake})`));

    console.log('\nLIVE but NOT in activeValidators array:');
    const stealthLive = results.filter(r => r.live && !r.inActiveArray);
    stealthLive.forEach(r => console.log(`- ${r.address} (Stake: ${r.stake})`));

    console.log('\nSummary:');
    console.log(`Total Live: ${results.filter(r => r.live).length}`);
    console.log(`Total Qualified (>42k): ${results.filter(r => r.stakeRaw >= minStake).length}`);
    console.log(`Total In Active Array: ${nonZeroActive.length}`);
}

main().catch(console.error);
