"use client";

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Crown, ArrowRight, Globe, Shield, Coins, Gift, PieChart, Hourglass } from 'lucide-react';
import { getValidatorStatus, VALIDATOR_STATUS_LABEL, type ValidatorInfo } from '@/types/validator';
import { truncateAddress } from '@/lib/utils';
import { fmtNumber } from '@/lib/format';
import { cn } from '@/lib/utils';

interface MyNodeCardProps {
    ownerAddress: string;
    validators: ValidatorInfo[];
    isLoading: boolean;
}

export function MyNodeCard({ ownerAddress, validators, isLoading }: MyNodeCardProps) {
    // Match against the validator address, the owner wallet, or the operator
    // address so the card resolves regardless of which one the operator sets in
    // NEXT_PUBLIC_OWNER_VALIDATOR.
    const target = ownerAddress.toLowerCase();
    const node = validators.find(v =>
        v.address.toLowerCase() === target ||
        v.owner?.toLowerCase() === target ||
        v.operator?.toLowerCase() === target
    );
    const status = node ? getValidatorStatus(node) : null;

    // Share of all active + pending stake on the network.
    const eligible = validators.filter(v => {
        const s = getValidatorStatus(v);
        return s === 'active' || s === 'pending';
    });
    const totalEligible = eligible.reduce((a, v) => a + BigInt(v.stake) + BigInt(v.delegatedStake), 0n);
    const nodeTotal = node ? BigInt(node.stake) + BigInt(node.delegatedStake) : 0n;
    const sharePct = totalEligible > 0n && status && (status === 'active' || status === 'pending')
        ? Number((nodeTotal * 10000n) / totalEligible) / 100
        : null;
    const rank = node && sharePct !== null
        ? 1 + eligible.filter(v => BigInt(v.stake) + BigInt(v.delegatedStake) > nodeTotal).length
        : null;

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

                {isLoading && !node ? (
                    <>
                        <Skeleton className="h-6 w-40 mt-2 bg-white/5" />
                        <Skeleton className="h-12 w-full mt-3 bg-white/5" />
                    </>
                ) : !node ? (
                    <p className="text-xs text-muted-foreground mt-2">
                        <code className="font-mono">{truncateAddress(ownerAddress)}</code> is not a validator on this network yet.
                    </p>
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
                                        status === 'banned' && "bg-destructive/20 text-destructive",
                                        status === 'quarantined' && "bg-orange-500/20 text-orange-400",
                                        status === 'active' && "bg-primary/20 text-primary",
                                        status === 'pending' && "bg-sky-500/20 text-sky-400",
                                        status === 'inactive' && "bg-muted text-muted-foreground"
                                    )}>
                                        {VALIDATOR_STATUS_LABEL[status!]}
                                    </span>
                                    {node.hasUnclaimedRewards && (
                                        <span className="inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest bg-yellow-500/15 text-yellow-400">
                                            <Gift className="h-2.5 w-2.5" /> Rewards
                                        </span>
                                    )}
                                    <code className="text-[10px] text-muted-foreground/70 font-mono truncate">
                                        {truncateAddress(node.address)}
                                    </code>
                                </div>
                            </div>
                        </div>

                        {status === 'pending' && (
                            <p className="mt-3 flex items-center gap-1.5 text-[10px] text-sky-400/90 font-bold">
                                <Hourglass className="h-3 w-3" />
                                Staked and waiting — joins the validator set at the next epoch.
                            </p>
                        )}

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
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
                                icon={PieChart}
                                label="Net share"
                                value={sharePct !== null ? `${sharePct.toFixed(2)}% · #${rank}` : '—'}
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
