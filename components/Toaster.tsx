"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Check, X, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastKind = 'success' | 'error' | 'info' | 'warn';
interface Toast {
    id: number;
    kind: ToastKind;
    title: string;
    description?: string;
}

interface ToastCtx {
    push: (t: Omit<Toast, 'id'>) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

export function useToast() {
    const ctx = useContext(Ctx);
    if (!ctx) {
        // Graceful fallback so components don't crash before provider mounts.
        return { push: () => {} };
    }
    return ctx;
}

export function ToasterProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const idRef = useRef(0);

    const push = useCallback<ToastCtx['push']>(t => {
        const id = ++idRef.current;
        setToasts(curr => [...curr, { id, ...t }]);
        window.setTimeout(() => {
            setToasts(curr => curr.filter(x => x.id !== id));
        }, 3200);
    }, []);

    return (
        <Ctx.Provider value={{ push }}>
            {children}
            <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
                {toasts.map(t => <ToastItem key={t.id} toast={t} />)}
            </div>
        </Ctx.Provider>
    );
}

function ToastItem({ toast }: { toast: Toast }) {
    const styles = {
        success: { Icon: Check, color: 'text-primary', bg: 'bg-primary/15 border-primary/30' },
        error:   { Icon: X, color: 'text-destructive', bg: 'bg-destructive/15 border-destructive/30' },
        info:    { Icon: Info, color: 'text-accent', bg: 'bg-accent/15 border-accent/30' },
        warn:    { Icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/15 border-yellow-500/30' },
    }[toast.kind];

    const Icon = styles.Icon;

    return (
        <div
            className={cn(
                "pointer-events-auto glass rounded-xl px-4 py-3 min-w-[260px] max-w-sm flex items-start gap-3 border shadow-2xl",
                styles.bg,
                "animate-in slide-in-from-right-3 fade-in duration-300"
            )}
        >
            <div className={cn("p-1 rounded-md flex-shrink-0 mt-0.5", styles.color, "bg-white/5")}>
                <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs font-black tracking-tight">{toast.title}</p>
                {toast.description && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">{toast.description}</p>
                )}
            </div>
        </div>
    );
}
