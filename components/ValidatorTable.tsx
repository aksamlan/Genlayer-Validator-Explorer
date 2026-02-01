"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ValidatorInfo } from "@/types/validator";
import { truncateAddress, cn, formatNumber } from "@/lib/utils";
import { Copy, Users, ChevronDown, ChevronUp, ShieldAlert, Award, Percent, Clock } from "lucide-react";
import React, { useState } from "react";

interface ValidatorTableProps {
    validators: ValidatorInfo[];
    isLoading: boolean;
    tokenSymbol?: string;
}

export function ValidatorTable({ validators, isLoading, tokenSymbol = 'GEN' }: ValidatorTableProps) {
    const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [expandedValidator, setExpandedValidator] = useState<string | null>(null);

    const copyToClipboard = async (address: string) => {
        try {
            await navigator.clipboard.writeText(address);
            setCopiedAddress(address);
            setTimeout(() => setCopiedAddress(null), 2000);
        } catch (err) {
            console.error('Failed to copy address:', err);
        }
    };

    // Filter validators based on search query
    const filteredValidators = validators.filter(validator => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            validator.address.toLowerCase().includes(query) ||
            validator.moniker.toLowerCase().includes(query)
        );
    });

    if (isLoading) {
        return (
            <Card className="glass border-white/5">
                <CardHeader>
                    <Skeleton className="h-6 w-32 bg-white/5" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} className="h-16 w-full bg-white/5 rounded-xl" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-card/90 backdrop-blur-xl border-white/10 overflow-hidden shadow-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
            <CardHeader className="bg-white/[0.02] border-b border-white/5 py-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-lg font-bold tracking-tight">Active Validator Registry</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {filteredValidators.length} of {validators.length} validators
                        </p>
                    </div>
                    <div className="relative w-full sm:w-64">
                        <input
                            type="text"
                            placeholder="Search by address..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-muted-foreground/50"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors text-lg px-2"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/5 hover:bg-transparent">
                                <TableHead className="w-10"></TableHead>
                                <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/80 py-4">Validator</TableHead>
                                <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/80">Address</TableHead>
                                <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/80">Stake (Total/Self)</TableHead>
                                <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/80">Performance</TableHead>
                                <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/80">Score</TableHead>
                                <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/80">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {validators.length === 0 ? (
                                <TableRow className="hover:bg-transparent">
                                    <TableCell colSpan={7} className="text-center py-20">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-4 rounded-full bg-secondary/30 text-muted-foreground">
                                                <Users className="h-8 w-8 opacity-20" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-foreground/80">No active validators found</p>
                                                <p className="text-xs text-muted-foreground">Syncing with GenLayer testnet...</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredValidators.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        No validators found matching "{searchQuery}"
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredValidators.map((validator, index) => {
                                    const isExpanded = expandedValidator === validator.address;
                                    return (
                                        <React.Fragment key={validator.address}>
                                            <TableRow
                                                className={cn(
                                                    "border-white/5 group transition-all duration-300 cursor-pointer",
                                                    index % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent",
                                                    "hover:bg-white/[0.05] hover:border-white/10",
                                                    isExpanded && "bg-white/[0.08] border-primary/20"
                                                )}
                                                onClick={() => setExpandedValidator(isExpanded ? null : validator.address)}
                                            >
                                                <TableCell className="p-0 text-center">
                                                    <div className="flex justify-center">
                                                        {isExpanded ? (
                                                            <ChevronUp className="h-4 w-4 text-primary animate-bounce-subtle" />
                                                        ) : (
                                                            <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-semibold py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative">
                                                            {validator.logoUri ? (
                                                                <img
                                                                    src={validator.logoUri}
                                                                    alt={validator.moniker}
                                                                    className="h-8 w-8 rounded-full border border-white/10"
                                                                    onError={(e) => {
                                                                        (e.target as HTMLImageElement).src = `https://avatar.vercel.sh/${validator.address}`;
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="h-8 w-8 rounded-full bg-secondary/50 flex items-center justify-center border border-white/5">
                                                                    <Users className="h-4 w-4 text-muted-foreground/50" />
                                                                </div>
                                                            )}
                                                            <div className={cn(
                                                                "absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-background",
                                                                validator.isActive ? "bg-primary shadow-[0_0_8px_rgba(165,90,45,0.5)]" : "bg-muted"
                                                            )} />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="truncate max-w-[150px] group-hover:text-primary transition-colors leading-tight font-bold">
                                                                {validator.moniker || truncateAddress(validator.address)}
                                                            </span>
                                                            {validator.identity && (
                                                                <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                                                                    {validator.identity.replace(/^https?:\/\//, '')}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <code className="text-[11px] text-muted-foreground font-mono bg-secondary/30 px-2 py-0.5 rounded-md border border-white/5">
                                                            {truncateAddress(validator.address)}
                                                        </code>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); copyToClipboard(validator.address); }}
                                                            className="text-muted-foreground hover:text-foreground transition-all p-1.5 rounded-md hover:bg-secondary/50 group/copy"
                                                            title="Copy full address"
                                                        >
                                                            <Copy className="h-3 w-3 group-hover/copy:scale-110 transition-transform" />
                                                        </button>
                                                        {copiedAddress === validator.address && (
                                                            <span className="text-[10px] text-primary font-bold tracking-tighter animate-in fade-in zoom-in-75">COPIED</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-0.5">
                                                        <div className="text-xs font-black tracking-tight flex items-center gap-1.5">
                                                            {formatNumber(Number(BigInt(validator.stake) / BigInt(1e18)))}
                                                            <span className="text-[9px] text-muted-foreground font-bold">{tokenSymbol}</span>
                                                        </div>
                                                        <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter opacity-70">
                                                            Self: {formatNumber(Number(BigInt(validator.selfStake) / BigInt(1e18)))}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-0.5">
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="h-1.5 w-12 bg-white/5 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-primary"
                                                                    style={{ width: `${validator.uptime}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-[10px] font-black">{validator.uptime.toFixed(1)}%</span>
                                                        </div>
                                                        <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">
                                                            Blocks: {validator.blocksProduced}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col items-start gap-1">
                                                        <Badge variant="outline" className={cn(
                                                            "bg-white/5 border-white/10 text-[10px] font-black h-5",
                                                            validator.consensusScore > 90 ? "text-primary" : "text-muted-foreground"
                                                        )}>
                                                            {validator.consensusScore}
                                                        </Badge>
                                                        <span className="text-[9px] text-muted-foreground font-bold tracking-tighter uppercase opacity-60">
                                                            Score
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {validator.isBanned ? (
                                                        <Badge variant="destructive" className="rounded-md text-[9px] tracking-widest font-black py-0">BANNED</Badge>
                                                    ) : validator.isActive ? (
                                                        <Badge variant="success" className="rounded-md bg-primary/20 text-primary border-primary/20 text-[9px] tracking-widest font-black py-0">ACTIVE</Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="rounded-md text-[9px] tracking-widest font-black py-0">INACTIVE</Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                            {isExpanded && (
                                                <TableRow className="bg-white/[0.04] border-white/5 hover:bg-white/[0.04]">
                                                    <TableCell colSpan={7} className="p-6">
                                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in slide-in-from-top-2 duration-300">
                                                            {/* Staking Details */}
                                                            <div className="space-y-3">
                                                                <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-primary tracking-widest">
                                                                    <Percent className="h-3 w-3" />
                                                                    Staking Details
                                                                </div>
                                                                <div className="glass-v2 p-4 rounded-xl border border-white/5 space-y-3">
                                                                    <div className="flex justify-between items-end">
                                                                        <span className="text-[10px] text-muted-foreground">Commission</span>
                                                                        <span className="text-sm font-bold">{validator.commission}%</span>
                                                                    </div>
                                                                    <div className="flex justify-between items-end">
                                                                        <span className="text-[10px] text-muted-foreground">Delegated</span>
                                                                        <span className="text-sm font-bold">{formatNumber(Number(BigInt(validator.delegatedStake) / BigInt(1e18)))}</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Performance */}
                                                            <div className="space-y-3">
                                                                <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-accent tracking-widest">
                                                                    <Clock className="h-3 w-3" />
                                                                    Reliability
                                                                </div>
                                                                <div className="glass-v2 p-4 rounded-xl border border-white/5 space-y-3">
                                                                    <div className="flex justify-between items-end">
                                                                        <span className="text-[10px] text-muted-foreground">Missed Blocks</span>
                                                                        <span className="text-sm font-bold text-destructive">{validator.missedBlocks}</span>
                                                                    </div>
                                                                    <div className="flex justify-between items-end">
                                                                        <span className="text-[10px] text-muted-foreground">Last Block</span>
                                                                        <span className="text-sm font-bold">{validator.lastBlockTime ? new Date(validator.lastBlockTime).toLocaleTimeString() : 'N/A'}</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Consensus Stats */}
                                                            <div className="space-y-3">
                                                                <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-primary tracking-widest">
                                                                    <Award className="h-3 w-3" />
                                                                    Consensus
                                                                </div>
                                                                <div className="glass-v2 p-4 rounded-xl border border-white/5 space-y-3">
                                                                    <div className="flex justify-between items-end">
                                                                        <span className="text-[10px] text-muted-foreground">Appeal Success</span>
                                                                        <span className="text-sm font-bold text-primary">{validator.appealSuccessRate}%</span>
                                                                    </div>
                                                                    <div className="flex justify-between items-end">
                                                                        <span className="text-[10px] text-muted-foreground">Score Rank</span>
                                                                        <span className="text-sm font-bold"># {index + 1}</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Jailed Info (If applicable) */}
                                                            <div className="space-y-3">
                                                                <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                                                                    <ShieldAlert className="h-3 w-3" />
                                                                    Security Status
                                                                </div>
                                                                <div className="glass-v2 p-4 rounded-xl border border-white/5 h-[84px] flex items-center justify-center">
                                                                    {validator.isBanned || validator.jailedReason ? (
                                                                        <div className="text-center">
                                                                            <p className="text-[10px] text-destructive font-black uppercase">{validator.jailedReason || 'BANNED BY PROTOCOL'}</p>
                                                                            {validator.unlockTime && (
                                                                                <p className="text-[9px] text-muted-foreground mt-1">Unlocks: {new Date(validator.unlockTime).toLocaleDateString()}</p>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <p className="text-[10px] text-primary font-black uppercase tracking-widest">In Good Standing</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
