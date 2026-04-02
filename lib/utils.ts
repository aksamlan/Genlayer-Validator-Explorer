import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function truncateAddress(address: string, startChars = 6, endChars = 4): string {
    if (address.length <= startChars + endChars) return address;
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

export function formatNumber(value: string | number): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '0';

    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;

    // For smaller numbers, show no decimals if it's an integer
    if (Number.isInteger(num)) {
        return num.toLocaleString();
    }

    return num.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 });
}

export function formatCurrency(value: string | number, symbol: string = 'GEN'): string {
    return `${formatNumber(value)} ${symbol}`;
}

// Format number without abbreviation (for block numbers, etc.)
export function formatFullNumber(value: string | number | bigint): string {
    const num = typeof value === 'bigint' ? Number(value) :
        typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num)) return '0';

    // Always show full number with thousand separators
    return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
}
