"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Layers, Copy, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { getTransaction, getTransactionReceipt, getBlock } from '@/lib/explorer-rpc';
import { fmtEther, fmtNumber, fmtTimeAgo } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/Toaster';
import type { Hash, Transaction, TransactionReceipt } from 'viem';

export default function TxDetailPage() {
    const params = useParams<{ hash: string }>();
    const hash = params?.hash as Hash;
    const toast = useToast();

    const [tx, setTx] = useState<Transaction | null>(null);
    const [receipt, setReceipt] = useState<TransactionReceipt | null>(null);
    const [timestamp, setTimestamp] = useState<bigint | null>(null);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const t = await getTransaction(hash);
                if (cancelled) return;
                setTx(t);

                const [r, b] = await Promise.all([
                    getTransactionReceipt(hash),
                    t.blockNumber != null ? getBlock(t.blockNumber) : Promise.resolve(null),
                ]);
                if (cancelled) return;
                setReceipt(r);
                if (b) setTimestamp(b.timestamp);
                setErr(null);
            } catch (e) {
                if (!cancelled) setErr(e instanceof Error ? e.message : 'Failed');
            }
        })();
        return () => { cancelled = true; };
    }, [hash]);

    const copy = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.push({ kind: 'success', title: 'Tx hash copied', description: `${text.slice(0, 12)}…${text.slice(-8)}` });
        });
    };

    if (err) {
        return (
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Card className="glass border-destructive/20 bg-destructive/5">
                    <CardContent className="p-8 text-center">
                        <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                        <p className="text-sm font-bold text-destructive">Transaction not found</p>
                        <p className="text-xs text-muted-foreground mt-2 font-mono break-all">{hash}</p>
                        <Link href="/txs" className="text-primary text-xs mt-4 inline-block hover:underline">← Back to transactions</Link>
                    </CardContent>
                </Card>
            </main>
        );
    }

    const status = receipt
        ? receipt.status === 'success' ? 'success' : 'failed'
        : tx ? 'pending' : 'loading';

    return (
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-accent/15 border border-accent/30">
                    <Layers className="h-5 w-5 text-accent" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Transaction</p>
                    <div className="flex items-center gap-2">
                        <h1 className="text-sm sm:text-base font-mono font-black tracking-tight truncate">
                            {hash}
                        </h1>
                        <button onClick={() => copy(hash)} className="text-muted-foreground hover:text-primary flex-shrink-0">
                            <Copy className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={status} />
                {tx?.blockNumber != null && (
                    <Link href={`/block/${tx.blockNumber.toString()}`} className="text-xs font-mono text-muted-foreground hover:text-primary">
                        in block <span className="text-foreground font-black">#{fmtNumber(tx.blockNumber)}</span>
                    </Link>
                )}
                {timestamp && (
                    <span className="text-xs text-muted-foreground">· {fmtTimeAgo(timestamp)}</span>
                )}
            </div>

            <Card className="glass border-white/5">
                <CardContent className="p-0">
                    {!tx ? (
                        <div className="p-6 space-y-3">
                            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-5 w-full bg-white/5" />)}
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            <Row label="From">
                                <Link href={`/address/${tx.from}`} className="font-mono text-xs hover:text-primary transition-colors break-all">
                                    {tx.from}
                                </Link>
                            </Row>
                            <Row label="To">
                                {tx.to ? (
                                    <Link href={`/address/${tx.to}`} className="font-mono text-xs hover:text-primary transition-colors break-all">
                                        {tx.to}
                                    </Link>
                                ) : (
                                    <span className="text-xs font-black text-accent uppercase tracking-widest">Contract Creation</span>
                                )}
                                {receipt?.contractAddress && (
                                    <div className="text-[10px] text-muted-foreground mt-1">
                                        Contract: <Link href={`/address/${receipt.contractAddress}`} className="text-primary font-mono">{receipt.contractAddress}</Link>
                                    </div>
                                )}
                            </Row>
                            <Row label="Value">
                                <span className="text-xs font-mono font-black">{fmtEther(tx.value)} GEN</span>
                            </Row>
                            <Row label="Gas Price">
                                <span className="text-xs font-mono">{tx.gasPrice ? `${(Number(tx.gasPrice) / 1e9).toFixed(4)} gwei` : '—'}</span>
                            </Row>
                            <Row label="Gas Limit">
                                <span className="text-xs font-mono">{fmtNumber(tx.gas)}</span>
                            </Row>
                            {receipt && (
                                <Row label="Gas Used">
                                    <span className="text-xs font-mono">
                                        {fmtNumber(receipt.gasUsed)}
                                        <span className="text-muted-foreground ml-1">
                                            ({((Number(receipt.gasUsed) / Number(tx.gas)) * 100).toFixed(1)}%)
                                        </span>
                                    </span>
                                </Row>
                            )}
                            <Row label="Nonce">
                                <span className="text-xs font-mono">{fmtNumber(tx.nonce)}</span>
                            </Row>
                            {tx.input && tx.input !== '0x' && (
                                <Row label="Input Data" align="start">
                                    <div className="w-full">
                                        <p className="text-[10px] text-muted-foreground mb-1">{tx.input.length / 2 - 1} bytes</p>
                                        <pre className="text-[10px] font-mono bg-white/[0.02] border border-white/5 rounded-lg p-3 break-all whitespace-pre-wrap max-h-40 overflow-y-auto">
                                            {tx.input}
                                        </pre>
                                    </div>
                                </Row>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Logs */}
            {receipt && receipt.logs.length > 0 && (
                <div className="space-y-3">
                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                        Event Logs ({receipt.logs.length})
                    </p>
                    <Card className="glass border-white/5">
                        <CardContent className="p-0 divide-y divide-white/5">
                            {receipt.logs.map((log, i) => (
                                <div key={i} className="p-4 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Link href={`/address/${log.address}`} className="font-mono text-xs text-primary hover:underline">
                                            {log.address}
                                        </Link>
                                        <span className="text-[10px] text-muted-foreground/60 font-mono">#{i}</span>
                                    </div>
                                    {log.topics.length > 0 && (
                                        <div className="space-y-1">
                                            <p className="text-[9px] uppercase font-black tracking-widest text-muted-foreground/60">Topics</p>
                                            {log.topics.map((t, j) => (
                                                <p key={j} className="font-mono text-[10px] break-all text-muted-foreground">
                                                    [{j}] {t}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                    {log.data && log.data !== '0x' && (
                                        <div>
                                            <p className="text-[9px] uppercase font-black tracking-widest text-muted-foreground/60 mb-1">Data</p>
                                            <p className="font-mono text-[10px] break-all text-muted-foreground/80">{log.data}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            )}
        </main>
    );
}

function Row({ label, children, align = 'center' }: { label: string; children: React.ReactNode; align?: 'center' | 'start' }) {
    return (
        <div className={cn(
            "flex justify-between gap-4 p-4 flex-wrap sm:flex-nowrap",
            align === 'center' ? 'items-center' : 'items-start'
        )}>
            <span className="text-[11px] uppercase font-black tracking-widest text-muted-foreground/60 sm:w-32 flex-shrink-0">{label}</span>
            <div className="flex-1 min-w-0 sm:text-right">{children}</div>
        </div>
    );
}

function StatusBadge({ status }: { status: 'success' | 'failed' | 'pending' | 'loading' }) {
    if (status === 'success') {
        return (
            <Badge className="bg-primary/15 text-primary border-primary/30 flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3" /> Success
            </Badge>
        );
    }
    if (status === 'failed') {
        return (
            <Badge variant="destructive" className="flex items-center gap-1.5">
                <XCircle className="h-3 w-3" /> Failed
            </Badge>
        );
    }
    if (status === 'pending') {
        return (
            <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30 flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" /> Pending
            </Badge>
        );
    }
    return null;
}
