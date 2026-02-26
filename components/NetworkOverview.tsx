"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { EpochInfo } from "@/types/validator";
import { Shield, Users, Clock, Activity, Zap, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface NetworkOverviewProps {
    epochInfo: EpochInfo | null;
    isLoading: boolean;
    uptime?: string;
    metrics?: {
        chainId: number;
        gasPrice: string;
        avgBlockTime: string;
    };
}

export function NetworkOverview({ epochInfo, isLoading, uptime, metrics }: NetworkOverviewProps) {
    const stats = [
        // Principal Stats (Large Cards)
        {
            title: "Active Validators",
            value: epochInfo?.activeValidators || 0,
            icon: Shield,
            description: "Currently validating",
            highlight: true,
            color: "text-primary",
            show: true,
            size: "large"
        },
        {
            title: "Total Validators",
            value: epochInfo?.totalValidators || 0,
            icon: Users,
            description: "In registry",
            color: "text-accent",
            show: true,
            size: "large"
        },
        {
            title: "Network Uptime",
            value: uptime || '---',
            icon: Clock,
            description: "Since genesis",
            color: "text-primary",
            show: !!uptime,
            isText: true,
            size: "large"
        },
        // Secondary Stats (Small Cards)
        {
            title: "Chain ID",
            value: metrics?.chainId || '---',
            icon: Layers,
            description: "Network Identifier",
            color: "text-muted-foreground",
            show: !!metrics?.chainId,
            isText: true,
            size: "small"
        },
        {
            title: "Gas Price",
            value: metrics?.gasPrice ? `${metrics.gasPrice} Gwei` : '---',
            icon: Zap,
            description: "Average Cost",
            color: "text-yellow-500",
            show: !!metrics?.gasPrice,
            isText: true,
            size: "small"
        },
        {
            title: "Avg Block Time",
            value: metrics?.avgBlockTime ? `${metrics.avgBlockTime}s` : '---',
            icon: Activity,
            description: "Last 100 blocks",
            color: "text-blue-500",
            show: !!metrics?.avgBlockTime,
            isText: true,
            size: "small"
        }
    ].filter(stat => stat.show);

    return (
        <div className="space-y-6">
            {/* Primary Stats */}
            <div className="grid gap-6 md:grid-cols-3">
                {stats.filter(s => s.size === 'large').map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card
                            key={stat.title}
                            className={cn(
                                "glass glass-hover overflow-hidden group border-white/5",
                                stat.highlight && "ring-1 ring-primary/20 bg-primary/5"
                            )}
                            style={{ transitionDelay: `${index * 100}ms` }}
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
                                            {stat.isText ? stat.value : (stat.value as number).toLocaleString()}
                                        </div>
                                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight opacity-70">
                                            {stat.description}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                            <div className={cn(
                                "absolute -right-4 -bottom-4 h-24 w-24 rounded-full opacity-[0.03] blur-3xl group-hover:opacity-[0.08] transition-opacity duration-500",
                                stat.highlight ? "bg-primary" : "bg-white"
                            )} />
                        </Card>
                    );
                })}
            </div>

            {/* Secondary Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                {stats.filter(s => s.size === 'small').map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card
                            key={stat.title}
                            className="glass glass-hover border-white/5 bg-white/[0.02]"
                            style={{ transitionDelay: `${(index + 3) * 100}ms` }}
                        >
                            <CardContent className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                    <div className={cn("p-1.5 rounded-md bg-white/5", stat.color)}>
                                        <Icon className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                                            {stat.title}
                                        </p>
                                        <p className="text-sm font-bold font-mono">
                                            {isLoading ? "..." : stat.value}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
