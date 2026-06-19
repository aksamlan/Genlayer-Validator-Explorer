"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Activity, Box, Layers, Shield, Menu, X } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { cn } from '@/lib/utils';

const NAV = [
    { href: '/', label: 'Dashboard', icon: Activity },
    { href: '/blocks', label: 'Blocks', icon: Box },
    { href: '/txs', label: 'Transactions', icon: Layers },
    { href: '/validators', label: 'Validators', icon: Shield },
];

export function Header() {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => { setOpen(false); }, [pathname]);

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname?.startsWith(href);
    };

    return (
        <header
            className={cn(
                "sticky top-0 z-40 w-full transition-all duration-300",
                scrolled
                    ? "bg-background/85 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
                    : "bg-background/60 backdrop-blur-md border-b border-white/5"
            )}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-6 h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
                        <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-white/10 shadow-lg group-hover:scale-105 transition-transform flex-shrink-0">
                            <Image src="/logo.jpg" alt="GenLayer" fill className="object-cover" />
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-sm font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
                                GENLAYER
                            </p>
                            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 leading-tight mt-0.5">
                                Explorer
                            </p>
                        </div>
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden lg:flex items-center gap-1 ml-2">
                        {NAV.map(({ href, label, icon: Icon }) => {
                            const active = isActive(href);
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                                        active
                                            ? "bg-primary/15 text-primary"
                                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                    )}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    {label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="flex-1" />

                    {/* Search — desktop */}
                    <div className="hidden md:block w-[340px] xl:w-[420px]">
                        <SearchBar size="sm" />
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setOpen(v => !v)}
                        className="lg:hidden p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                        aria-label="Toggle navigation"
                    >
                        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                    </button>
                </div>

                {/* Search — mobile (always visible under header on small screens) */}
                <div className="md:hidden pb-3">
                    <SearchBar size="sm" />
                </div>
            </div>

            {/* Mobile nav drawer */}
            {open && (
                <div className="lg:hidden border-t border-white/5 bg-background/95 backdrop-blur-xl">
                    <nav className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-2 gap-2">
                        {NAV.map(({ href, label, icon: Icon }) => {
                            const active = isActive(href);
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                                        active
                                            ? "bg-primary/15 text-primary border border-primary/20"
                                            : "text-muted-foreground hover:text-foreground bg-white/[0.02] border border-white/5"
                                    )}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    {label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            )}
        </header>
    );
}
