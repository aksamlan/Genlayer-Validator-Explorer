"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
    Shield, Copy, Globe, Coins, Layers, ArrowUpFromLine, ArrowDownToLine,
    ExternalLink, Crown, Twitter, Github, Send, Mail, User, GitBranch, Activity,
    AlertTriangle, FileCode, Sparkles, Banknote, Wallet
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { SectionHeader } from '@/components/SectionHeader';
import { validatorService } from '@/lib/validator-service';
import { DEFAULT_NETWORK } from '@/lib/networks';
import { getAddressBalance, getAddressTxCount } from '@/lib/explorer-rpc';
import { isOwnerValidator } from '@/lib/my-node';
import { useToast } from '@/components/Toaster';
import { fmtEther, fmtNumber } from '@/lib/format';
import { truncateAddress, cn } from '@/lib/utils';
import type { ValidatorInfo } from '@/types/validator';
import type { Address } from 'viem';

const ZERO = '0x0000000000000000000000000000000000000000';

export default function ValidatorDetailPage() {
    const params = useParams<{ address: string }>();
    const addr = params?.address?.toLowerCase() as Address | undefined;
    const toast = useToast();

    const [validator, setValidator] = useState<ValidatorInfo | null>(null);
    const [balance, setBalance] = useState<bigint | null>(null);
    const [txCount, setTxCount] = useState<number | null>(null);
    const [operatorBalance, setOperatorBalance] = useState<bigint | null>(null);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        if (!addr) return;
        let cancelled = false;
        (async () => {
            try {
                const [stats, bal, tx] = await Promise.all([
                    validatorService.getNetworkStats(DEFAULT_NETWORK),
                    getAddressBalance(addr).catch(() => null),
                    getAddressTxCount(addr).catch(() => null),
                ]);
                if (cancelled) return;
                const v = stats.validators.find(x => x.address.toLowerCase() === addr.toLowerCase());
                if (!v) {
                    setErr('Validator not found in active registry.');
                    return;
                }
                setValidator(v);
                setBalance(bal);
                setTxCount(tx);
                if (v.operator && v.operator !== ZERO) {
                    const opBal = await getAddressBalance(v.operator as Address).catch(() => null);
                    if (!cancelled) setOperatorBalance(opBal);
                }
                setErr(null);
            } catch (e) {
                if (!cancelled) setErr(e instanceof Error ? e.message : 'Failed');
            }
        })();
        return () => { cancelled = true; };
    }, [addr]);

    if (!addr) return null;
    const isOwner = isOwnerValidator(addr);

    const copy = (text: string, label = 'Address') => {
        navigator.clipboard.writeText(text).then(() => {
            toast.push({ kind: 'success', title: `${label} copied`, description: truncateAddress(text) });
        });
    };

    if (err) {
        return (
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Card className="glass border-destructive/20 bg-destructive/5">
                    <CardContent className="p-6 text-sm">
                        <p className="text-destructive font-bold">{err}</p>
                        <p className="text-xs font-mono text-muted-foreground mt-2 break-all">{addr}</p>
                        <Link href="/validators" className="text-primary text-xs mt-4 inline-block hover:underline">← Back to validators</Link>
                    </CardContent>
                </Card>
            </main>
        );
    }

    const stakeGEN = (s: string | undefined) =>
        s && s !== '0' ? fmtNumber(BigInt(s) / BigInt(1e18)) : '0';

    return (
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

            {/* Hero card */}
            <Card className={cn(
                "relative overflow-hidden glass border-white/5",
                isOwner && "border-primary/30 bg-gradient-to-br from-primary/10 via-card/40 to-accent/10"
            )}>
                {isOwner && <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-primary/15 blur-3xl pointer-events-none" />}
                <CardContent className="p-6 sm:p-8 relative">
                    {!validator ? (
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-16 w-16 rounded-2xl bg-white/5" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-6 w-40 bg-white/5" />
                                <Skeleton className="h-4 w-60 bg-white/5" />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-start gap-5 flex-wrap">
                            {validator.logoUri ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={validator.logoUri}
                                    alt={validator.moniker}
                                    className="h-20 w-20 rounded-2xl border border-white/10 object-cover"
                                    onError={e => { (e.target as HTMLImageElement).src = `https://avatar.vercel.sh/${validator.address}`; }}
                                />
                            ) : (
                                <div className="h-20 w-20 rounded-2xl bg-primary/15 flex items-center justify-center border border-primary/30">
                                    <Shield className="h-9 w-9 text-primary" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0 space-y-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-2xl sm:text-3xl font-black tracking-tighter truncate">
                                        {validator.moniker || truncateAddress(validator.address)}
                                    </h1>
                                    {isOwner && (
                                        <Badge className="bg-accent/20 text-accent border-accent/30 text-[9px] tracking-widest font-black flex items-center gap-1">
                                            <Crown className="h-2.5 w-2.5" /> MY NODE
                                        </Badge>
                                    )}
                                    <Badge className={cn(
                                        "text-[9px] tracking-widest font-black",
                                        validator.isBanned ? "bg-destructive/20 text-destructive border-destructive/30" :
                                        validator.isActive ? "bg-primary/15 text-primary border-primary/30" :
                                        "bg-muted text-muted-foreground"
                                    )}>
                                        {validator.isBanned ? 'BANNED' : validator.isActive ? 'ACTIVE' : 'INACTIVE'}
                                    </Badge>
                                </div>

                                {validator.description && (
                                    <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                                        {validator.description}
                                    </p>
                                )}

                                <div className="flex items-center gap-2 pt-1">
                                    <code className="font-mono text-xs text-muted-foreground break-all">{validator.address}</code>
                                    <button onClick={() => copy(validator.address, 'Validator address')} className="text-muted-foreground hover:text-primary flex-shrink-0">
                                        <Copy className="h-3 w-3" />
                                    </button>
                                </div>

                                {/* Social links */}
                                <SocialRow validator={validator} />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Stake summary */}
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 stagger-children">
                <Stat icon={Coins} label="Total Stake" value={validator ? `${stakeGEN(validator.stake)} GEN` : null} accent="primary" />
                <Stat icon={Layers} label="Self Stake" value={validator ? `${stakeGEN(validator.selfStake)} GEN` : null} />
                <Stat icon={Shield} label="Delegated" value={validator ? `${stakeGEN(validator.delegatedStake)} GEN` : null} accent="accent" />
                <Stat icon={Wallet} label="EVM Balance" value={balance !== null ? `${fmtEther(balance)} GEN` : null} />
            </div>

            {/* Pending Ops */}
            {validator && (BigInt(validator.pendingDeposits) > 0n || BigInt(validator.pendingWithdrawals) > 0n) && (
                <div className="space-y-3">
                    <SectionHeader accent="accent" title="Pending Operations" />
                    <div className="grid gap-3 sm:grid-cols-2 stagger-children">
                        {BigInt(validator.pendingDeposits) > 0n && (
                            <Card className="glass card-lift border-primary/20 bg-primary/5">
                                <CardContent className="p-5 flex items-center gap-3">
                                    <ArrowDownToLine className="h-6 w-6 text-primary" />
                                    <div>
                                        <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Pending Deposit</p>
                                        <p className="text-2xl font-black mt-1 font-mono">
                                            +{stakeGEN(validator.pendingDeposits)}
                                            <span className="text-xs text-muted-foreground ml-1.5">GEN</span>
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                        {BigInt(validator.pendingWithdrawals) > 0n && (
                            <Card className="glass card-lift border-yellow-500/20 bg-yellow-500/5">
                                <CardContent className="p-5 flex items-center gap-3">
                                    <ArrowUpFromLine className="h-6 w-6 text-yellow-500" />
                                    <div>
                                        <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Pending Withdrawal</p>
                                        <p className="text-2xl font-black mt-1 font-mono">
                                            -{stakeGEN(validator.pendingWithdrawals)}
                                            <span className="text-xs text-muted-foreground ml-1.5">GEN</span>
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            )}

            {/* Banned warning */}
            {validator?.isBanned && validator.bannedEpoch && (
                <Card className="glass border-destructive/30 bg-destructive/10">
                    <CardContent className="p-5 flex items-center gap-4">
                        <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0" />
                        <div>
                            <p className="text-sm font-black uppercase tracking-widest text-destructive">Banned</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Banned at epoch <span className="text-foreground font-bold font-mono">#{validator.bannedEpoch}</span> for protocol violation.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Roles */}
            <div className="space-y-3">
                <SectionHeader accent="primary" title="Roles & Wallets" subtitle="Operator runs the node, owner controls staking; validator address holds the registry entry." />
                <div className="grid gap-3 lg:grid-cols-3 stagger-children">
                    <RoleCard
                        icon={Shield}
                        label="Validator"
                        address={validator?.address}
                        balance={balance}
                        txCount={txCount}
                        primary
                        onCopy={(a) => copy(a, 'Validator address')}
                    />
                    <RoleCard
                        icon={Activity}
                        label="Operator"
                        address={validator?.operator && validator.operator !== ZERO ? validator.operator : null}
                        balance={operatorBalance}
                        txCount={null}
                        onCopy={(a) => copy(a, 'Operator address')}
                    />
                    <RoleCard
                        icon={User}
                        label="Owner"
                        address={validator?.owner && validator.owner !== ZERO ? validator.owner : null}
                        balance={null}
                        txCount={null}
                        onCopy={(a) => copy(a, 'Owner address')}
                    />
                </div>
            </div>

            {/* On-chain details */}
            <div className="space-y-3">
                <SectionHeader accent="accent" title="On-chain Details" subtitle="Raw values read from the staking contract" />
                <Card className="glass border-white/5">
                    <CardContent className="p-0">
                        {!validator ? (
                            <div className="p-6 space-y-3">
                                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-5 w-full bg-white/5" />)}
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                <Row label="Shares (validator)">
                                    <code className="font-mono text-xs">{validator.shares}</code>
                                </Row>
                                <Row label="Shares (delegated)">
                                    <code className="font-mono text-xs">{validator.delegatedShares || '0'}</code>
                                </Row>
                                <Row label="Status">
                                    <span className="text-xs font-bold">
                                        {validator.isBanned ? 'Banned' : validator.isActive ? 'Active in validator set' : 'Inactive'}
                                    </span>
                                </Row>
                                {validator.primedEpoch && validator.primedEpoch !== '0' && (
                                    <Row label="Primed Epoch">
                                        <span className="text-xs font-mono">#{validator.primedEpoch}</span>
                                    </Row>
                                )}
                                {validator.bannedEpoch && validator.bannedEpoch !== '0' && (
                                    <Row label="Banned Epoch">
                                        <span className="text-xs font-mono text-destructive">#{validator.bannedEpoch}</span>
                                    </Row>
                                )}
                                <Row label="EVM Address">
                                    <Link href={`/address/${validator.address}`} className="font-mono text-xs hover:text-primary transition-colors break-all">
                                        {validator.address}
                                    </Link>
                                </Row>
                                {validator.identity && (
                                    <Row label="Website">
                                        <a
                                            href={validator.identity.startsWith('http') ? validator.identity : `https://${validator.identity}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-primary hover:underline break-all link-underline"
                                        >
                                            {validator.identity}
                                        </a>
                                    </Row>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Validator tree position */}
            {validator && (validator.leftNode || validator.rightNode || validator.parentNode) && (
                <div className="space-y-3">
                    <SectionHeader accent="muted" title="Staking Tree Position" subtitle="Validators are stored in a sorted binary tree by stake — these are the neighbouring nodes." />
                    <Card className="glass border-white/5">
                        <CardContent className="p-5">
                            <div className="grid gap-3 sm:grid-cols-3">
                                <TreeNodeRef label="Parent" address={validator.parentNode} />
                                <TreeNodeRef label="Left" address={validator.leftNode} />
                                <TreeNodeRef label="Right" address={validator.rightNode} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Back link */}
            <div className="flex items-center gap-3 text-xs">
                <Link href="/validators" className="text-muted-foreground hover:text-primary link-underline">
                    ← All validators
                </Link>
                {validator && (
                    <>
                        <span className="text-muted-foreground/30">·</span>
                        <Link href={`/address/${validator.address}`} className="text-muted-foreground hover:text-primary link-underline">
                            View as address
                        </Link>
                    </>
                )}
            </div>
        </main>
    );
}

function SocialRow({ validator }: { validator: ValidatorInfo }) {
    const socials = [
        validator.identity && {
            href: validator.identity.startsWith('http') ? validator.identity : `https://${validator.identity}`,
            label: validator.identity.replace(/^https?:\/\//, ''),
            icon: Globe,
        },
        validator.twitter && {
            href: validator.twitter.startsWith('http') ? validator.twitter : `https://twitter.com/${validator.twitter.replace(/^@/, '')}`,
            label: validator.twitter.replace(/^@/, ''),
            icon: Twitter,
        },
        validator.github && {
            href: validator.github.startsWith('http') ? validator.github : `https://github.com/${validator.github}`,
            label: validator.github,
            icon: Github,
        },
        validator.telegram && {
            href: validator.telegram.startsWith('http') ? validator.telegram : `https://t.me/${validator.telegram.replace(/^@/, '')}`,
            label: validator.telegram.replace(/^@/, ''),
            icon: Send,
        },
        validator.email && {
            href: `mailto:${validator.email}`,
            label: validator.email,
            icon: Mail,
        },
    ].filter(Boolean) as Array<{ href: string; label: string; icon: React.ComponentType<{ className?: string }> }>;

    if (socials.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2 pt-2">
            {socials.map(s => (
                <a
                    key={s.href}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-[10px] font-bold hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all"
                >
                    <s.icon className="h-3 w-3" />
                    {s.label}
                    <ExternalLink className="h-2.5 w-2.5 opacity-50" />
                </a>
            ))}
        </div>
    );
}

function Stat({
    icon: Icon, label, value, accent = 'muted',
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string; value: string | null; accent?: 'primary' | 'accent' | 'muted';
}) {
    const iconColor =
        accent === 'primary' ? 'text-primary bg-primary/15 border-primary/20' :
        accent === 'accent' ? 'text-accent bg-accent/15 border-accent/20' :
        'text-muted-foreground bg-white/5 border-white/10';
    return (
        <Card className="glass card-lift border-white/5">
            <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">{label}</p>
                        {value === null ? (
                            <Skeleton className="h-7 w-24 mt-2 bg-white/5" />
                        ) : (
                            <p className="text-lg sm:text-xl font-black tracking-tighter mt-1 truncate font-mono">{value}</p>
                        )}
                    </div>
                    <div className={cn("p-2 rounded-lg border flex-shrink-0", iconColor)}>
                        <Icon className="h-4 w-4" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function RoleCard({
    icon: Icon, label, address, balance, txCount, primary, onCopy,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    address: string | null | undefined;
    balance: bigint | null;
    txCount: number | null;
    primary?: boolean;
    onCopy: (a: string) => void;
}) {
    return (
        <Card className={cn(
            "glass card-lift border-white/5",
            primary && "border-primary/20 bg-primary/[0.03]"
        )}>
            <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "p-1.5 rounded-lg border",
                        primary ? "bg-primary/15 border-primary/30 text-primary" : "bg-white/5 border-white/10 text-muted-foreground"
                    )}>
                        <Icon className="h-3.5 w-3.5" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        {label}
                    </p>
                </div>

                {!address ? (
                    <p className="text-xs text-muted-foreground/50 italic">not set</p>
                ) : (
                    <>
                        <div className="flex items-center gap-1.5">
                            <Link href={`/address/${address}`} className="font-mono text-[11px] font-bold hover:text-primary truncate flex-1">
                                {address}
                            </Link>
                            <button onClick={() => onCopy(address)} className="text-muted-foreground hover:text-primary flex-shrink-0">
                                <Copy className="h-3 w-3" />
                            </button>
                        </div>
                        <div className="text-[10px] text-muted-foreground/70 space-y-0.5 pt-1 border-t border-white/5">
                            {balance !== null && <p>Balance: <span className="font-mono text-foreground/80">{fmtEther(balance)} GEN</span></p>}
                            {txCount !== null && <p>Tx Count: <span className="font-mono text-foreground/80">{fmtNumber(txCount)}</span></p>}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

function TreeNodeRef({ label, address }: { label: string; address?: string }) {
    const isEmpty = !address || address === ZERO;
    return (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-2">
                <GitBranch className="h-3 w-3 text-muted-foreground" />
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">{label}</p>
            </div>
            {isEmpty ? (
                <p className="text-xs text-muted-foreground/40 italic">— none —</p>
            ) : (
                <Link href={`/validator/${address}`} className="font-mono text-[11px] text-foreground/80 hover:text-primary break-all">
                    {address}
                </Link>
            )}
        </div>
    );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex justify-between items-center gap-4 p-4 flex-wrap">
            <span className="text-[11px] uppercase font-black tracking-widest text-muted-foreground/60 flex-shrink-0">{label}</span>
            <div className="flex-1 min-w-0 sm:text-right">{children}</div>
        </div>
    );
}
