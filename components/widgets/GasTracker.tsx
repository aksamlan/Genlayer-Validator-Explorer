"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Fuel } from 'lucide-react';
import { realtimeStore } from '@/lib/realtime-store';
import { fmtGwei } from '@/lib/format';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';

export function GasTracker() {
    const [tick, setTick] = useState(0);

    useEffect(() => {
        realtimeStore.start();
        return realtimeStore.subscribe(() => setTick(t => t + 1));
    }, []);

    const history = realtimeStore.getGasHistory();
    const latest = history[history.length - 1]?.v ?? null;

    const data = history.map(s => ({ t: s.t, gwei: Number(s.v) / 1e9 }));

    return (
        <Card className="glass glass-hover card-lift border-white/5 overflow-hidden">
            <CardContent className="p-4 relative">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-primary/15 border border-primary/20">
                                <Fuel className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                Gas Price
                            </p>
                        </div>
                        {latest === null ? (
                            <Skeleton className="h-8 w-24 mt-2 bg-white/5" />
                        ) : (
                            <p className="text-2xl font-black tracking-tighter mt-1.5">
                                {fmtGwei(latest)}
                                <span className="text-[10px] text-muted-foreground font-bold ml-1.5">GWEI</span>
                            </p>
                        )}
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                            {history.length > 1 ? `${history.length} samples · last ${(history.length * 12 / 60).toFixed(0)} min` : 'collecting…'}
                        </p>
                    </div>
                    <div className="w-24 h-16">
                        {data.length > 1 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                                    <defs>
                                        <linearGradient id="gasGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="hsl(165 90% 45%)" stopOpacity={0.6} />
                                            <stop offset="100%" stopColor="hsl(165 90% 45%)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Area
                                        type="monotone"
                                        dataKey="gwei"
                                        stroke="hsl(165 90% 55%)"
                                        strokeWidth={1.5}
                                        fill="url(#gasGrad)"
                                        isAnimationActive={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: 'rgba(15,17,22,0.95)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: 8,
                                            fontSize: 10,
                                        }}
                                        formatter={(v: number) => [`${v.toFixed(3)} gwei`, 'Gas']}
                                        labelFormatter={() => ''}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full w-full rounded-md bg-white/[0.02] border border-white/5" />
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
