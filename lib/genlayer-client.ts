import { createClient } from "genlayer-js";
import { NetworkConfig, DEFAULT_NETWORK } from "./networks";

// Cache for client instances
const clients: Record<string, ReturnType<typeof createClient>> = {};

export function getGenLayerClient(network: NetworkConfig = DEFAULT_NETWORK) {
    if (!clients[network.id]) {
        console.log(`[GenLayer] Initializing client for network: ${network.name} (${network.rpcUrl})`);

        try {
            if (!network.rpcUrl) {
                throw new Error(`RPC URL not configured for network ${network.id}`);
            }

            if (!network.chainConfig) {
                throw new Error(`Chain config not found for network ${network.id}`);
            }

            clients[network.id] = createClient({
                chain: network.chainConfig,
                endpoint: network.rpcUrl,
            });

            console.log(`[GenLayer] Client for ${network.id} created successfully`);
        } catch (error) {
            console.error(`[GenLayer] Error creating client for ${network.id}:`, error);
            console.error(`[GenLayer] Network config:`, {
                id: network.id,
                name: network.name,
                rpcUrl: network.rpcUrl,
                hasChainConfig: !!network.chainConfig
            });
            throw error;
        }
    }
    return clients[network.id];
}
