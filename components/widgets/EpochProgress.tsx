"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Hash } from 'lucide-react';
import type { EpochInfo } from '@/types/validator';
import { formatNumber } from '@/lib/utils';

interface EpochProgressProps {
    epochInfo: EpochInfo | null;
}

export function EpochProgress({ epochInfo }: EpochProgressProps) {
    return (
        <Card className="glass glass-hover card-lift border-white/5">
            <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-primary/15 border border-primary/20">
                        <Hash className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Current Epoch
                    </p>
                </div>
                <p className="text-2xl font-black tracking-tighter">
                    {epochInfo?.currentEpoch != null ? `#${epochInfo.currentEpoch}` : '—'}
                </p>
                <div className="mt-2 flex justify-between text-[10px] text-muted-foreground/70 font-bold">
                    <span>{epochInfo?.activeValidators ?? 0} active</span>
                    <span>
                        min{' '}
                        {epochInfo?.validatorMinStake && epochInfo.validatorMinStake !== '0'
                            ? `${formatNumber(Number(BigInt(epochInfo.validatorMinStake) / BigInt(1e18)))} GEN`
                            : '—'}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
