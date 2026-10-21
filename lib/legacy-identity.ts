import legacy from './legacy-identities.json';

/**
 * Identities from earlier testnets, for validators that haven't set one on the
 * current network yet. Matched by operator wallet first (the node key is
 * usually reused), then owner. Regenerate with
 * scripts/snapshot-legacy-identities.ts.
 */

export interface LegacyIdentity {
    network: string;
    wallet: string;
    owner: string;
    operator: string;
    moniker: string;
    logoUri: string;
    website: string;
    description: string;
    email: string;
    twitter: string;
    telegram: string;
    github: string;
}

const byOperator = new Map<string, LegacyIdentity>();
const byOwner = new Map<string, LegacyIdentity>();
for (const id of legacy as LegacyIdentity[]) {
    if (id.operator && !byOperator.has(id.operator)) byOperator.set(id.operator, id);
    if (id.owner && !byOwner.has(id.owner)) byOwner.set(id.owner, id);
}

export function findLegacyIdentity(operator?: string, owner?: string): LegacyIdentity | null {
    const op = operator?.toLowerCase();
    const ow = owner?.toLowerCase();
    return (op && byOperator.get(op)) || (ow && byOwner.get(ow)) || null;
}
