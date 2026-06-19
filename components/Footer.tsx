"use client";

import Link from 'next/link';

export function Footer() {
    return (
        <footer className="mt-16 border-t border-white/5 bg-background/40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50">
                    <div className="flex flex-col items-center sm:items-start gap-1.5">
                        <p>© 2026 GenLayer Explorer · Community Project</p>
                        <p className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                            Built by{" "}
                            <a
                                href="https://husonode.xyz"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                            >
                                HusoNode
                            </a>
                            <span className="text-white/10">•</span>
                            <a
                                href="mailto:contact@husonode.xyz"
                                className="hover:text-foreground transition-colors"
                            >
                                contact@husonode.xyz
                            </a>
                        </p>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center">
                        <Link href="/blocks" className="hover:text-foreground transition-colors">Blocks</Link>
                        <Link href="/txs" className="hover:text-foreground transition-colors">Txs</Link>
                        <Link href="/validators" className="hover:text-foreground transition-colors">Validators</Link>
                        <a
                            href="https://docs.genlayer.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-foreground transition-colors"
                        >
                            Docs
                        </a>
                    </div>
                </div>
                <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center text-[10px] text-muted-foreground/40">
                    <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(165,90,45,0.6)] animate-pulse" />
                        Network Operational
                    </span>
                    <span className="text-primary/60">Powered by HusoNode</span>
                </div>
            </div>
        </footer>
    );
}
