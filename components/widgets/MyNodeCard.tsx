"use client";

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Crown, ArrowRight, Globe, Shield, Coins } from 'lucide-react';
import type { ValidatorInfo } from '@/types/validator';
import { truncateAddress } from '@/lib/utils';
import { fmtNumber } from '@/lib/format';
import { cn } from '@/lib/utils';

interface MyNodeCardProps {
    ownerAddress: string;
    validators: ValidatorInfo[];
    isLoading: boolean;
}

export function MyNodeCard({ ownerAddress, validators, isLoading }: MyNodeCardProps) {
    const node = validators.find(v => v.address.toLowerCase() === ownerAddress.toLowerCase());

    return (
        <Card className="relative overflow-hidden glass border-primary/30 bg-gradient-to-br from-primary/10 via-card/40 to-accent/10 group hover:border-primary/50 transition-all">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-accent/5 opacity-50 pointer-events-none" />
            <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-primary/15 blur-3xl pointer-events-none" />

            <CardContent className="p-5 relative">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-xl bg-primary/20 border border-primary/40">
                        <Crown className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                            Featured Operator
                        </p>
                        <p className="text-[9px] text-muted-foreground/60 uppercase tracking-widest">
                            Powered by this explorer
                        </p>
                    </div>
                </div>

                {isLoading || !node ? (
                    <>
                        <Skeleton className="h-6 w-40 mt-2 bg-white/5" />
                        <Skeleton className="h-12 w-full mt-3 bg-white/5" />
                    </>
                ) : (
                    <>
                        <div className="flex items-center gap-3 mt-1">
                            {node.logoUri ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={node.logoUri}
                                    alt={node.moniker}
                                    className="h-12 w-12 rounded-xl border border-white/10 object-cover"
                                    onError={e => { (e.target as HTMLImageElement).src = `https://avatar.vercel.sh/${node.address}`; }}
                                />
                            ) : (
                                <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                                    <Crown className="h-5 w-5 text-primary" />
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <p className="text-lg font-black truncate">
                                    {node.moniker || truncateAddress(node.address)}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className={cn(
                                        "text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest",
                                        node.isBanned
                                            ? "bg-destructive/20 text-destructive"
                                            : node.isActive
                                            ? "bg-primary/20 text-primary"
                                            : "bg-muted text-muted-foreground"
                                    )}>
                                        {node.isBanned ? 'Banned' : node.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                    <code className="text-[10px] text-muted-foreground/70 font-mono truncate">
                                        {truncateAddress(node.address)}
                                    </code>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mt-4">
                            <Stat
                                icon={Coins}
                                label="Stake"
                                value={`${fmtNumber(BigInt(node.stake) / BigInt(1e18))} GEN`}
                            />
                            <Stat
                                icon={Shield}
                                label="Delegated"
                                value={`${fmtNumber(BigInt(node.delegatedStake) / BigInt(1e18))} GEN`}
                            />
                            <Stat
                                icon={Globe}
                                label="Site"
                                value={node.identity ? node.identity.replace(/^https?:\/\//, '').split('/')[0] : '—'}
                                href={node.identity ? (node.identity.startsWith('http') ? node.identity : `https://${node.identity}`) : undefined}
                            />
                        </div>

                        <Link
                            href={`/validator/${node.address}`}
                            className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/15 hover:bg-primary/25 text-primary text-[10px] font-black uppercase tracking-widest transition-all group/btn"
                        >
                            View Validator Profile
                            <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-0.5 transition-transform" />
                        </Link>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

function Stat({
    icon: Icon,
    label,
    value,
    href,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    href?: string;
}) {
    const inner = (
        <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 group-hover:bg-white/[0.05] transition-colors">
            <div className="flex items-center gap-1 mb-0.5">
                <Icon className="h-2.5 w-2.5 text-muted-foreground/50" />
                <p className="text-[9px] uppercase font-black tracking-widest text-muted-foreground/60">{label}</p>
            </div>
            <p className="text-xs font-black truncate">{value}</p>
        </div>
    );
    if (href) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" className="block hover:scale-[1.02] transition-transform">
                {inner}
            </a>
        );
    }
    return inner;
}
