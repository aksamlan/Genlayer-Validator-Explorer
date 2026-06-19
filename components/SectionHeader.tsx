"use client";

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
    accent?: 'primary' | 'accent' | 'muted';
    title: string;
    subtitle?: string;
    viewAllHref?: string;
    viewAllLabel?: string;
    className?: string;
}

export function SectionHeader({
    accent = 'primary',
    title,
    subtitle,
    viewAllHref,
    viewAllLabel = 'View all',
    className,
}: SectionHeaderProps) {
    const barClass =
        accent === 'primary' ? 'bg-primary' :
        accent === 'accent' ? 'bg-accent' :
        'bg-white/20';

    return (
        <div className={cn("flex items-end justify-between gap-3 flex-wrap", className)}>
            <div className="flex items-center gap-3">
                <div className={cn("h-6 w-1 rounded-full", barClass)} />
                <div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-foreground/80">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="text-[11px] text-muted-foreground/60 mt-0.5">{subtitle}</p>
                    )}
                </div>
            </div>
            {viewAllHref && (
                <Link
                    href={viewAllHref}
                    className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary hover:gap-2 transition-all"
                >
                    {viewAllLabel}
                    <ArrowRight className="h-3 w-3" />
                </Link>
            )}
        </div>
    );
}
