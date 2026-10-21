"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Hash } from 'lucide-react';
import type { EpochInfo } from '@/types/validator';
import { fmtDuration, fmtGen } from '@/lib/format';

interface EpochProgressProps {
    epochInfo: EpochInfo | null;
}

export function EpochProgress({ epochInfo }: EpochProgressProps) {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

    const start = epochInfo?.epochStart?.getTime() ?? null;
    const end = epochInfo?.nextEpochEstimate?.getTime() ?? null;
    const hasTiming = start != null && end != null && end > start;
    const pct = hasTiming ? Math.min(100, Math.max(0, ((now - start!) / (end! - start!)) * 100)) : null;
    const remaining = end != null ? end - now : null;

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
                <div className="flex items-baseline justify-between gap-2">
                    <p className="text-2xl font-black tracking-tighter">
                        {epochInfo?.currentEpoch != null ? `#${epochInfo.currentEpoch}` : '—'}
                    </p>
                    {remaining != null && (
                        <p
                            className="text-[10px] font-black font-mono text-primary"
                            title={epochInfo?.nextEpochEstimate?.toUTCString()}
                        >
                            {remaining > 0 ? `ends in ${fmtDuration(remaining)}` : 'ending…'}
                        </p>
                    )}
                </div>

                {pct != null && (
                    <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden" title={`${pct.toFixed(1)}% elapsed`}>
                        <div className="h-full bg-gradient-to-r from-primary/60 to-primary transition-[width] duration-1000" style={{ width: `${pct}%` }} />
                    </div>
                )}

                <div className="mt-2 flex justify-between text-[10px] text-muted-foreground/70 font-bold">
                    <span>
                        {epochInfo?.lastFinalizedEpoch != null
                            ? `finalized #${epochInfo.lastFinalizedEpoch}`
                            : `${epochInfo?.activeValidators ?? 0} active`}
                    </span>
                    <span>
                        min{' '}
                        {epochInfo?.validatorMinStake && epochInfo.validatorMinStake !== '0'
                            ? `${fmtGen(epochInfo.validatorMinStake)} GEN`
                            : '—'}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
