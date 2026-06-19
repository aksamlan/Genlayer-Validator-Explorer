"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Wallet, Copy, FileCode, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { SectionHeader } from '@/components/SectionHeader';
import {
    getAddressBalance,
    getAddressCode,
    getAddressTxCount,
} from '@/lib/explorer-rpc';
import { validatorService } from '@/lib/validator-service';
import { fmtEther, fmtNumber } from '@/lib/format';
import { isOwnerValidator } from '@/lib/my-node';
import { useToast } from '@/components/Toaster';
import { cn, truncateAddress } from '@/lib/utils';
import type { Address } from 'viem';
import type { ValidatorInfo } from '@/types/validator';

export default function AddressPage() {
    const params = useParams<{ address: string }>();
    const addr = params?.address?.toLowerCase() as Address | undefined;
    const toast = useToast();

    const [balance, setBalance] = useState<bigint | null>(null);
    const [txCount, setTxCount] = useState<number | null>(null);
    const [code, setCode] = useState<string | null>(null);
    const [validatorInfo, setValidatorInfo] = useState<ValidatorInfo | null>(null);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        if (!addr) return;
        let cancelled = false;
        (async () => {
            try {
                const [bal, count, c] = await Promise.all([
                    getAddressBalance(addr),
                    getAddressTxCount(addr),
                    getAddressCode(addr),
                ]);
                if (cancelled) return;
                setBalance(bal);
                setTxCount(count);
                setCode(c);

                // Best-effort validator lookup
                try {
                    const stats = await validatorService.getNetworkStats();
                    const v = stats.validators.find(x => x.address.toLowerCase() === addr.toLowerCase());
                    if (!cancelled && v) setValidatorInfo(v);
                } catch { /* ignore */ }

                setErr(null);
            } catch (e) {
                if (!cancelled) setErr(e instanceof Error ? e.message : 'Failed');
            }
        })();
        return () => { cancelled = true; };
    }, [addr]);

    if (!addr) {
        return (
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Card className="glass border-destructive/20"><CardContent className="p-6 text-destructive text-sm">Invalid address</CardContent></Card>
            </main>
        );
    }

    const copy = () => {
        if (!addr) return;
        navigator.clipboard.writeText(addr).then(() => {
            toast.push({ kind: 'success', title: 'Address copied', description: truncateAddress(addr) });
        });
    };

    const isContract = code != null && code !== '0x';
    const isOwner = isOwnerValidator(addr);

    return (
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="flex items-start gap-3 flex-wrap">
                <div className="p-2.5 rounded-xl bg-primary/15 border border-primary/30">
                    {isContract ? <FileCode className="h-5 w-5 text-primary" /> : <Wallet className="h-5 w-5 text-primary" />}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">
                            {isContract ? 'Contract' : validatorInfo ? 'Validator' : 'Address'}
                        </p>
                        {validatorInfo && (
                            <Badge className={cn(
                                "text-[9px] tracking-widest font-black",
                                validatorInfo.isBanned ? "bg-destructive/20 text-destructive border-destructive/30" :
                                validatorInfo.isActive ? "bg-primary/15 text-primary border-primary/30" :
                                "bg-muted text-muted-foreground"
                            )}>
                                {validatorInfo.isBanned ? 'BANNED' : validatorInfo.isActive ? 'ACTIVE' : 'INACTIVE'}
                            </Badge>
                        )}
                        {isOwner && (
                            <Badge className="bg-accent/20 text-accent border-accent/30 text-[9px] tracking-widest font-black">
                                MY NODE
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <h1 className="font-mono text-sm sm:text-base font-black tracking-tight break-all">{addr}</h1>
                        <button onClick={copy} className="text-muted-foreground hover:text-primary flex-shrink-0">
                            <Copy className="h-3.5 w-3.5" />
                        </button>
                    </div>
                    {validatorInfo && (
                        <Link href={`/validator/${addr}`} className="inline-block mt-2 text-[10px] uppercase font-black tracking-widest text-primary hover:underline">
                            View validator profile →
                        </Link>
                    )}
                </div>
            </div>

            {err && (
                <Card className="glass border-destructive/20 bg-destructive/5">
                    <CardContent className="p-4 text-xs text-destructive">{err}</CardContent>
                </Card>
            )}

            {/* Stats */}
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
                <Card className="glass border-white/5">
                    <CardContent className="p-4">
                        <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Balance</p>
                        {balance === null ? (
                            <Skeleton className="h-7 w-24 mt-2 bg-white/5" />
                        ) : (
                            <p className="text-xl font-black mt-1 font-mono">
                                {fmtEther(balance)} <span className="text-xs text-muted-foreground font-bold">GEN</span>
                            </p>
                        )}
                    </CardContent>
                </Card>
                <Card className="glass border-white/5">
                    <CardContent className="p-4">
                        <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Transactions Sent</p>
                        {txCount === null ? (
                            <Skeleton className="h-7 w-24 mt-2 bg-white/5" />
                        ) : (
                            <p className="text-xl font-black mt-1 font-mono">{fmtNumber(txCount)}</p>
                        )}
                    </CardContent>
                </Card>
                <Card className="glass border-white/5">
                    <CardContent className="p-4">
                        <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Type</p>
                        {code === null ? (
                            <Skeleton className="h-7 w-24 mt-2 bg-white/5" />
                        ) : (
                            <p className="text-xl font-black mt-1 flex items-center gap-2">
                                {isContract ? (
                                    <><FileCode className="h-4 w-4 text-primary" /> Contract</>
                                ) : (
                                    <><Wallet className="h-4 w-4 text-accent" /> EOA</>
                                )}
                            </p>
                        )}
                        {isContract && code && (
                            <p className="text-[10px] text-muted-foreground mt-1">
                                {(code.length / 2 - 1).toLocaleString()} bytes
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Validator card if applicable */}
            {validatorInfo && (
                <div className="space-y-3">
                    <SectionHeader accent="accent" title="Validator Profile" subtitle="Identity registered on-chain via the validator wallet contract" />
                    <Card className="glass border-white/5">
                        <CardContent className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Stat label="Moniker" value={validatorInfo.moniker || truncateAddress(addr)} />
                            <Stat label="Total Stake" value={`${fmtNumber(BigInt(validatorInfo.stake) / BigInt(1e18))} GEN`} />
                            <Stat label="Delegated" value={`${fmtNumber(BigInt(validatorInfo.delegatedStake) / BigInt(1e18))} GEN`} />
                            <Stat label="Identity" value={validatorInfo.identity || '—'} link={validatorInfo.identity} />
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Contract code preview */}
            {isContract && code && (
                <div className="space-y-3">
                    <SectionHeader accent="accent" title="Contract Bytecode" subtitle="EVM bytecode deployed at this address" />
                    <Card className="glass border-white/5">
                        <CardContent className="p-4">
                            <pre className="text-[10px] font-mono text-muted-foreground break-all whitespace-pre-wrap max-h-60 overflow-y-auto">
                                {code}
                            </pre>
                        </CardContent>
                    </Card>
                </div>
            )}
        </main>
    );
}

function Stat({ label, value, link }: { label: string; value: string; link?: string }) {
    const inner = (
        <>
            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">{label}</p>
            <p className="text-sm font-bold mt-1 truncate" title={value}>{value}</p>
        </>
    );
    if (link) {
        return (
            <a href={link.startsWith('http') ? link : `https://${link}`} target="_blank" rel="noopener noreferrer" className="block hover:opacity-80">
                {inner}
            </a>
        );
    }
    return <div>{inner}</div>;
}
