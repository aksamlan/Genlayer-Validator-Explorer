"use client";

import { Card, CardContent } from '@/components/ui/card';
import { PieChart as PieIcon } from 'lucide-react';
import type { ValidatorInfo } from '@/types/validator';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { fmtNumber } from '@/lib/format';
import { truncateAddress } from '@/lib/utils';

const COLORS = [
    'hsl(165 90% 55%)',
    'hsl(185 80% 60%)',
    'hsl(200 75% 60%)',
    'hsl(220 70% 65%)',
    'hsl(280 60% 65%)',
    'hsl(320 65% 60%)',
    'hsl(45 90% 60%)',
    'hsl(15 85% 60%)',
];

export function StakeDistribution({ validators }: { validators: ValidatorInfo[] }) {
    const active = validators.filter(v => v.isActive && !v.isBanned);
    const sorted = [...active]
        .map(v => ({
            address: v.address,
            moniker: v.moniker || truncateAddress(v.address),
            stake: Number(BigInt(v.stake) / BigInt(1e18)),
        }))
        .sort((a, b) => b.stake - a.stake);

    const top = sorted.slice(0, 7);
    const restTotal = sorted.slice(7).reduce((a, b) => a + b.stake, 0);
    const data = restTotal > 0 ? [...top, { address: 'rest', moniker: `+${sorted.length - 7} others`, stake: restTotal }] : top;

    const total = data.reduce((a, b) => a + b.stake, 0);

    return (
        <Card className="glass border-white/5 h-full">
            <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 rounded-lg bg-accent/15 border border-accent/20">
                        <PieIcon className="h-3.5 w-3.5 text-accent" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Stake Distribution
                    </p>
                </div>

                {data.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-6 text-center">No active validators yet.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                        <div className="h-44">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data}
                                        dataKey="stake"
                                        nameKey="moniker"
                                        innerRadius={40}
                                        outerRadius={70}
                                        paddingAngle={2}
                                        isAnimationActive={false}
                                    >
                                        {data.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="rgba(0,0,0,0.5)" />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            background: 'rgba(15,17,22,0.95)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: 8,
                                            fontSize: 11,
                                        }}
                                        formatter={(v: number, _name, entry) => [
                                            `${fmtNumber(v)} GEN (${total > 0 ? ((v / total) * 100).toFixed(1) : '0'}%)`,
                                            (entry?.payload as { moniker: string })?.moniker ?? 'Validator',
                                        ]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-1.5">
                            {data.map((d, i) => (
                                <div key={d.address} className="flex items-center gap-2">
                                    <span
                                        className="h-2.5 w-2.5 rounded-sm flex-shrink-0"
                                        style={{ background: COLORS[i % COLORS.length] }}
                                    />
                                    <span className="text-[10px] font-bold truncate flex-1">{d.moniker}</span>
                                    <span className="text-[10px] font-mono text-muted-foreground">
                                        {total > 0 ? `${((d.stake / total) * 100).toFixed(1)}%` : '—'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
