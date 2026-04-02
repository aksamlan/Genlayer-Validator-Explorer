"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { EpochInfo } from "@/types/validator";
import { Shield, Users, ShieldOff, Layers, Hash, Coins } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

interface NetworkOverviewProps {
    epochInfo: EpochInfo | null;
    isLoading: boolean;
    metrics?: {
        chainId: number;
        gasPrice: string;
        avgBlockTime: string;
    };
}

export function NetworkOverview({ epochInfo, isLoading, metrics }: NetworkOverviewProps) {
    const largeStats = [
        {
            title: "Active Validators",
            value: epochInfo?.activeValidators ?? 0,
            icon: Shield,
            description: "Currently validating",
            highlight: true,
            color: "text-primary",
            glowClass: "bg-primary",
        },
        {
            title: "Total Validators",
            value: epochInfo?.totalValidators ?? 0,
            icon: Users,
            description: "In staking registry",
            color: "text-accent",
            glowClass: "bg-accent",
        },
        {
            title: "Banned Validators",
            value: epochInfo?.bannedValidators ?? 0,
            icon: ShieldOff,
            description: "Protocol violations",
            color: "text-destructive",
            glowClass: "bg-destructive",
        },
    ];

    const smallStats = [
        {
            title: "Current Epoch",
            value: epochInfo?.currentEpoch != null ? `#${epochInfo.currentEpoch}` : '---',
            icon: Hash,
            color: "text-primary",
            show: epochInfo?.currentEpoch != null,
        },
        {
            title: "Min Stake",
            value: epochInfo?.validatorMinStake && epochInfo.validatorMinStake !== '0'
                ? `${formatNumber(Number(BigInt(epochInfo.validatorMinStake) / BigInt(1e18)))} GEN`
                : '---',
            icon: Coins,
            color: "text-accent",
            show: !!(epochInfo?.validatorMinStake && epochInfo.validatorMinStake !== '0'),
        },
        {
            title: "Chain ID",
            value: metrics?.chainId ? String(metrics.chainId) : '---',
            icon: Layers,
            color: "text-muted-foreground",
            show: !!metrics?.chainId,
        },
    ].filter(s => s.show);

    return (
        <div className="space-y-4">
            {/* Primary Stats — 3 equal columns */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                {largeStats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card
                            key={stat.title}
                            className={cn(
                                "relative glass glass-hover overflow-hidden group border-white/5",
                                stat.highlight && "ring-1 ring-primary/20 bg-primary/5"
                            )}
                            style={{ transitionDelay: `${index * 80}ms` }}
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                                    {stat.title}
                                </CardTitle>
                                <div className={cn(
                                    "p-2 rounded-lg bg-secondary/50 border border-white/5 group-hover:scale-110 transition-transform duration-300",
                                    stat.color
                                )}>
                                    <Icon className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <Skeleton className="h-9 w-24 bg-white/5" />
                                ) : (
                                    <div className="space-y-1">
                                        <div className={cn(
                                            "text-3xl font-black tracking-tighter",
                                            stat.highlight && "text-primary drop-shadow-[0_0_15px_rgba(165,90,45,0.3)]"
                                        )}>
                                            {(stat.value as number).toLocaleString()}
                                        </div>
                                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight opacity-70">
                                            {stat.description}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                            <div className={cn(
                                "absolute -right-4 -bottom-4 h-24 w-24 rounded-full opacity-[0.03] blur-3xl group-hover:opacity-[0.06] transition-opacity duration-500",
                                stat.glowClass
                            )} />
                        </Card>
                    );
                })}
            </div>

            {/* Secondary Stats */}
            {smallStats.length > 0 && (
                <div className={cn(
                    "grid gap-3",
                    smallStats.length === 1 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
                    smallStats.length === 2 && "grid-cols-2",
                    smallStats.length === 3 && "grid-cols-1 sm:grid-cols-3",
                )}>
                    {smallStats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <Card
                                key={stat.title}
                                className="glass glass-hover border-white/5 bg-white/[0.02]"
                                style={{ transitionDelay: `${(index + 3) * 80}ms` }}
                            >
                                <CardContent className="flex items-center gap-3 p-4">
                                    <div className={cn("p-2 rounded-lg bg-white/5 flex-shrink-0", stat.color)}>
                                        <Icon className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                                            {stat.title}
                                        </p>
                                        <p className="text-sm font-bold font-mono truncate">
                                            {isLoading ? "..." : stat.value}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
