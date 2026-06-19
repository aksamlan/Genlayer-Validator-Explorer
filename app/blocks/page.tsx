"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Box, ChevronLeft, ChevronRight, RefreshCw, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SectionHeader } from '@/components/SectionHeader';
import {
    getLatestBlockNumber,
    getBlock,
} from '@/lib/explorer-rpc';
import { fmtNumber, fmtTimeAgo, gasUsedPct } from '@/lib/format';
import { truncateAddress, cn } from '@/lib/utils';
import type { Block } from 'viem';

const PER_PAGE = 20;
const POLL_MS = 12_000;

export default function BlocksPage() {
    const [head, setHead] = useState<bigint | null>(null);
    const [page, setPage] = useState(0);
    const [blocks, setBlocks] = useState<Block[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const tick = async () => {
            try {
                const h = await getLatestBlockNumber();
                if (cancelled) return;
                setHead(h);

                const start = h - BigInt(page * PER_PAGE);
                const numbers: bigint[] = [];
                for (let i = 0n; i < BigInt(PER_PAGE); i++) {
                    if (start - i < 0n) break;
                    numbers.push(start - i);
                }

                const fetched = await Promise.all(numbers.map(n => getBlock(n)));
                if (cancelled) return;
                setBlocks(fetched);
                setErr(null);
                setLoading(false);
            } catch (e) {
                if (!cancelled) {
                    setErr(e instanceof Error ? e.message : 'Failed to fetch');
                    setLoading(false);
                }
            }
        };
        tick();
        const id = setInterval(tick, POLL_MS);
        return () => { cancelled = true; clearInterval(id); };
    }, [page]);

    const total = head != null ? Number(head) : 0;

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <SectionHeader
                accent="primary"
                title="Blocks"
                subtitle={head !== null ? `${fmtNumber(total)} blocks indexed` : 'Loading head…'}
            />

            <Card className="glass border-white/5 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Box className="h-3.5 w-3.5 text-primary" />
                        Page {page + 1}
                        {head !== null && (
                            <span className="text-muted-foreground/50">·</span>
                        )}
                        {head !== null && (
                            <span className="font-mono">
                                {fmtNumber(Math.max(0, total - page * PER_PAGE - (PER_PAGE - 1)))}–{fmtNumber(total - page * PER_PAGE)}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(0)}
                            disabled={page === 0}
                            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                            title="Latest"
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
                            disabled={head !== null && total - (page + 1) * PER_PAGE <= 0}
                            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>

                <CardContent className="p-0">
                    {err ? (
                        <p className="p-6 text-sm text-destructive">{err}</p>
                    ) : loading || !blocks ? (
                        <div className="divide-y divide-white/5">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <Skeleton key={i} className="h-14 w-full bg-white/[0.02]" />
                            ))}
                        </div>
                    ) : blocks.length === 0 ? (
                        <p className="p-6 text-sm text-muted-foreground text-center">No blocks.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">
                                    <tr className="border-b border-white/5 bg-white/[0.01]">
                                        <th className="px-4 py-3 text-left font-black">Block</th>
                                        <th className="px-4 py-3 text-left font-black">Age</th>
                                        <th className="px-4 py-3 text-left font-black">Miner</th>
                                        <th className="px-4 py-3 text-right font-black">Txs</th>
                                        <th className="px-4 py-3 text-right font-black">Gas Used</th>
                                        <th className="px-4 py-3 text-right font-black w-10" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {blocks.map((b, idx) => {
                                        const pct = gasUsedPct(b.gasUsed, b.gasLimit);
                                        const txCount = Array.isArray(b.transactions) ? b.transactions.length : 0;
                                        return (
                                            <tr
                                                key={b.number?.toString() ?? b.hash}
                                                className={cn(
                                                    "border-b border-white/5 hover:bg-white/[0.03] transition-colors group",
                                                    idx % 2 === 0 ? "bg-white/[0.01]" : ""
                                                )}
                                            >
                                                <td className="px-4 py-3">
                                                    <Link
                                                        href={`/block/${b.number?.toString()}`}
                                                        className="flex items-center gap-2 group/l"
                                                    >
                                                        <Box className="h-3.5 w-3.5 text-primary" />
                                                        <span className="font-mono font-black text-xs group-hover/l:text-primary transition-colors">
                                                            #{b.number ? fmtNumber(b.number) : '—'}
                                                        </span>
                                                    </Link>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground">
                                                    {b.timestamp ? fmtTimeAgo(b.timestamp) : '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Link
                                                        href={`/address/${b.miner}`}
                                                        className="font-mono text-[11px] text-muted-foreground hover:text-primary transition-colors"
                                                    >
                                                        {truncateAddress(b.miner)}
                                                    </Link>
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono text-xs">
                                                    {fmtNumber(txCount)}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="inline-flex flex-col items-end gap-1">
                                                        <span className="text-[11px] font-mono">{pct.toFixed(1)}%</span>
                                                        <div className="w-20 h-1 rounded-full bg-white/5 overflow-hidden">
                                                            <div
                                                                className="h-full bg-primary/70"
                                                                style={{ width: `${Math.min(100, pct)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Link
                                                        href={`/block/${b.number?.toString()}`}
                                                        className="text-muted-foreground/50 hover:text-primary"
                                                    >
                                                        <ArrowRight className="h-3.5 w-3.5" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </main>
    );
}
