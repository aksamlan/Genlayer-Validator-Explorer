"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Coins, Users, Shield, Hourglass, ShieldAlert, ShieldOff, Gift, TrendingUp, ArrowDownToLine, UserPlus,
} from 'lucide-react';
import type { EpochInfo } from '@/types/validator';
import { fmtGen, fmtNumber } from '@/lib/format';
import { cn } from '@/lib/utils';

interface StakingOverviewProps {
    epochInfo: EpochInfo | null;
    isLoading: boolean;
    tokenSymbol?: string;
}

interface Tile {
    label: string;
    value: string | null;
    hint?: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
}

/**
 * Validator-set and staking metrics. The v0.6-only fields (pending, quarantine,
 * rewards, inflation…) are hidden on networks that don't report them.
 */
export function StakingOverview({ epochInfo, isLoading, tokenSymbol = 'GEN' }: StakingOverviewProps) {
    const e = epochInfo;
    const tiles: (Tile | null)[] = [
        {
            label: 'Total Staked',
            value: e?.totalStake != null ? `${fmtGen(e.totalStake, true)} ${tokenSymbol}` : null,
            hint: 'Self + delegated stake across all validators',
            icon: Coins,
            color: 'text-primary',
        },
        {
            label: 'Joined',
            value: e ? fmtNumber(e.totalValidators) : null,
            hint: 'Validators in the staking registry',
            icon: Users,
            color: 'text-accent',
        },
        {
            label: 'Active Set',
            value: e ? fmtNumber(e.activeValidators) : null,
            hint: 'Selectable for consensus this epoch',
            icon: Shield,
            color: 'text-primary',
        },
        e?.pendingValidators != null ? {
            label: 'Pending',
            value: fmtNumber(e.pendingValidators),
            hint: 'Staked, enter the set at the next epoch',
            icon: Hourglass,
            color: 'text-sky-400',
        } : null,
        e?.quarantinedValidators != null ? {
            label: 'Quarantined',
            value: fmtNumber(e.quarantinedValidators),
            hint: 'Temporarily removed from selection',
            icon: ShieldAlert,
            color: 'text-orange-400',
        } : null,
        {
            label: 'Banned',
            value: e ? fmtNumber(e.bannedValidators) : null,
            icon: ShieldOff,
            color: 'text-destructive',
        },
        e?.unclaimedRewardsValidators != null ? {
            label: 'Unclaimed Rewards',
            value: fmtNumber(e.unclaimedRewardsValidators),
            hint: 'Validators with rewards waiting to be claimed',
            icon: Gift,
            color: 'text-yellow-400',
        } : null,
        e?.epochInflation != null ? {
            label: 'Epoch Inflation',
            value: `${fmtGen(e.epochInflation, true)} ${tokenSymbol}`,
            hint: 'Rewards minted for the current epoch',
            icon: TrendingUp,
            color: 'text-accent',
        } : null,
        e?.pendingDeposits != null && e.pendingDeposits !== '0' ? {
            label: 'Pending Deposits',
            value: `${fmtGen(e.pendingDeposits, true)} ${tokenSymbol}`,
            hint: 'Validator deposits waiting to activate',
            icon: ArrowDownToLine,
            color: 'text-sky-400',
        } : null,
        e?.delegatorMinStake != null ? {
            label: 'Min Stake',
            value: `${fmtGen(e.validatorMinStake)} / ${fmtGen(e.delegatorMinStake)}`,
            hint: `Validator / delegator minimum (${tokenSymbol})`,
            icon: UserPlus,
            color: 'text-muted-foreground',
        } : null,
    ];

    const visible = tiles.filter((t): t is Tile => t !== null);

    return (
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {visible.map(t => (
                <Card key={t.label} className="glass glass-hover border-white/5" title={t.hint}>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground truncate">
                                {t.label}
                            </p>
                            <t.icon className={cn('h-3.5 w-3.5 flex-shrink-0', t.color)} />
                        </div>
                        {isLoading && t.value == null ? (
                            <Skeleton className="h-7 w-20 mt-2 bg-white/5" />
                        ) : (
                            <p className={cn('text-xl font-black tracking-tighter mt-1 truncate', t.color)}>
                                {t.value ?? '—'}
                            </p>
                        )}
                        {t.hint && (
                            <p className="text-[9px] text-muted-foreground/60 mt-1 leading-tight line-clamp-2">{t.hint}</p>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
