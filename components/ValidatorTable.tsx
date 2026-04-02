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
import {
    Copy, Users, ChevronDown, ChevronUp, ShieldAlert, Layers,
    ChevronLeft, ChevronRight, Globe, ArrowDownToLine, ArrowUpFromLine
} from "lucide-react";
import React, { useState, useMemo } from "react";

interface ValidatorTableProps {
    validators: ValidatorInfo[];
    isLoading: boolean;
    tokenSymbol?: string;
}

const ITEMS_PER_PAGE = 10;

type FilterTab = 'all' | 'active' | 'banned' | 'inactive';

const STATUS_ORDER: Record<string, number> = { active: 0, banned: 1, inactive: 2 };

function getStatus(v: ValidatorInfo): 'active' | 'banned' | 'inactive' {
    if (v.isBanned) return 'banned';
    if (v.isActive) return 'active';
    return 'inactive';
}

export function ValidatorTable({ validators, isLoading, tokenSymbol = 'GEN' }: ValidatorTableProps) {
    const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedValidator, setExpandedValidator] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

    const copyToClipboard = async (address: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(address);
            setCopiedAddress(address);
            setTimeout(() => setCopiedAddress(null), 2000);
        } catch { /* ignore */ }
    };

    // Counts for filter tabs
    const counts = useMemo(() => ({
        all: validators.length,
        active: validators.filter(v => v.isActive && !v.isBanned).length,
        banned: validators.filter(v => v.isBanned).length,
        inactive: validators.filter(v => !v.isActive && !v.isBanned).length,
    }), [validators]);

    // Sort active first, then banned, then inactive — then filter + search
    const sorted = useMemo(() =>
        [...validators].sort((a, b) => STATUS_ORDER[getStatus(a)] - STATUS_ORDER[getStatus(b)]),
        [validators]
    );

    const filtered = useMemo(() => {
        let list = sorted;
        if (activeFilter !== 'all') {
            list = list.filter(v => getStatus(v) === activeFilter);
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            list = list.filter(v =>
                v.address.toLowerCase().includes(q) ||
                v.moniker.toLowerCase().includes(q)
            );
        }
        return list;
    }, [sorted, activeFilter, searchQuery]);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleSearch = (q: string) => { setSearchQuery(q); setCurrentPage(1); setExpandedValidator(null); };
    const handleFilter = (f: FilterTab) => { setActiveFilter(f); setCurrentPage(1); setExpandedValidator(null); };

    if (isLoading) {
        return (
            <Card className="glass border-white/5">
                <CardHeader><Skeleton className="h-6 w-32 bg-white/5" /></CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <Skeleton key={i} className="h-16 w-full bg-white/5 rounded-xl" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    const tabs: { key: FilterTab; label: string; color: string; activeClass: string }[] = [
        { key: 'all', label: 'All', color: 'text-foreground', activeClass: 'bg-white/10 text-foreground border-white/20' },
        { key: 'active', label: 'Active', color: 'text-primary', activeClass: 'bg-primary/15 text-primary border-primary/30' },
        { key: 'banned', label: 'Banned', color: 'text-destructive', activeClass: 'bg-destructive/15 text-destructive border-destructive/30' },
        { key: 'inactive', label: 'Inactive', color: 'text-muted-foreground', activeClass: 'bg-white/5 text-muted-foreground border-white/10' },
    ];

    return (
        <Card className="bg-card/90 backdrop-blur-xl border-white/10 overflow-hidden shadow-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

            {/* Header */}
            <CardHeader className="bg-white/[0.02] border-b border-white/5 py-4">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-lg font-bold tracking-tight">Staking Registry</CardTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {filtered.length} of {validators.length} validators
                            </p>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <input
                                type="text"
                                placeholder="Search by address or name..."
                                value={searchQuery}
                                onChange={e => handleSearch(e.target.value)}
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-muted-foreground/50"
                            />
                            {searchQuery && (
                                <button onClick={() => handleSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground px-2 text-lg">✕</button>
                            )}
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2 flex-wrap">
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => handleFilter(tab.key)}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[11px] font-black uppercase tracking-widest transition-all",
                                    activeFilter === tab.key
                                        ? tab.activeClass
                                        : "bg-transparent text-muted-foreground/60 border-white/5 hover:border-white/10 hover:text-muted-foreground"
                                )}
                            >
                                {tab.label}
                                <span className={cn(
                                    "text-[9px] font-black px-1 py-0.5 rounded min-w-[18px] text-center",
                                    activeFilter === tab.key ? "bg-white/20" : "bg-white/5"
                                )}>
                                    {counts[tab.key]}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/5 hover:bg-transparent">
                                <TableHead className="w-8 text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60 py-4 pl-4">#</TableHead>
                                <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/80">Validator</TableHead>
                                <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/80">Address</TableHead>
                                <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/80">Total Stake</TableHead>
                                <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/80">Delegated</TableHead>
                                <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/80">Status</TableHead>
                                <TableHead className="w-8" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {validators.length === 0 ? (
                                <TableRow className="hover:bg-transparent">
                                    <TableCell colSpan={7} className="text-center py-20">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-4 rounded-full bg-secondary/30"><Users className="h-8 w-8 opacity-20 text-muted-foreground" /></div>
                                            <p className="text-sm font-semibold text-foreground/80">No active validators found</p>
                                            <p className="text-xs text-muted-foreground">Syncing with GenLayer testnet...</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground text-sm">
                                        No validators match your search.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginated.map((validator, pageIdx) => {
                                    const globalIdx = (currentPage - 1) * ITEMS_PER_PAGE + pageIdx;
                                    const isExpanded = expandedValidator === validator.address;
                                    const status = getStatus(validator);
                                    const totalStakeGEN = BigInt(validator.stake) / BigInt(1e18);
                                    const delegatedGEN = BigInt(validator.delegatedStake) / BigInt(1e18);
                                    const pendingDepGEN = BigInt(validator.pendingDeposits) / BigInt(1e18);
                                    const pendingWithGEN = BigInt(validator.pendingWithdrawals) / BigInt(1e18);

                                    return (
                                        <React.Fragment key={validator.address}>
                                            <TableRow
                                                className={cn(
                                                    "border-white/5 group transition-all duration-200 cursor-pointer",
                                                    pageIdx % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent",
                                                    "hover:bg-white/[0.05]",
                                                    isExpanded && "bg-white/[0.07] border-l-2",
                                                    isExpanded && status === 'active' && "border-l-primary/50",
                                                    isExpanded && status === 'banned' && "border-l-destructive/50",
                                                    isExpanded && status === 'inactive' && "border-l-muted/50",
                                                )}
                                                onClick={() => setExpandedValidator(isExpanded ? null : validator.address)}
                                            >
                                                <TableCell className="text-[11px] text-muted-foreground/40 font-bold pl-4 w-8">
                                                    {globalIdx + 1}
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative flex-shrink-0">
                                                            {validator.logoUri ? (
                                                                <img
                                                                    src={validator.logoUri}
                                                                    alt={validator.moniker}
                                                                    className="h-8 w-8 rounded-full border border-white/10 object-cover"
                                                                    onError={e => { (e.target as HTMLImageElement).src = `https://avatar.vercel.sh/${validator.address}`; }}
                                                                />
                                                            ) : (
                                                                <div className="h-8 w-8 rounded-full bg-secondary/50 flex items-center justify-center border border-white/5">
                                                                    <Users className="h-4 w-4 text-muted-foreground/40" />
                                                                </div>
                                                            )}
                                                            <div className={cn(
                                                                "absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-background",
                                                                status === 'active' && "bg-primary",
                                                                status === 'banned' && "bg-destructive",
                                                                status === 'inactive' && "bg-muted-foreground/40"
                                                            )} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold truncate max-w-[140px] group-hover:text-primary transition-colors">
                                                                {validator.moniker || truncateAddress(validator.address)}
                                                            </p>
                                                            {validator.identity && (
                                                                <p className="text-[10px] text-muted-foreground truncate max-w-[130px]">
                                                                    {validator.identity.replace(/^https?:\/\//, '')}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5">
                                                        <code className="text-[11px] text-muted-foreground font-mono bg-secondary/30 px-2 py-0.5 rounded-md border border-white/5">
                                                            {truncateAddress(validator.address)}
                                                        </code>
                                                        <button
                                                            onClick={e => copyToClipboard(validator.address, e)}
                                                            className="p-1 rounded-md hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-all group/cp"
                                                            title="Copy address"
                                                        >
                                                            <Copy className="h-3 w-3 group-hover/cp:scale-110 transition-transform" />
                                                        </button>
                                                        {copiedAddress === validator.address && (
                                                            <span className="text-[9px] text-primary font-black animate-in fade-in">✓</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-xs font-black">
                                                        {formatNumber(Number(totalStakeGEN))}
                                                        <span className="text-[9px] text-muted-foreground font-bold ml-1">{tokenSymbol}</span>
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-xs font-black">
                                                        {formatNumber(Number(delegatedGEN))}
                                                        <span className="text-[9px] text-muted-foreground font-bold ml-1">{tokenSymbol}</span>
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {status === 'banned' ? (
                                                        <Badge variant="destructive" className="rounded-md text-[9px] tracking-widest font-black py-0 px-2">BANNED</Badge>
                                                    ) : status === 'active' ? (
                                                        <Badge className="rounded-md bg-primary/20 text-primary border border-primary/30 text-[9px] tracking-widest font-black py-0 px-2">ACTIVE</Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="rounded-md text-[9px] tracking-widest font-black py-0 px-2">INACTIVE</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="pr-3">
                                                    <div className="flex justify-center">
                                                        {isExpanded
                                                            ? <ChevronUp className="h-4 w-4 text-primary" />
                                                            : <ChevronDown className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                                                        }
                                                    </div>
                                                </TableCell>
                                            </TableRow>

                                            {/* Expanded detail row */}
                                            {isExpanded && (
                                                <TableRow className="bg-white/[0.03] border-white/5 hover:bg-white/[0.03]">
                                                    <TableCell colSpan={7} className="p-5">
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-top-2 duration-200">

                                                            {/* Staking */}
                                                            <div className="space-y-2">
                                                                <p className="text-[10px] uppercase font-black tracking-widest text-primary flex items-center gap-1.5">
                                                                    <Layers className="h-3 w-3" /> Staking
                                                                </p>
                                                                <div className="bg-white/[0.04] rounded-xl border border-white/5 divide-y divide-white/5">
                                                                    <DetailRow label="Total Stake" value={`${formatNumber(Number(totalStakeGEN))} ${tokenSymbol}`} />
                                                                    <DetailRow label="Delegated" value={`${formatNumber(Number(delegatedGEN))} ${tokenSymbol}`} />
                                                                    <DetailRow label="Shares" value={formatShares(BigInt(validator.shares))} mono />
                                                                </div>
                                                            </div>

                                                            {/* Pending */}
                                                            <div className="space-y-2">
                                                                <p className="text-[10px] uppercase font-black tracking-widest text-accent flex items-center gap-1.5">
                                                                    <ArrowDownToLine className="h-3 w-3" /> Pending
                                                                </p>
                                                                <div className="bg-white/[0.04] rounded-xl border border-white/5 divide-y divide-white/5">
                                                                    <DetailRow
                                                                        label="Deposit"
                                                                        value={pendingDepGEN > 0n ? `+${formatNumber(Number(pendingDepGEN))} ${tokenSymbol}` : '—'}
                                                                        valueClass={pendingDepGEN > 0n ? "text-primary" : "text-muted-foreground/50"}
                                                                    />
                                                                    <DetailRow
                                                                        label="Withdrawal"
                                                                        value={pendingWithGEN > 0n ? `-${formatNumber(Number(pendingWithGEN))} ${tokenSymbol}` : '—'}
                                                                        valueClass={pendingWithGEN > 0n ? "text-yellow-500" : "text-muted-foreground/50"}
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* Status */}
                                                            <div className="space-y-2">
                                                                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground flex items-center gap-1.5">
                                                                    <ShieldAlert className="h-3 w-3" /> Status
                                                                </p>
                                                                <div className="bg-white/[0.04] rounded-xl border border-white/5 divide-y divide-white/5">
                                                                    <DetailRow
                                                                        label="Live"
                                                                        value={validator.isActive ? "Active" : "Inactive"}
                                                                        valueClass={validator.isActive ? "text-primary font-black" : "text-muted-foreground"}
                                                                    />
                                                                    <DetailRow
                                                                        label="Security"
                                                                        value={validator.isBanned ? "Banned" : "Good Standing"}
                                                                        valueClass={validator.isBanned ? "text-destructive font-black" : "text-primary"}
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* Identity */}
                                                            <div className="space-y-2">
                                                                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground flex items-center gap-1.5">
                                                                    <Globe className="h-3 w-3" /> Identity
                                                                </p>
                                                                <div className="bg-white/[0.04] rounded-xl border border-white/5 p-3 space-y-2">
                                                                    <div>
                                                                        <p className="text-[9px] text-muted-foreground/60 uppercase tracking-wider mb-0.5">Address</p>
                                                                        <button
                                                                            onClick={e => copyToClipboard(validator.address, e)}
                                                                            className="text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors break-all text-left"
                                                                        >
                                                                            {validator.address}
                                                                        </button>
                                                                    </div>
                                                                    {validator.identity && (
                                                                        <div>
                                                                            <p className="text-[9px] text-muted-foreground/60 uppercase tracking-wider mb-0.5">Website</p>
                                                                            <a
                                                                                href={validator.identity.startsWith('http') ? validator.identity : `https://${validator.identity}`}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="text-[11px] text-primary hover:underline truncate block"
                                                                                onClick={e => e.stopPropagation()}
                                                                            >
                                                                                {validator.identity.replace(/^https?:\/\//, '')}
                                                                            </a>
                                                                        </div>
                                                                    )}
                                                                    {!validator.identity && !validator.moniker && (
                                                                        <p className="text-[10px] text-muted-foreground/40 italic">No identity registered</p>
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

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-white/5 bg-white/[0.01]">
                        <span className="text-[11px] text-muted-foreground/60 font-bold">
                            Page {currentPage} / {totalPages} · {filtered.length} validators
                        </span>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </button>
                            {buildPageNumbers(currentPage, totalPages).map((p, i) =>
                                p === '...' ? (
                                    <span key={`e${i}`} className="px-1 text-[11px] text-muted-foreground/40">…</span>
                                ) : (
                                    <button
                                        key={p}
                                        onClick={() => setCurrentPage(p as number)}
                                        className={cn(
                                            "min-w-[28px] h-7 rounded-lg text-[11px] font-bold transition-all",
                                            currentPage === p
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "bg-white/5 border border-white/10 hover:bg-white/10 text-muted-foreground"
                                        )}
                                    >
                                        {p}
                                    </button>
                                )
                            )}
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// Small helper component for detail rows inside expanded section
function DetailRow({
    label, value, mono = false, valueClass = ''
}: { label: string; value: string; mono?: boolean; valueClass?: string }) {
    return (
        <div className="flex justify-between items-center px-3 py-2 gap-2">
            <span className="text-[10px] text-muted-foreground/70 flex-shrink-0">{label}</span>
            <span className={cn("text-xs font-bold text-right", mono && "font-mono", valueClass)}>{value}</span>
        </div>
    );
}

function formatShares(shares: bigint): string {
    if (shares === 0n) return '0';
    const s = shares.toString();
    if (s.length > 10) return `${s.slice(0, 6)}…${s.slice(-4)}`;
    return s;
}

function buildPageNumbers(current: number, total: number): (number | '...')[] {
    const pages = Array.from({ length: total }, (_, i) => i + 1);
    return pages
        .filter(p => p === 1 || p === total || Math.abs(p - current) <= 1)
        .reduce<(number | '...')[]>((acc, p, idx, arr) => {
            if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...');
            acc.push(p);
            return acc;
        }, []);
}
