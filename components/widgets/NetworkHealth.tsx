"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import { getLatestBlockNumber } from '@/lib/explorer-rpc';
import { cn } from '@/lib/utils';

const POLL_MS = 10_000;

interface Probe {
    block: bigint | null;
    latencyMs: number;
    ok: boolean;
}

export function NetworkHealth() {
    const [probe, setProbe] = useState<Probe | null>(null);

    useEffect(() => {
        let cancelled = false;
        const tick = async () => {
            const start = performance.now();
            try {
                const block = await getLatestBlockNumber();
                if (!cancelled) setProbe({ block, latencyMs: performance.now() - start, ok: true });
            } catch {
                if (!cancelled) setProbe({ block: null, latencyMs: performance.now() - start, ok: false });
            }
        };
        tick();
        const id = setInterval(tick, POLL_MS);
        return () => { cancelled = true; clearInterval(id); };
    }, []);

    const status = !probe ? 'measuring' :
        !probe.ok ? 'down' :
        probe.latencyMs > 1200 ? 'degraded' :
        'healthy';

    const styles = {
        measuring: { color: 'text-muted-foreground', dot: 'bg-muted-foreground/40', label: 'Measuring' },
        healthy: { color: 'text-primary', dot: 'bg-primary shadow-[0_0_8px_rgba(165,90,45,0.6)]', label: 'Healthy' },
        degraded: { color: 'text-yellow-500', dot: 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]', label: 'Degraded' },
        down: { color: 'text-destructive', dot: 'bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.6)]', label: 'Down' },
    }[status];

    return (
        <Card className="glass glass-hover card-lift border-white/5">
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-accent/15 border border-accent/20">
                                <Activity className="h-3.5 w-3.5 text-accent" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                RPC Health
                            </p>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <span className={cn("h-2 w-2 rounded-full animate-pulse", styles.dot)} />
                            <p className={cn("text-lg font-black tracking-tight", styles.color)}>
                                {styles.label}
                            </p>
                        </div>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                            {probe ? `${probe.latencyMs.toFixed(0)}ms · block ${probe.block?.toString() ?? 'n/a'}` : '…'}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
