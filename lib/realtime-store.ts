/**
 * Lightweight client-side rolling buffer for live metrics
 * (gas price history, block-time history). Drives sparklines & charts.
 *
 * Keeps state in a singleton because multiple components want to subscribe
 * to the same samples without re-hitting the RPC.
 */

import { getGasPrice, getRecentBlocks } from './explorer-rpc';

interface Sample<T> {
    t: number; // unix ms
    v: T;
}

const MAX_SAMPLES = 60;

class RealtimeStore {
    private gasHistory: Sample<bigint>[] = [];
    private blockTimes: Sample<number>[] = [];
    private listeners = new Set<() => void>();
    private pollTimer: ReturnType<typeof setInterval> | null = null;

    subscribe(fn: () => void) {
        this.listeners.add(fn);
        return () => {
            this.listeners.delete(fn);
            if (this.listeners.size === 0) this.stop();
        };
    }

    getGasHistory() {
        return this.gasHistory;
    }

    getBlockTimes() {
        return this.blockTimes;
    }

    start(intervalMs = 12_000) {
        if (this.pollTimer) return;
        this.tick();
        this.pollTimer = setInterval(() => this.tick(), intervalMs);
    }

    private stop() {
        if (this.pollTimer) {
            clearInterval(this.pollTimer);
            this.pollTimer = null;
        }
    }

    private async tick() {
        try {
            const [gas, blocks] = await Promise.all([
                getGasPrice().catch(() => null),
                getRecentBlocks(20).catch(() => [] as Awaited<ReturnType<typeof getRecentBlocks>>),
            ]);

            const now = Date.now();
            if (gas !== null) {
                this.gasHistory = [...this.gasHistory, { t: now, v: gas }].slice(-MAX_SAMPLES);
            }

            if (blocks.length > 1) {
                const intervals: Sample<number>[] = [];
                for (let i = 0; i < blocks.length - 1; i++) {
                    const a = blocks[i];
                    const b = blocks[i + 1];
                    if (a.timestamp && b.timestamp) {
                        intervals.push({
                            t: Number(a.timestamp) * 1000,
                            v: Number(a.timestamp - b.timestamp),
                        });
                    }
                }
                this.blockTimes = intervals.slice().reverse();
            }

            this.notify();
        } catch (e) {
            // Silent — UI still has prior samples
            console.warn('[realtime] tick failed', e);
        }
    }

    private notify() {
        for (const fn of this.listeners) fn();
    }
}

export const realtimeStore = new RealtimeStore();
