"use client";

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { useNetwork } from '@/lib/network-context';
import { cn } from '@/lib/utils';

export function NetworkSwitcher() {
    const { network, networks, setNetwork } = useNetwork();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const onClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('mousedown', onClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onClick);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    return (
        <div ref={ref} className="relative flex-shrink-0">
            <button
                onClick={() => setOpen(v => !v)}
                aria-haspopup="listbox"
                aria-expanded={open}
                className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                    "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/30",
                    open && "bg-primary/15 border-primary/30 text-primary"
                )}
            >
                <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                </span>
                <Globe className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{network.name}</span>
                <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
            </button>

            {open && (
                <div
                    role="listbox"
                    className="absolute right-0 mt-2 w-64 rounded-xl border border-white/10 bg-background/95 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.5)] overflow-hidden z-50 p-1.5"
                >
                    <p className="px-3 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                        Select Network
                    </p>
                    {networks.map((n) => {
                        const active = n.id === network.id;
                        return (
                            <button
                                key={n.id}
                                role="option"
                                aria-selected={active}
                                onClick={() => { setNetwork(n.id); setOpen(false); }}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all",
                                    active
                                        ? "bg-primary/15 text-primary"
                                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                )}
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                                        {n.name}
                                        {n.phase && (
                                            <span className="text-[8px] px-1 py-px rounded bg-primary/15 text-primary normal-case tracking-normal">{n.phase}</span>
                                        )}
                                        {n.status === 'sunset' && (
                                            <span className="text-[8px] px-1 py-px rounded bg-white/10 text-muted-foreground normal-case tracking-normal">Sunset</span>
                                        )}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground/70 font-medium normal-case tracking-normal truncate">
                                        {n.fullName} · Chain {n.displayChainId}
                                    </p>
                                </div>
                                {active && <Check className="h-4 w-4 flex-shrink-0" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
