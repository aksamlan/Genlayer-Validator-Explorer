/**
 * Display formatters shared across the explorer.
 * Pure functions, no React.
 */

export function fmtTimeAgo(unixSeconds: number | bigint): string {
    const ts = typeof unixSeconds === 'bigint' ? Number(unixSeconds) : unixSeconds;
    if (!ts) return '—';
    const diff = Math.max(0, Math.floor(Date.now() / 1000 - ts));
    if (diff < 5) return 'just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export function fmtGwei(weiBig: bigint, decimals = 2): string {
    if (weiBig === 0n) return '0';
    const gwei = Number(weiBig) / 1e9;
    if (gwei >= 1000) return `${(gwei / 1000).toFixed(decimals)}K`;
    return gwei.toFixed(decimals);
}

export function fmtEther(weiBig: bigint, decimals = 4): string {
    if (weiBig === 0n) return '0';
    const ether = Number(weiBig) / 1e18;
    if (ether < 0.0001) return '< 0.0001';
    if (ether >= 1e6) return `${(ether / 1e6).toFixed(2)}M`;
    if (ether >= 1e3) return `${(ether / 1e3).toFixed(2)}K`;
    return ether.toFixed(decimals);
}

export function fmtHexShort(hex: string, head = 8, tail = 6): string {
    if (!hex) return '—';
    if (hex.length <= head + tail) return hex;
    return `${hex.slice(0, head)}…${hex.slice(-tail)}`;
}

export function fmtNumber(n: number | bigint): string {
    const num = typeof n === 'bigint' ? Number(n) : n;
    return num.toLocaleString('en-US');
}

export function fmtBigNumber(n: number | bigint): string {
    const num = typeof n === 'bigint' ? Number(n) : n;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toString();
}

export function gasUsedPct(used: bigint, limit: bigint): number {
    if (limit === 0n) return 0;
    return Number((used * 10000n) / limit) / 100;
}
