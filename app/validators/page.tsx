"use client";

import { useEffect, useState } from 'react';
import { validatorService } from '@/lib/validator-service';
import { DEFAULT_NETWORK } from '@/lib/networks';
import type { NetworkStats } from '@/types/validator';
import { ValidatorTable } from '@/components/ValidatorTable';
import { SectionHeader } from '@/components/SectionHeader';
import { StakeDistribution } from '@/components/widgets/StakeDistribution';
import { HeroStats } from '@/components/widgets/HeroStats';
import { getLatestBlockNumber } from '@/lib/explorer-rpc';

export default function ValidatorsPage() {
    const [stats, setStats] = useState<NetworkStats | null>(null);
    const [blockNumber, setBlockNumber] = useState<string>('0');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const tick = async () => {
            try {
                const [s, b] = await Promise.all([
                    validatorService.getNetworkStats(DEFAULT_NETWORK),
                    getLatestBlockNumber().catch(() => null),
                ]);
                if (cancelled) return;
                setStats(s);
                if (b !== null) setBlockNumber(b.toString());
                setLoading(false);
            } catch (e) {
                console.error(e);
                if (!cancelled) setLoading(false);
            }
        };
        tick();
        const id = setInterval(tick, 30_000);
        return () => { cancelled = true; clearInterval(id); };
    }, []);

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <SectionHeader
                accent="primary"
                title="Validators"
                subtitle="The full registry of active, inactive, and banned operators"
            />

            <HeroStats
                epochInfo={stats?.epochInfo ?? null}
                blockNumber={blockNumber}
                isLoading={loading}
            />

            <StakeDistribution validators={stats?.validators ?? []} />

            <ValidatorTable
                validators={stats?.validators ?? []}
                isLoading={loading}
                tokenSymbol="GEN"
            />
        </main>
    );
}
