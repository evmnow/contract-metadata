# Contract Metadata vs EIP-7730: Comparison Analysis

## Overview

EIP-7730 ("Structured Data Clear Signing") and Contract Metadata solve different problems:

- **EIP-7730**: "What am I about to sign?" — Display formatting for transaction signing prompts in wallets
- **Contract Metadata**: "What is this contract and what do its functions do?" — Human-readable context for contract exploration, understanding, and interaction

There is surprisingly little functional overlap despite both being "metadata for smart contracts."

## Where We Align

- Both use `chainId + address` for contract identity
- Both have parameter formatting (their `format` = our `displayHint`)
- Both have enum/constant mapping
- Both have timestamp, duration, token amount, address, and NFT formatting

## Where We're Stronger (Unique Value)

### Contract-Level Context
EIP-7730 has almost no contract-level documentation. Their `metadata` object only holds `owner`, `contractName`, `info: {url, deploymentDate}`, and `token: {name, ticker, decimals}`.

We provide:
- `contract.description` / `shortDescription` — prose explanation
- `contract.origin` — provenance and history
- `contract.about[]` — rich content sections with headings and bodies
- `contract.risks[]` — known risks and caveats
- `contract.audits[]` — security audit references (auditor, URL, date, scope)
- `contract.links[]` — labeled external links
- `contract.tags[]` — searchable categorization
- `contract.category` — primary category (nft, token, defi, identity, etc.)
- `contract.presentation` — visual hints (primaryColor, icon)

### Function Documentation
EIP-7730 has `intent` (a one-line summary) and `interpolatedIntent` (a template string). No prose descriptions, no warnings, no examples, no cross-references.

We provide:
- `function.title` — human-readable name
- `function.description` — what the function does, explained for end users
- `function.warning` — risk warnings displayed before interaction
- `function.examples[]` — preset parameter examples for quick interaction
- `function.related[]` — cross-references between functions for navigation
- `function.deprecated` — deprecation notices
- `function.returns` — return value metadata with labels and display hints

### Input Guidance
EIP-7730 only covers **output display** (formatting data that's already been constructed for signing). It has zero concept of **input collection**.

We provide:
- `inputHint` — how to collect parameter input (`ens-resolve`, `address-book`, `slider`, `dropdown`, `hidden`, `connected-address`, `token-amount`)
- `validation` — min/max/pattern/enum validation rules

### Events and Errors
EIP-7730 does not cover events or custom errors at all.

We provide full metadata for both, with the same parameter enrichment (labels, descriptions, display hints).

## Where EIP-7730 Is Stronger

### EIP-712 Typed Data Support
Many high-risk user interactions happen via off-chain typed message signing (Permit, Permit2, Uniswap orders, OpenSea listings, etc.). EIP-7730 has an entire parallel `context.eip712` binding mechanism for these. Contract Metadata now supports EIP-712 via the `messages` top-level object, but EIP-7730's approach is more mature with domain binding and type hash matching.

### Dynamic Cross-Field References
EIP-7730 can express relationships between parameters within a single transaction:
```json
{
  "format": "tokenAmount",
  "params": {
    "tokenPath": "asset"
  }
}
```
This says "format this uint256 as a token amount, looking up the token address from the `asset` parameter in the same call." Our `displayHint.tokenAddress` only supports static addresses.

### Composability / Includes
EIP-7730 supports file inheritance via `includes`:
```json
{
  "includes": "https://registry.example/erc20.json",
  "context": { "contract": { "deployments": [...] } }
}
```
A generic ERC-20 description can be written once and included by hundreds of token files. Contract Metadata now supports this via the `includes` field and interface files (`interfaces/erc20.json`, `interfaces/erc721.json`), though our approach uses named identifiers rather than URLs.

### Reusable Definitions
```json
{
  "display": {
    "definitions": {
      "tokenAmount": { "label": "Amount", "format": "tokenAmount", "params": { ... } }
    },
    "formats": {
      "transfer(address,uint256)": {
        "fields": [{ "$ref": "$.display.definitions.tokenAmount", "path": "value" }]
      }
    }
  }
}
```
Shared field format specs referenced by `$ref`. We have no equivalent.

### Multi-Chain Deployments
One EIP-7730 file can cover the same contract across multiple chains:
```json
{
  "context": {
    "contract": {
      "deployments": [
        { "chainId": 1, "address": "0x..." },
        { "chainId": 137, "address": "0x..." },
        { "chainId": 42161, "address": "0x..." }
      ]
    }
  }
}
```
We use one file per chainId + address.

### Factory Contract Support
Both standards support factory-deployed contracts. EIP-7730 binds via deploy event + factory deployments array. Contract Metadata uses a similar `factory` field with `address` and `deployEvent`. EIP-7730's approach is slightly more flexible with its `deployments` array supporting multiple chains.

### Conditional Field Visibility
```json
{
  "visible": { "ifNotIn": ["0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"] }
}
```
Fields can be shown/hidden based on runtime values. We have no equivalent.

### Interpolated Intent
Template strings with embedded formatted values:
```
"Swap {path.amountIn} for at least {path.amountOutMinimum}"
→ "Swap 1,000 USDC for at least 0.25 WETH"
```

## Why Both Standards Should Exist

| Concern | EIP-7730 | Contract Metadata |
|---------|----------|-------------------|
| When is it used? | At signing time | During exploration and before interaction |
| What does it format? | Transaction calldata + EIP-712 messages | The entire contract interface |
| Who consumes it? | Wallets (Ledger, MetaMask) | Explorers, dApps, documentation tools |
| What does it explain? | "You are about to send 100 USDC to vitalik.eth" | "This function transfers tokens. Warning: check the recipient. Related: approve(), balanceOf()" |
| Input or output? | Output formatting only | Both input guidance and output formatting |
| Contract context? | Minimal (name, owner, url) | Rich (description, origin, about, risks, audits, links) |
| Events/errors? | No | Yes |
| Return values? | No | Yes |

The two standards are genuinely complementary. A complete contract metadata ecosystem would use Contract Metadata for understanding and exploration, and EIP-7730 for the signing moment.

## EIP-7730 Schema Details

### Full Format Types

**Integer formats:** `raw`, `amount` (native currency), `tokenAmount` (ERC-20 with dynamic lookup), `nftName` (NFT name + ID), `date` (unix timestamp or blockheight), `duration` (seconds to human), `unit` (SI units), `enum` (value-to-label), `chainId` (chain ID to name)

**String formats:** `raw`

**Bytes formats:** `raw`, `calldata` (recursive embedded call resolution)

**Address formats:** `raw`, `addressName` (ENS/trusted name resolution), `tokenTicker` (show ERC-20 symbol), `interoperableAddressName` (ERC-7930)

### Their Parameter Path System
EIP-7730 uses JSON-path-like expressions to reference fields:
- `path` — location in calldata/message (e.g., `"to"`, `"details.token"`)
- `value` — literal constant (e.g., `"Approve"`)
- `tokenPath` — dynamic reference to another field holding a token address
- `calldataPath` — reference to embedded calldata for recursive resolution

### Their Metadata Object
```json
{
  "metadata": {
    "owner": "Uniswap Labs",
    "contractName": "Universal Router",
    "info": { "url": "https://uniswap.org", "deploymentDate": "2023-01-15" },
    "token": { "name": "USD Coin", "ticker": "USDC", "decimals": 6 },
    "constants": { "MAX_UINT": "0xffffffff..." },
    "enums": { "orderType": { "0": "LIMIT", "1": "MARKET" } },
    "maps": {
      "bridgeDestination": {
        "keyPath": "chainId",
        "values": { "1": "Ethereum", "137": "Polygon" }
      }
    }
  }
}
```
