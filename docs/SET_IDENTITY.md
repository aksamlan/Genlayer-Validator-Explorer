# Setting Your On-Chain Validator Identity

This explorer reads validator identity (moniker, website, socials, logo, description) directly from each validator's wallet contract on the GenLayer Rally testnet. If your fields are empty in the explorer, it's because they aren't set on-chain yet.

This guide shows three ways to write them.

## What you can set

| Field | What it is | Where it shows in the explorer |
| --- | --- | --- |
| `moniker` | Display name (e.g. `HusoNode`) | Validator card title, table moniker, hero |
| `logoUri` | URL to your logo (e.g. `https://husonode.xyz/logo.png`) | Avatar in table + detail page |
| `website` | Your validator website | Identity card, link chip |
| `description` | One-paragraph bio | Validator hero, detail page |
| `twitter` | Handle or full URL | Social chip in table & detail |
| `github` | Username or full URL | Social chip |
| `telegram` | Handle or full URL | Social chip |
| `email` | Contact email | Social chip (mailto:) |

All of these are stored in the `Identity` struct returned by `getIdentity()` on the validator wallet contract.

---

## Option 1 — GenLayer CLI (recommended)

The official `genlayer` CLI is the simplest path. Identity calls are signed by the validator's **owner** key.

### Install

```bash
npm install -g genlayer-cli
genlayer --version
```

### Configure for Rally testnet

```bash
genlayer init
# follow the prompts; pick the Rally testnet network preset
```

You'll need the **owner private key** for your validator available to the CLI (the CLI will prompt you the first time, or you can configure it via the standard CLI keystore).

### Set identity

Single-call form (preferred):

```bash
genlayer staking set-identity \
  --validator   0x14369952c233f959FA6f7D7F9534B246040CA992 \
  --moniker     "HusoNode" \
  --logo        "https://husonode.xyz/logo.png" \
  --website     "https://husonode.xyz" \
  --description "Reliable validator infrastructure for GenLayer testnet." \
  --twitter     "husonode" \
  --github      "husonode" \
  --telegram    "husonode" \
  --email       "contact@husonode.xyz"
```

Useful checks:

```bash
genlayer staking active-validators        # confirm you're in the active set
genlayer staking epoch-info               # current epoch & min stake
```

After the tx confirms, refresh the explorer — moniker, logo, and socials should appear within the next 30-second poll.

---

## Option 2 — Foundry `cast` one-liner

If you don't want the CLI, you can call the wallet contract directly with [Foundry](https://book.getfoundry.sh/getting-started/installation).

The identity struct in solidity:

```solidity
struct Identity {
    string moniker;
    string logoUri;
    string website;
    string description;
    string email;
    string twitter;
    string telegram;
    string github;
    bytes  extraCid;
}
```

So the function signature is:

```
setIdentity((string,string,string,string,string,string,string,string,bytes))
```

Example call (replace the validator wallet address with **your validator** address, and the keystore path with yours):

```bash
cast send \
  0x14369952c233f959FA6f7D7F9534B246040CA992 \
  "setIdentity((string,string,string,string,string,string,string,string,bytes))" \
  '("HusoNode","https://husonode.xyz/logo.png","https://husonode.xyz","Reliable validator infrastructure.","contact@husonode.xyz","husonode","husonode","husonode","0x")' \
  --rpc-url https://zksync-os-testnet-genlayer.zksync.dev \
  --keystore ~/.foundry/keystores/owner-key \
  --chain 4221
```

Notes:
- The `extraCid` field is `bytes` — pass `0x` if unused.
- This must be sent from the **owner** address registered on the wallet contract.
- The staking contract lives on ZKSync OS Testnet (chain 4221). The RPC above is correct.

---

## Option 3 — viem script (TypeScript)

If you already have viem in a project, drop this script in (e.g. `scripts/set-identity.ts`):

```ts
import { createWalletClient, http, parseAbi } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

const VALIDATOR = '0x14369952c233f959FA6f7D7F9534B246040CA992' as const;
const RPC = 'https://zksync-os-testnet-genlayer.zksync.dev';

const ABI = parseAbi([
  'function setIdentity((string moniker,string logoUri,string website,string description,string email,string twitter,string telegram,string github,bytes extraCid))',
]);

async function main() {
  const account = privateKeyToAccount(process.env.OWNER_PRIVATE_KEY as `0x${string}`);
  const client = createWalletClient({ account, transport: http(RPC) });

  const hash = await client.writeContract({
    address: VALIDATOR,
    abi: ABI,
    functionName: 'setIdentity',
    args: [{
      moniker:     'HusoNode',
      logoUri:     'https://husonode.xyz/logo.png',
      website:     'https://husonode.xyz',
      description: 'Reliable validator infrastructure for GenLayer testnet.',
      email:       'contact@husonode.xyz',
      twitter:     'husonode',
      telegram:    'husonode',
      github:      'husonode',
      extraCid:    '0x',
    }],
    chain: undefined,
  });
  console.log('Tx sent:', hash);
}

main().catch(e => { console.error(e); process.exit(1); });
```

Run with:

```bash
OWNER_PRIVATE_KEY=0x... npx tsx scripts/set-identity.ts
```

⚠️ Never commit private keys. Use a keystore or environment variable.

---

## Verifying

After the tx confirms, fetch your validator's identity from the staking RPC:

```bash
curl -X POST https://zksync-os-testnet-genlayer.zksync.dev \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","method":"eth_call","id":1,"params":[
    {"to":"0x14369952c233f959FA6f7D7F9534B246040CA992","data":"0xac8a584a"},
    "latest"
  ]}'
```

(`0xac8a584a` is the selector for `getIdentity()`. The hex blob in `result` decodes to the tuple above.)

Or just refresh the explorer — within ~30s your validator card will populate with the new identity.
