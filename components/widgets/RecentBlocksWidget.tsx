"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Box, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getRecentBlocks } from '@/lib/explorer-rpc';
import { fmtNumber, fmtTimeAgo, gasUsedPct } from '@/lib/format';
import type { Block } from 'viem';
import { truncateAddress } from '@/lib/utils';

const POLL_MS = 12_000;

export function RecentBlocksWidget({ limit = 8 }: { limit?: number }) {
    const [blocks, setBlocks] = useState<Block[] | null>(null);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const tick = async () => {
            try {
                const res = await getRecentBlocks(limit);
                if (!cancelled) {
                    setBlocks(res);
                    setErr(null);
                }
            } catch (e) {
                if (!cancelled) setErr(e instanceof Error ? e.message : 'Failed');
            }
        };

        tick();
        const id = setInterval(tick, POLL_MS);
        return () => { cancelled = true; clearInterval(id); };
    }, [limit]);

    if (err && !blocks) {
        return (
            <Card className="glass border-destructive/20 bg-destructive/5">
                <CardContent className="p-5 text-xs text-destructive">Could not load blocks: {err}</CardContent>
            </Card>
        );
    }

    return (
        <Card className="glass border-white/5 overflow-hidden">
            <div className="divide-y divide-white/5">
                {!blocks ? (
                    Array.from({ length: limit }).map((_, i) => (
                        <div key={i} className="p-4 flex items-center gap-3">
                            <Skeleton className="h-9 w-9 rounded-lg bg-white/5" />
                            <Skeleton className="h-9 flex-1 bg-white/5" />
                        </div>
                    ))
                ) : blocks.length === 0 ? (
                    <div className="p-8 text-center text-xs text-muted-foreground">No blocks yet.</div>
                ) : (
                    blocks.map(b => {
                        const txCount = Array.isArray(b.transactions) ? b.transactions.length : 0;
                        const pct = gasUsedPct(b.gasUsed, b.gasLimit);
                        return (
                            <Link
                                key={b.number?.toString() ?? b.hash}
                                href={`/block/${b.number?.toString()}`}
                                className="flex items-center gap-3 p-3.5 hover:bg-white/[0.03] transition-colors group"
                            >
                                <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                                    <Box className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-xs font-black text-foreground group-hover:text-primary transition-colors">
                                            #{b.number ? fmtNumber(b.number) : '—'}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground/70">
                                            {b.timestamp ? fmtTimeAgo(b.timestamp) : '—'}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between gap-2 mt-0.5">
                                        <p className="text-[10px] font-mono text-muted-foreground/80 truncate">
                                            by {truncateAddress(b.miner)}
                                        </p>
                                        <p className="text-[10px] font-bold text-muted-foreground/80">
                                            {txCount} tx · {pct.toFixed(1)}% gas
                                        </p>
                                    </div>
                                </div>
                                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                            </Link>
                        );
                    })
                )}
            </div>
        </Card>
    );
}
