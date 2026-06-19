"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Box, ChevronLeft, ChevronRight, Copy, ExternalLink, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SectionHeader } from '@/components/SectionHeader';
import { getBlockWithTransactions, getLatestBlockNumber } from '@/lib/explorer-rpc';
import { fmtNumber, fmtTimeAgo, fmtHexShort, fmtEther, gasUsedPct } from '@/lib/format';
import { truncateAddress, cn } from '@/lib/utils';
import { useToast } from '@/components/Toaster';
import type { Block, Transaction } from 'viem';

export default function BlockDetailPage() {
    const params = useParams<{ number: string }>();
    const num = params?.number ? BigInt(params.number) : 0n;
    const toast = useToast();
    const [block, setBlock] = useState<Block | null>(null);
    const [head, setHead] = useState<bigint | null>(null);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const [b, h] = await Promise.all([
                    getBlockWithTransactions(num),
                    getLatestBlockNumber(),
                ]);
                if (!cancelled) {
                    setBlock(b);
                    setHead(h);
                    setErr(null);
                }
            } catch (e) {
                if (!cancelled) setErr(e instanceof Error ? e.message : 'Failed');
            }
        })();
        return () => { cancelled = true; };
    }, [num]);

    const copy = (text: string, label = 'Hash') => {
        navigator.clipboard.writeText(text).then(() => {
            toast.push({ kind: 'success', title: `${label} copied`, description: text.length > 24 ? `${text.slice(0, 12)}…${text.slice(-8)}` : text });
        });
    };

    if (err) {
        return (
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Card className="glass border-destructive/20 bg-destructive/5">
                    <CardContent className="p-8 text-center">
                        <p className="text-sm font-bold text-destructive">Could not load block #{num.toString()}</p>
                        <p className="text-xs text-muted-foreground mt-2">{err}</p>
                        <Link href="/blocks" className="text-primary text-xs mt-4 inline-block hover:underline">← Back to blocks</Link>
                    </CardContent>
                </Card>
            </main>
        );
    }

    const txs = (block?.transactions ?? []) as Transaction[];
    const pct = block ? gasUsedPct(block.gasUsed, block.gasLimit) : 0;

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/15 border border-primary/30">
                        <Box className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Block</p>
                        <h1 className="text-2xl font-black tracking-tighter font-mono">
                            #{fmtNumber(num)}
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {num > 0n && (
                        <Link
                            href={`/block/${(num - 1n).toString()}`}
                            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                        >
                            <ChevronLeft className="h-3.5 w-3.5" />
                        </Link>
                    )}
                    {head !== null && num < head && (
                        <Link
                            href={`/block/${(num + 1n).toString()}`}
                            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                        >
                            <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                    )}
                </div>
            </div>

            {/* Overview */}
            <Card className="glass border-white/5">
                <CardContent className="p-0">
                    {!block ? (
                        <div className="p-6 space-y-3">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} className="h-5 w-full bg-white/5" />
                            ))}
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            <Detail label="Block Hash" mono>
                                <span className="font-mono text-xs break-all">{block.hash}</span>
                                <button onClick={() => copy(block.hash!, 'Block hash')} className="ml-2 text-muted-foreground hover:text-primary">
                                    <Copy className="h-3 w-3" />
                                </button>
                            </Detail>
                            <Detail label="Parent">
                                <Link href={`/block/${(num - 1n).toString()}`} className="font-mono text-xs text-muted-foreground hover:text-primary break-all">
                                    {block.parentHash}
                                </Link>
                            </Detail>
                            <Detail label="Timestamp">
                                <span className="text-xs">
                                    {new Date(Number(block.timestamp) * 1000).toLocaleString()}{' '}
                                    <span className="text-muted-foreground/70 ml-1">· {fmtTimeAgo(block.timestamp)}</span>
                                </span>
                            </Detail>
                            <Detail label="Miner">
                                <Link href={`/address/${block.miner}`} className="font-mono text-xs hover:text-primary transition-colors">
                                    {block.miner}
                                </Link>
                            </Detail>
                            <Detail label="Transactions">
                                <span className="text-xs font-bold">{txs.length}</span>
                            </Detail>
                            <Detail label="Gas Used / Limit">
                                <span className="text-xs font-mono">
                                    {fmtNumber(block.gasUsed)} / {fmtNumber(block.gasLimit)}{' '}
                                    <span className="text-muted-foreground">({pct.toFixed(2)}%)</span>
                                </span>
                            </Detail>
                            {block.baseFeePerGas != null && (
                                <Detail label="Base Fee">
                                    <span className="text-xs font-mono">
                                        {(Number(block.baseFeePerGas) / 1e9).toFixed(4)} gwei
                                    </span>
                                </Detail>
                            )}
                            <Detail label="Size">
                                <span className="text-xs font-mono">{fmtNumber(block.size)} bytes</span>
                            </Detail>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Transactions */}
            <div className="space-y-3">
                <SectionHeader
                    accent="accent"
                    title="Transactions in Block"
                    subtitle={`${txs.length} transactions`}
                />
                <Card className="glass border-white/5 overflow-hidden">
                    <CardContent className="p-0">
                        {txs.length === 0 ? (
                            <p className="p-6 text-sm text-muted-foreground text-center">No transactions in this block.</p>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {txs.map(t => (
                                    <Link
                                        key={t.hash}
                                        href={`/tx/${t.hash}`}
                                        className="flex items-center gap-3 p-4 hover:bg-white/[0.03] transition-colors group"
                                    >
                                        <div className="h-8 w-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                                            <ExternalLink className="h-3.5 w-3.5 text-accent" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-mono font-black group-hover:text-primary transition-colors truncate">
                                                {fmtHexShort(t.hash, 12, 8)}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground/70 truncate font-mono mt-0.5">
                                                {truncateAddress(t.from)} → {t.to ? truncateAddress(t.to) : 'contract create'}
                                            </p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-xs font-bold">{fmtEther(t.value)} GEN</p>
                                        </div>
                                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors flex-shrink-0" />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}

function Detail({ label, children, mono = false }: { label: string; children: React.ReactNode; mono?: boolean }) {
    return (
        <div className={cn("flex justify-between items-center gap-4 p-4 flex-wrap", mono && 'font-mono')}>
            <span className="text-[11px] uppercase font-black tracking-widest text-muted-foreground/60 flex-shrink-0">{label}</span>
            <div className="flex-1 min-w-0 text-right">{children}</div>
        </div>
    );
}
