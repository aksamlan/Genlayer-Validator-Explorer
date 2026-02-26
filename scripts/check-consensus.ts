import { createPublicClient, http, parseAbi } from 'viem';
import { NETWORKS } from '../lib/networks';

async function checkConsensus() {
    const network = NETWORKS[0]; // Asimov
    const client = createPublicClient({
        transport: http(network.rpcUrl)
    });

    const consensusAddress = "0x67fd4aC71530FB220E0B7F90668BAF977B88fF07" as `0x${string}`;
    const abi = parseAbi([
        'function getValidatorsForLastRound(bytes32 _tx_id) view returns (address[])',
        'function getLatestAcceptedTransaction(address recipient) view returns (tuple(uint256 currentTimestamp, address sender, address recipient, uint256 numOfInitialValidators, uint256 txSlot, uint256 createdTimestamp, uint256 lastVoteTimestamp, bytes32 randomSeed, uint8 result, bytes txData, bytes txReceipt, tuple(uint8 messageType, address recipient, uint256 value, bytes data, bool onAcceptance)[] messages, uint8 queueType, uint256 queuePosition, address activator, address lastLeader, uint8 status, bytes32 txId, tuple(uint256 activationBlock, uint256 processingBlock, uint256 proposalBlock) readStateBlockRange, uint256 numOfRounds, tuple(uint256 round, uint256 leaderIndex, uint256 votesCommitted, uint256 votesRevealed, uint256 appealBond, uint256 rotationsLeft, uint8 result, address[] roundValidators, bytes32[] validatorVotesHash, uint8[] validatorVotes) lastRound))'
    ]);

    try {
        console.log(`Checking Consensus for ${network.name}...`);

        // Try to get latest transaction to find some validators
        // We can use a zero address for recipient to see if there's any broadcast? 
        // No, let's try to find if there is a way to get active consensus validators.

        const blockNum = await client.getBlockNumber();
        console.log(`Current block: ${blockNum}`);

    } catch (error) {
        console.error('Consensus check failed:', (error as Error).message);
    }
}

checkConsensus();
