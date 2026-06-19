"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Layers, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getRecentTransactions } from '@/lib/explorer-rpc';
import { fmtEther, fmtHexShort, fmtTimeAgo } from '@/lib/format';

const POLL_MS = 12_000;

interface TxRow {
    hash: string;
    from: string;
    to: string | null;
    value: bigint;
    blockTimestamp: bigint;
}

export function RecentTxsWidget({ limit = 8 }: { limit?: number }) {
    const [txs, setTxs] = useState<TxRow[] | null>(null);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const tick = async () => {
            try {
                const res = await getRecentTransactions(3, limit);
                if (!cancelled) {
                    setTxs(
                        res.slice(0, limit).map(t => ({
                            hash: t.hash,
                            from: t.from,
                            to: t.to,
                            value: t.value,
                            blockTimestamp: t.blockTimestamp,
                        }))
                    );
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

    if (err && !txs) {
        return (
            <Card className="glass border-destructive/20 bg-destructive/5">
                <CardContent className="p-5 text-xs text-destructive">Could not load txs: {err}</CardContent>
            </Card>
        );
    }

    return (
        <Card className="glass border-white/5 overflow-hidden">
            <div className="divide-y divide-white/5">
                {!txs ? (
                    Array.from({ length: limit }).map((_, i) => (
                        <div key={i} className="p-4 flex items-center gap-3">
                            <Skeleton className="h-9 w-9 rounded-lg bg-white/5" />
                            <Skeleton className="h-9 flex-1 bg-white/5" />
                        </div>
                    ))
                ) : txs.length === 0 ? (
                    <div className="p-8 text-center text-xs text-muted-foreground">No recent transactions.</div>
                ) : (
                    txs.map(t => (
                        <Link
                            key={t.hash}
                            href={`/tx/${t.hash}`}
                            className="flex items-center gap-3 p-3.5 hover:bg-white/[0.03] transition-colors group"
                        >
                            <div className="h-9 w-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                                <Layers className="h-4 w-4 text-accent" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-xs font-mono font-black text-foreground group-hover:text-primary transition-colors truncate">
                                        {fmtHexShort(t.hash)}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground/70 flex-shrink-0">
                                        {fmtTimeAgo(t.blockTimestamp)}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between gap-2 mt-0.5">
                                    <p className="text-[10px] font-mono text-muted-foreground/70 truncate">
                                        {fmtHexShort(t.from)} → {t.to ? fmtHexShort(t.to) : 'contract create'}
                                    </p>
                                    <p className="text-[10px] font-bold text-muted-foreground/80 flex-shrink-0">
                                        {fmtEther(t.value)} GEN
                                    </p>
                                </div>
                            </div>
                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                        </Link>
                    ))
                )}
            </div>
        </Card>
    );
}
