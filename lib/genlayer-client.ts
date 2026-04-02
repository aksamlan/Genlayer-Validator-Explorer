import { NetworkConfig, DEFAULT_NETWORK } from './networks';

// Simple HTTP JSON-RPC helper for GenLayer node methods
export async function genLayerRequest(
    method: string,
    params: any,
    rpcUrl: string
): Promise<any> {
    const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 }),
    });
    const data = await response.json();
    if (data.error) {
        throw new Error(data.error.message || 'RPC error');
    }
    return data.result;
}

// Stub GenLayer client - validator info is now fetched directly via viem from EVM contracts
export function getGenLayerClient(network: NetworkConfig = DEFAULT_NETWORK) {
    return {
        endpoint: network.rpcUrl,
        // getValidatorInfo is no longer used - viem reads from staking contract directly
        getValidatorInfo: async (validatorAddress: string) => {
            throw new Error('Use getValidatorContractInfo from viem-client instead');
        },
    };
}
