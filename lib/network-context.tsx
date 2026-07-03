"use client";

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
    NetworkConfig,
    NETWORKS,
    DEFAULT_NETWORK,
    getNetworkById,
} from '@/lib/networks';

const STORAGE_KEY = 'genlayer-explorer:network';

interface NetworkContextValue {
    network: NetworkConfig;
    networks: NetworkConfig[];
    setNetwork: (id: string) => void;
}

const NetworkContext = createContext<NetworkContextValue | null>(null);

export function NetworkProvider({ children }: { children: React.ReactNode }) {
    const [networkId, setNetworkId] = useState<string>(DEFAULT_NETWORK.id);

    // Hydrate the saved selection after mount (avoids SSR/client mismatch).
    useEffect(() => {
        try {
            const saved = window.localStorage.getItem(STORAGE_KEY);
            if (saved && saved !== networkId) setNetworkId(getNetworkById(saved).id);
        } catch { /* localStorage unavailable — keep default */ }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const setNetwork = (id: string) => {
        const next = getNetworkById(id);
        setNetworkId(next.id);
        try { window.localStorage.setItem(STORAGE_KEY, next.id); } catch { /* ignore */ }
    };

    const value = useMemo<NetworkContextValue>(() => ({
        network: getNetworkById(networkId),
        networks: NETWORKS,
        setNetwork,
    }), [networkId]);

    return (
        <NetworkContext.Provider value={value}>
            {children}
        </NetworkContext.Provider>
    );
}

export function useNetwork(): NetworkContextValue {
    const ctx = useContext(NetworkContext);
    if (!ctx) {
        // Safe fallback so components used outside the provider still render.
        return { network: DEFAULT_NETWORK, networks: NETWORKS, setNetwork: () => {} };
    }
    return ctx;
}
