"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock } from 'lucide-react';
import { realtimeStore } from '@/lib/realtime-store';
import { ResponsiveContainer, LineChart, Line, Tooltip, YAxis } from 'recharts';

export function BlockTimeChart() {
    const [, setTick] = useState(0);

    useEffect(() => {
        realtimeStore.start();
        return realtimeStore.subscribe(() => setTick(t => t + 1));
    }, []);

    const times = realtimeStore.getBlockTimes();
    const data = times.map((s, i) => ({ i, secs: s.v }));
    const avg = data.length ? data.reduce((a, b) => a + b.secs, 0) / data.length : 0;
    const last = data.length ? data[data.length - 1].secs : 0;

    return (
        <Card className="glass glass-hover card-lift border-white/5">
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-accent/15 border border-accent/20">
                                <Clock className="h-3.5 w-3.5 text-accent" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                Block Time
                            </p>
                        </div>
                        {data.length === 0 ? (
                            <Skeleton className="h-8 w-24 mt-2 bg-white/5" />
                        ) : (
                            <p className="text-2xl font-black tracking-tighter mt-1.5">
                                {avg.toFixed(1)}s
                                <span className="text-[10px] text-muted-foreground font-bold ml-1.5">AVG</span>
                            </p>
                        )}
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                            {data.length > 0 ? `last block: ${last}s` : 'collecting…'}
                        </p>
                    </div>
                    <div className="w-28 h-16">
                        {data.length > 1 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                                    <YAxis hide domain={['dataMin', 'dataMax']} />
                                    <Line
                                        type="monotone"
                                        dataKey="secs"
                                        stroke="hsl(185 80% 60%)"
                                        strokeWidth={1.5}
                                        dot={false}
                                        isAnimationActive={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: 'rgba(15,17,22,0.95)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: 8,
                                            fontSize: 10,
                                        }}
                                        formatter={(v: number) => [`${v}s`, 'Block time']}
                                        labelFormatter={() => ''}
                                    />
                                </LineChart>
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
