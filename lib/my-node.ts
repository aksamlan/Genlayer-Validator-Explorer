/**
 * Resolves the operator's own validator address from env so the UI can highlight
 * it ("My Node").
 *
 *   - NEXT_PUBLIC_OWNER_VALIDATOR           → default / Asimov validator
 *   - NEXT_PUBLIC_BRADBURY_OWNER_VALIDATOR  → Bradbury validator (optional)
 *
 * Pass a network id ('bradbury-testnet' | 'asimov-testnet') to pick the right
 * one for the active network; it falls back to the default when unset.
 */

function normalizeAddress(raw: string | undefined | null): string | null {
    if (!raw) return null;
    const v = raw.trim().toLowerCase();
    return /^0x[0-9a-f]{40}$/.test(v) ? v : null;
}

const DEFAULT_OWNER = normalizeAddress(process.env.NEXT_PUBLIC_OWNER_VALIDATOR);
const BRADBURY_OWNER = normalizeAddress(process.env.NEXT_PUBLIC_BRADBURY_OWNER_VALIDATOR);

export function getOwnerValidatorAddress(networkId?: string | null): string | null {
    if (networkId === 'bradbury-testnet' && BRADBURY_OWNER) return BRADBURY_OWNER;
    return DEFAULT_OWNER;
}

/** All configured owner addresses across every network (deduped). */
export function getAllOwnerValidatorAddresses(): string[] {
    return Array.from(new Set([DEFAULT_OWNER, BRADBURY_OWNER].filter(Boolean) as string[]));
}

/**
 * True if the address is one of the operator's own validators on ANY network.
 * Kept network-agnostic so profile/address pages highlight it regardless of the
 * currently-selected network.
 */
export function isOwnerValidator(addr: string | null | undefined): boolean {
    if (!addr) return false;
    return getAllOwnerValidatorAddresses().includes(addr.toLowerCase());
}
