"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, BookOpen, Globe, Coins, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function LinksSection() {
    const links = [
        {
            title: "Official Website",
            url: "https://www.genlayer.com/",
            icon: Globe,
            description: "Learn about GenLayer",
            color: "text-blue-400",
            bg: "bg-blue-400/10",
            border: "border-blue-400/20"
        },
        {
            title: "Documentation",
            url: "https://docs.genlayer.com/",
            icon: BookOpen,
            description: "Read the Docs",
            color: "text-purple-400",
            bg: "bg-purple-400/10",
            border: "border-purple-400/20"
        },
        {
            title: "Official Explorer",
            url: "https://explorer-asimov.genlayer.com/",
            icon: Zap,
            description: "View Asimov Explorer",
            color: "text-amber-400",
            bg: "bg-amber-400/10",
            border: "border-amber-400/20"
        }
    ];

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Main Referral Card - Takes up more attention */}
            <a
                href="https://points.genlayer.foundation?ref=ZERY8UJN"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-xl glass border-primary/30 p-1 transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(165,90,45,0.3)]"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 opacity-50 group-hover:opacity-100 transition-opacity" />
                <Card className="h-full bg-black/40 border-0 flex flex-col justify-between relative z-10">
                    <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                        <div className="p-3 rounded-full bg-primary/20 text-primary mb-2 group-hover:scale-110 transition-transform duration-500">
                            <Coins className="h-8 w-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-wider text-white">Join Points Program</h3>
                            <p className="text-xs text-muted-foreground font-medium mt-1">Start earning rewards today</p>
                        </div>
                        <div className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm uppercase tracking-widest w-full group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                            Join Now
                        </div>
                    </CardContent>
                </Card>
            </a>

            {/* Other Links */}
            {links.map((link) => {
                const Icon = link.icon;
                return (
                    <a
                        key={link.title}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group"
                    >
                        <Card className={cn(
                            "h-full glass transition-all hover:-translate-y-1 hover:shadow-lg border-white/5",
                            "hover:border-white/10"
                        )}>
                            <CardContent className="h-full p-6 flex flex-col items-center justify-center text-center gap-4">
                                <div className={cn("p-3 rounded-xl transition-colors", link.bg, link.color)}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <div className="w-full">
                                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors flex items-center justify-center gap-2">
                                        {link.title}
                                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-1 font-medium">
                                        {link.description}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </a>
                );
            })}
        </div>
    );
}
