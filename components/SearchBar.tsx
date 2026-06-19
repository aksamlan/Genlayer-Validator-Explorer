"use client";

import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';
import { Search } from 'lucide-react';
import { classifySearch } from '@/lib/explorer-rpc';
import { cn } from '@/lib/utils';

export function SearchBar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const router = useRouter();
    const [q, setQ] = useState('');
    const [err, setErr] = useState<string | null>(null);

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        const target = classifySearch(q);
        if (target.kind === 'block') {
            router.push(`/block/${target.number.toString()}`);
        } else if (target.kind === 'tx') {
            router.push(`/tx/${target.hash}`);
        } else if (target.kind === 'address') {
            router.push(`/address/${target.address}`);
        } else {
            setErr('Enter a block number, transaction hash (0x… 66 chars), or address (0x… 42 chars)');
            setTimeout(() => setErr(null), 4000);
            return;
        }
        setQ('');
        setErr(null);
    };

    const sizing =
        size === 'lg' ? 'h-12 text-base' :
        size === 'sm' ? 'h-9 text-xs' :
        'h-10 text-sm';

    return (
        <form onSubmit={onSubmit} className="relative w-full">
            <div className="relative">
                <Search className={cn(
                    "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none",
                    size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5'
                )} />
                <input
                    type="text"
                    value={q}
                    onChange={e => setQ(e.target.value)}
                    placeholder="Search by block / tx hash / address"
                    className={cn(
                        "w-full pl-9 pr-20 rounded-xl bg-white/[0.03] border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 placeholder:text-muted-foreground/40 font-mono transition-all",
                        sizing
                    )}
                />
                <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 h-7 rounded-lg bg-primary/15 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/25 transition-colors"
                >
                    Go
                </button>
            </div>
            {err && (
                <div className="absolute top-full mt-1 left-0 right-0 z-50 text-[10px] text-destructive bg-destructive/10 border border-destructive/30 px-3 py-1.5 rounded-lg">
                    {err}
                </div>
            )}
        </form>
    );
}
