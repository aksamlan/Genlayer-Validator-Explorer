"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { ValidatorInfo } from "@/types/validator";
import { AlertTriangle, ShieldOff, WifiOff, Copy } from "lucide-react";
import { truncateAddress, cn } from "@/lib/utils";
import { useState } from "react";

interface AlertSectionProps {
    validators: ValidatorInfo[];
}

function CopyableAddress({ address }: { address: string }) {
    const [copied, setCopied] = useState(false);
    const copy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(address).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    };
    return (
        <button
            onClick={copy}
            className="flex items-center gap-1.5 group/addr text-left"
            title={address}
        >
            <code className="text-[10px] text-muted-foreground/70 font-mono group-hover/addr:text-muted-foreground transition-colors">
                {truncateAddress(address)}
            </code>
            <Copy className="h-2.5 w-2.5 text-muted-foreground/40 group-hover/addr:text-primary transition-colors flex-shrink-0" />
            {copied && <span className="text-[9px] text-primary font-bold">COPIED</span>}
        </button>
    );
}

export function AlertSection({ validators }: AlertSectionProps) {
    const bannedValidators = validators.filter(v => v.isBanned);
    const inactiveValidators = validators.filter(v => !v.isActive && !v.isBanned);

    if (bannedValidators.length === 0 && inactiveValidators.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-yellow-500/60 rounded-full" />
                <h2 className="text-xl font-black uppercase tracking-widest text-foreground/90">
                    Validator Alerts
                </h2>
                <div className="flex items-center gap-2 ml-2">
                    {bannedValidators.length > 0 && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-destructive/15 text-destructive border border-destructive/20 uppercase tracking-widest">
                            {bannedValidators.length} Banned
                        </span>
                    )}
                    {inactiveValidators.length > 0 && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 uppercase tracking-widest">
                            {inactiveValidators.length} Inactive
                        </span>
                    )}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Banned */}
                {bannedValidators.length > 0 && (
                    <Card className="glass border-destructive/20 bg-destructive/5 overflow-hidden">
                        <CardContent className="p-0">
                            <div className="flex items-center gap-3 px-5 py-3 border-b border-destructive/15 bg-destructive/10">
                                <ShieldOff className="h-4 w-4 text-destructive flex-shrink-0" />
                                <span className="text-xs font-black uppercase tracking-widest text-destructive">
                                    Banned Validators
                                </span>
                                <span className="ml-auto text-[10px] font-bold text-destructive/70">{bannedValidators.length}</span>
                            </div>
                            <div className="divide-y divide-white/5 max-h-52 overflow-y-auto">
                                {bannedValidators.map((v) => (
                                    <div key={v.address} className="flex items-center justify-between px-5 py-2.5 hover:bg-white/[0.03] transition-colors">
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-foreground/80 truncate">
                                                {v.moniker || truncateAddress(v.address)}
                                            </p>
                                            <CopyableAddress address={v.address} />
                                        </div>
                                        <div className="h-1.5 w-1.5 rounded-full bg-destructive ml-3 flex-shrink-0 shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Inactive */}
                {inactiveValidators.length > 0 && (
                    <Card className="glass border-yellow-500/20 bg-yellow-500/5 overflow-hidden">
                        <CardContent className="p-0">
                            <div className="flex items-center gap-3 px-5 py-3 border-b border-yellow-500/15 bg-yellow-500/10">
                                <WifiOff className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                                <span className="text-xs font-black uppercase tracking-widest text-yellow-500">
                                    Inactive Validators
                                </span>
                                <span className="ml-auto text-[10px] font-bold text-yellow-500/70">{inactiveValidators.length}</span>
                            </div>
                            <div className="divide-y divide-white/5 max-h-52 overflow-y-auto">
                                {inactiveValidators.map((v) => (
                                    <div key={v.address} className="flex items-center justify-between px-5 py-2.5 hover:bg-white/[0.03] transition-colors">
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-foreground/80 truncate">
                                                {v.moniker || truncateAddress(v.address)}
                                            </p>
                                            <CopyableAddress address={v.address} />
                                        </div>
                                        <div className="h-1.5 w-1.5 rounded-full bg-yellow-500 ml-3 flex-shrink-0 shadow-[0_0_6px_rgba(234,179,8,0.5)]" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
