/**
 * Resolves the operator's own validator address from env so the UI can highlight
 * it ("My Node"). Set NEXT_PUBLIC_OWNER_VALIDATOR in .env.local.
 */

export function getOwnerValidatorAddress(): string | null {
    const raw = process.env.NEXT_PUBLIC_OWNER_VALIDATOR;
    if (!raw) return null;
    const v = raw.trim().toLowerCase();
    if (!/^0x[0-9a-f]{40}$/.test(v)) return null;
    return v;
}

export function isOwnerValidator(addr: string | null | undefined): boolean {
    if (!addr) return false;
    const owner = getOwnerValidatorAddress();
    if (!owner) return false;
    return addr.toLowerCase() === owner;
}
