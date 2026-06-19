"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, Box, Users, ShieldOff } from 'lucide-react';
import type { EpochInfo } from '@/types/validator';
import { fmtNumber } from '@/lib/format';
import { cn } from '@/lib/utils';

interface HeroStatsProps {
    epochInfo: EpochInfo | null;
    blockNumber: string;
    isLoading: boolean;
}

export function HeroStats({ epochInfo, blockNumber, isLoading }: HeroStatsProps) {
    const stats = [
        {
            label: 'Active Validators',
            value: epochInfo?.activeValidators ?? 0,
            icon: Shield,
            color: 'text-primary',
            bg: 'bg-primary/10',
            border: 'border-primary/20',
        },
        {
            label: 'Total Validators',
            value: epochInfo?.totalValidators ?? 0,
            icon: Users,
            color: 'text-accent',
            bg: 'bg-accent/10',
            border: 'border-accent/20',
        },
        {
            label: 'Banned',
            value: epochInfo?.bannedValidators ?? 0,
            icon: ShieldOff,
            color: 'text-destructive',
            bg: 'bg-destructive/10',
            border: 'border-destructive/20',
        },
        {
            label: 'Latest Block',
            value: blockNumber !== '0' ? Number(blockNumber) : null,
            icon: Box,
            color: 'text-foreground',
            bg: 'bg-white/5',
            border: 'border-white/10',
            mono: true,
        },
    ];

    return (
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            {stats.map(s => (
                <Card key={s.label} className={cn("glass glass-hover border-white/5 overflow-hidden", s.border, s.bg, 'bg-opacity-50')}>
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    {s.label}
                                </p>
                                {isLoading || s.value == null ? (
                                    <Skeleton className="h-8 w-24 mt-2 bg-white/5" />
                                ) : (
                                    <p className={cn("text-2xl font-black tracking-tighter mt-1 truncate", s.mono && 'font-mono', s.color)}>
                                        {fmtNumber(s.value)}
                                    </p>
                                )}
                            </div>
                            <div className={cn("p-2 rounded-lg flex-shrink-0", s.bg, s.color)}>
                                <s.icon className="h-4 w-4" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
