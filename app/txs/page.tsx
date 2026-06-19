"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Layers, RefreshCw, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SectionHeader } from '@/components/SectionHeader';
import {
    getLatestBlockNumber,
    getBlockWithTransactions,
} from '@/lib/explorer-rpc';
import { fmtEther, fmtHexShort, fmtNumber, fmtTimeAgo } from '@/lib/format';
import { truncateAddress, cn } from '@/lib/utils';
import type { Transaction } from 'viem';

const PER_PAGE = 25;
const POLL_MS = 15_000;

interface RowTx {
    hash: string;
    from: string;
    to: string | null;
    value: bigint;
    blockNumber: bigint;
    blockTimestamp: bigint;
}

export default function TxsPage() {
    const [page, setPage] = useState(0);
    const [rows, setRows] = useState<RowTx[] | null>(null);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const tick = async () => {
            try {
                const head = await getLatestBlockNumber();
                const start = head - BigInt(page * 3); // each page = 3 blocks scanned
                const collected: RowTx[] = [];
                let n = start;
                while (collected.length < PER_PAGE && n >= 0n) {
                    const b = await getBlockWithTransactions(n);
                    const txs = (b.transactions ?? []) as Transaction[];
                    for (const t of txs) {
                        collected.push({
                            hash: t.hash,
                            from: t.from,
                            to: t.to,
                            value: t.value,
                            blockNumber: b.number!,
                            blockTimestamp: b.timestamp!,
                        });
                        if (collected.length >= PER_PAGE) break;
                    }
                    n--;
                    if (collected.length >= PER_PAGE) break;
                    if (start - n > 25n) break; // safety
                }
                if (!cancelled) {
                    setRows(collected);
                    setErr(null);
                }
            } catch (e) {
                if (!cancelled) setErr(e instanceof Error ? e.message : 'Failed');
            }
        };
        tick();
        const id = setInterval(tick, POLL_MS);
        return () => { cancelled = true; clearInterval(id); };
    }, [page]);

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <SectionHeader
                accent="accent"
                title="Transactions"
                subtitle="Latest network activity, aggregated across the most recent blocks"
            />

            <Card className="glass border-white/5 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Layers className="h-3.5 w-3.5 text-accent" />
                        Page {page + 1}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(0)}
                            disabled={page === 0}
                            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                        >
                            <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                        >
                            <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>

                <CardContent className="p-0">
                    {err ? (
                        <p className="p-6 text-sm text-destructive">{err}</p>
                    ) : !rows ? (
                        <div className="divide-y divide-white/5">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <Skeleton key={i} className="h-14 w-full bg-white/[0.02]" />
                            ))}
                        </div>
                    ) : rows.length === 0 ? (
                        <p className="p-6 text-sm text-muted-foreground text-center">No transactions found in recent blocks.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">
                                    <tr className="border-b border-white/5 bg-white/[0.01]">
                                        <th className="px-4 py-3 text-left">Tx Hash</th>
                                        <th className="px-4 py-3 text-left">Block</th>
                                        <th className="px-4 py-3 text-left">Age</th>
                                        <th className="px-4 py-3 text-left">From</th>
                                        <th className="px-4 py-3 text-left">To</th>
                                        <th className="px-4 py-3 text-right">Value</th>
                                        <th className="px-4 py-3 text-right w-10" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((t, idx) => (
                                        <tr
                                            key={`${t.hash}-${idx}`}
                                            className={cn(
                                                "border-b border-white/5 hover:bg-white/[0.03] transition-colors group",
                                                idx % 2 === 0 ? "bg-white/[0.01]" : ""
                                            )}
                                        >
                                            <td className="px-4 py-3">
                                                <Link href={`/tx/${t.hash}`} className="font-mono text-xs group-hover:text-primary transition-colors">
                                                    {fmtHexShort(t.hash, 10, 6)}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Link href={`/block/${t.blockNumber.toString()}`} className="font-mono text-xs text-muted-foreground hover:text-primary">
                                                    #{fmtNumber(t.blockNumber)}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-muted-foreground">{fmtTimeAgo(t.blockTimestamp)}</td>
                                            <td className="px-4 py-3">
                                                <Link href={`/address/${t.from}`} className="font-mono text-[11px] text-muted-foreground hover:text-primary">
                                                    {truncateAddress(t.from)}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3">
                                                {t.to ? (
                                                    <Link href={`/address/${t.to}`} className="font-mono text-[11px] text-muted-foreground hover:text-primary">
                                                        {truncateAddress(t.to)}
                                                    </Link>
                                                ) : (
                                                    <span className="text-[10px] uppercase font-black tracking-widest text-accent">create</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono text-xs">{fmtEther(t.value)} GEN</td>
                                            <td className="px-4 py-3 text-right">
                                                <Link href={`/tx/${t.hash}`} className="text-muted-foreground/50 hover:text-primary">
                                                    <ArrowRight className="h-3.5 w-3.5" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </main>
    );
}
