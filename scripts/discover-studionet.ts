import { NETWORKS } from '../lib/networks';

async function discover() {
    const network = NETWORKS.find(n => n.id === 'studionet');
    if (!network) return;

    console.log(`Discovering contracts for ${network.name}...`);

    const contracts = ['ConsensusMain', 'ConsensusData', 'GenStaking', 'GenTransactions', 'GenMessages'];

    for (const name of contracts) {
        try {
            const response = await fetch(network.rpcUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    id: Date.now(),
                    method: "sim_getConsensusContract",
                    params: [name],
                }),
            });
            const data = await response.json();
            console.log(`${name}:`, data.result?.address || 'Not found');
        } catch (error) {
            console.error(`Failed to fetch ${name}:`, error.message);
        }
    }
}

discover();
