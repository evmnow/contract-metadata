---
eip: TBD
title: Contract Metadata
description: A JSON standard for layering human-readable context on top of smart contract ABIs.
author: YGG (@yougogirldoteth), Jalil Sebastian Wahdatehagh (@jwahdatehagh)
discussions-to: TBD
status: Draft
type: Standards Track
category: ERC
created: 2026-04-01
---

## Abstract

This EIP defines a JSON metadata format that enriches smart contracts with human-readable context at every level: contract descriptions, function titles and warnings, semantic type annotations for parameters, input guidance, and event/error enrichment. It layers on top of the ABI and NatSpec without replacing either, giving wallets, explorers, and dApps the information they need to present contract interactions in terms users can understand.

## Motivation

Smart contracts expose two layers of machine-readable information: the **ABI** (what functions exist and their Solidity types) and **NatSpec** (embedded source code documentation). Neither is structured to help end users understand the full scope of smart contract interactions.

When someone encounters a contract in a wallet, explorer, or dApp, they see raw function signatures like `offerPunkForSaleToAddress(uint256, uint256, address)` with no context about what happens when they call it, what the risks are, or what the parameters actually mean in human terms. A `uint256` could represent an ETH amount, a timestamp, a token ID, or a percentage in basis points. The ABI doesn't say which.

NatSpec provides basic descriptions (including user-facing `@notice` text), but it's flat text embedded in source code. It can't express semantic types, input guidance, or contract-level context, and is unavailable for unverified contracts.

## Specification

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in RFC 2119.

### Overview

A metadata file describes a single deployed contract:

```json
{
  "$schema": "https://1001-digital.github.io/contract-metadata/v1/schema.json",
  "chainId": 1,
  "address": "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb",
  "name": "CryptoPunks",
  "description": "10,000 unique collectible pixel art characters on Ethereum.",
  "image": "ipfs://QmTNgv3jx2HHfBjQX9RnKtxj2xv2xQDtbDXoRi5rJ3a46",
  "groups": { ... },
  "functions": { ... },
  "events": { ... },
  "errors": { ... }
}
```

### Top-Level Fields

#### Document Fields

| Field       | Type     | Required | Description                                                              |
| ----------- | -------- | -------- | ------------------------------------------------------------------------ |
| `$schema`   | `string` | REQUIRED | URI pointing to the contract-metadata JSON Schema                        |
| `chainId`   | `number` | REQUIRED | The chain ID of the network where the contract is deployed               |
| `address`   | `string` | REQUIRED | The contract address (lowercase, checksummed addresses MUST be accepted) |
| `includes`  | `array`  | OPTIONAL | Interface identifiers to include (e.g. `["interface:erc721"]`)           |
| `meta`      | `object` | OPTIONAL | Document housekeeping (version, lastUpdated, locale, signature)          |

#### Contract-Level Context

The following fields provide context about the contract itself. The fields `name`, `symbol`, `description`, `image`, `banner_image`, `featured_image`, `external_link`, and `collaborators` are compatible with [ERC-7572](./eip-7572.md) -- a contract-metadata document with `name` present is a valid ERC-7572 `contractURI()` response. The `theme` color model is inspired by [ENSIP-18](https://docs.ens.domains/ensip/18).

| Field            | Type     | Required | Description                                                              |
| ---------------- | -------- | -------- | ------------------------------------------------------------------------ |
| `name`           | `string` | OPTIONAL | Human-readable contract name (ERC-7572)                                  |
| `symbol`         | `string` | OPTIONAL | Contract or token symbol (ERC-7572)                                      |
| `description`    | `string` | OPTIONAL | Description of the contract (ERC-7572)                                   |
| `image`          | `string` | OPTIONAL | Contract image or logo URI (ERC-7572)                                    |
| `banner_image`   | `string` | OPTIONAL | Banner image URI (ERC-7572)                                              |
| `featured_image` | `string` | OPTIONAL | Featured image URI (ERC-7572)                                            |
| `external_link`  | `string` | OPTIONAL | Primary external URL for the project (ERC-7572)                          |
| `collaborators`  | `array`  | OPTIONAL | Ethereum addresses of authorized metadata editors (ERC-7572)             |
| `about`          | `string` | OPTIONAL | Long-form context, history, and explanations in Markdown                 |
| `category`       | `string` | OPTIONAL | Primary category (token, nft, defi, governance, bridge, etc.)            |
| `tags`           | `array`  | OPTIONAL | Free-form tags for search and categorization                             |
| `links`          | `array`  | OPTIONAL | External links (website, documentation, block explorer, etc.)            |
| `risks`          | `array`  | OPTIONAL | Known risks or caveats users should be aware of                          |
| `audits`         | `array`  | OPTIONAL | Security audit references                                                |
| `theme`          | `object` | OPTIONAL | Visual theme for UI rendering                                            |

#### Interface Metadata

| Field       | Type     | Required | Description                                                              |
| ----------- | -------- | -------- | ------------------------------------------------------------------------ |
| `groups`    | `object` | OPTIONAL | Named groups for organizing functions                                    |
| `functions` | `object` | OPTIONAL | Per-function metadata, keyed by name, signature, or 4-byte selector      |
| `events`    | `object` | OPTIONAL | Per-event metadata, keyed by name, signature, or 32-byte topic hash      |
| `errors`    | `object` | OPTIONAL | Per-error metadata, keyed by name, signature, or 4-byte selector         |
| `messages`  | `object` | OPTIONAL | EIP-712 typed message metadata, keyed by primary type name               |

### Contract-Level Example

```json
{
  "$schema": "https://1001-digital.github.io/contract-metadata/v1/schema.json",
  "chainId": 1,
  "address": "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb",
  "name": "CryptoPunks",
  "symbol": "PUNK",
  "description": "One of the earliest NFT projects, predating the ERC-721 standard...",
  "image": "ipfs://QmTNgv3jx2HHfBjQX9RnKtxj2xv2xQDtbDXoRi5rJ3a46",
  "external_link": "https://cryptopunks.app",
  "category": "nft",
  "tags": ["nft", "collectible", "pfp"],
  "links": [{ "label": "Website", "url": "https://..." }],
  "risks": ["No upgradeability. Bugs are permanent"],
  "audits": [
    { "auditor": "Trail of Bits", "url": "https://...", "date": "2023-01-15" }
  ],
  "about": "## 10,000 unique collectible characters\n\nCryptoPunks extend the collecting impulse into the digital realm...",
  "theme": {
    "background": "#000000",
    "text": "#ffffff",
    "accent": "#ff04b4",
    "accentText": "#ffffff",
    "border": "#333333"
  }
}
```

### Function, Event, and Error Keys

Functions, events, and errors are keyed by one of three formats:

| Format            | When to use                  | Example                                             |
| ----------------- | ---------------------------- | --------------------------------------------------- |
| `name`            | No overloads, verified ABI   | `"transfer"`                                        |
| `name(type,type)` | Overloaded functions         | `"safeTransferFrom(address,address,uint256,bytes)"` |
| `0xabcdef12`      | Unverified contract / no ABI | `"0xa9059cbb"`                                      |

**Bare name** is the default for verified contracts without overloaded functions. When a contract has multiple functions with the same name but different parameter types (overloads), the full Solidity-style signature MUST be used to disambiguate. For unverified contracts where no ABI is available, the 4-byte function selector (the first 4 bytes of `keccak256(signature)`) SHOULD be used.

The same formats apply to events and errors. For events, the selector is the full 32-byte topic hash (`0x` + 64 hex chars). For errors, it is the 4-byte selector like functions.

Consumers SHOULD match by name first, then fall back to signature or selector lookup.

### Function Metadata

Each function entry MAY include the following fields:

```json
{
  "functions": {
    "offerPunkForSaleToAddress": {
      "title": "List Punk for Sale (Private)",
      "description": "List a punk for sale to a specific address only, at a minimum price.",
      "group": "marketplace",
      "warning": "This creates a binding offer. The buyer can purchase at any time.",
      "featured": true,
      "hidden": false,
      "intent": "List Punk #{punkIndex} for sale at {minSalePriceInWei} to {toAddress}",
      "related": ["offerPunkForSale", "buyPunk"],
      "params": {
        "punkIndex": {
          "label": "Punk",
          "description": "The punk ID to list (0-9999)",
          "type": "token-id",
          "validation": { "min": "0", "max": "9999" }
        },
        "minSalePriceInWei": {
          "label": "Price",
          "type": "eth"
        },
        "toAddress": {
          "label": "Buyer",
          "description": "Only this address can buy the punk",
          "type": "address"
        }
      }
    }
  }
}
```

- `order` (integer): Display order within the function's group. Lower numbers appear first. Functions without an `order` are sorted after ordered ones.
- `title` (string): Human-readable title for the function.
- `description` (string): Longer explanation of what the function does.
- `group` (string): Key referencing a named group in the `groups` object.
- `warning` (string): Cautionary text displayed to the user.
- `featured` (boolean): If `true`, highlights this as a primary action.
- `hidden` (boolean): If `true`, suppresses the function from the default UI.
- `intent` (string): Human-readable sentence template rendered with formatted parameter values.
- `related` (array of strings): Keys of related functions.
- `params` (object): Per-parameter metadata, keyed by ABI parameter name.

### Semantic Types

The `type` field on a parameter is a semantic annotation that tells consumers what a value _represents_. A `uint256` in the ABI carries no meaning beyond "256-bit unsigned integer." Semantic types bridge that gap -- consumers use them to render appropriate UI for both display (read) and input (write) contexts.

#### String Types

| Type           | Meaning                                                           |
| -------------- | ----------------------------------------------------------------- |
| `eth`          | Value in wei, represents an ETH amount                            |
| `gwei`         | Value in gwei                                                     |
| `timestamp`    | Unix timestamp (display: formatted date, input: date picker)      |
| `address`      | Ethereum address (with ENS resolution)                            |
| `boolean`      | Boolean value                                                     |
| `blocknumber`  | Block number                                                      |
| `duration`     | Duration in seconds                                               |
| `bytes32-utf8` | bytes32 encoding a UTF-8 string                                   |
| `token-id`     | Token ID / NFT identifier                                         |
| `percentage`   | Percentage value (0-100)                                          |
| `basis-points` | Value in basis points (1/100th of a percent)                      |
| `token-amount` | Token amount (display: formatted balance, input: with max button) |
| `date`         | Date value                                                        |
| `datetime`     | Date and time value                                               |
| `hidden`       | Not shown to the user; value is auto-populated (see `autofill`)   |

#### Object Types

Types that need additional configuration MUST use an object form:

```jsonc
// Address with options
{ "type": "address", "ens": true, "addressBook": true }

// Token amount for a specific token
{ "type": "token-amount", "tokenAddress": "0x..." }

// Token ID for a specific NFT collection
{ "type": "token-id", "tokenAddress": "0x..." }

// Enum -- display: show label, input: render as select dropdown
{ "type": "enum", "values": { "0": "Pending", "1": "Active" } }

// Slider -- input: render as range slider
{ "type": "slider", "min": "0", "max": "9999", "step": "1" }
```

### Autofill

The `autofill` field specifies a source to pre-populate an input with. It is separate from `type` -- one describes the value, the other controls the default.

#### String Autofill Values

| Value               | Meaning                          |
| ------------------- | -------------------------------- |
| `connected-address` | User's connected wallet address  |
| `contract-address`  | This contract's address          |
| `zero-address`      | The zero address (`0x000...000`) |
| `block-timestamp`   | Current block timestamp          |

#### Object Autofill Values

For literal constants:

```json
{ "type": "constant", "value": "86400" }
```

A parameter MAY combine `type` and `autofill`:

```json
"from": {
  "label": "from",
  "type": "address",
  "autofill": "connected-address"
}
```

### Groups

Functions MAY be organized into named groups. Each group MUST have a `label` and SHOULD have an `order` for display sorting:

```json
{
  "groups": {
    "marketplace": { "label": "Marketplace", "order": 1 },
    "bidding": { "label": "Bidding", "order": 2 },
    "ownership": { "label": "Ownership", "order": 3 }
  }
}
```

Individual functions, events, errors, and messages MAY also have an `order` field to control display order within their group (or among ungrouped items). Lower numbers appear first. Items without an `order` are sorted after ordered ones.

### Intent Templates

Functions MAY include an `intent` template -- a human-readable sentence rendered with formatted parameter values:

```json
{
  "functions": {
    "composite": {
      "title": "Composite",
      "intent": "Composite Check #{tokenId} with #{burnId}",
      "params": {
        "tokenId": {
          "label": "Keep Token ID",
          "preview": {
            "image": "eip155:1/erc721:0x036721e5a769cc48b3189efbb9cce4471e8a48b1/{tokenId}"
          }
        },
        "burnId": {
          "label": "Burn Token ID",
          "preview": { "image": "ipfs://Qme/{burnId}" }
        }
      }
    }
  }
}
```

After the user fills in parameters, the intent renders as: **"Composite Check #4200 with #8000"**. Placeholders use `{paramName}` syntax. Prefix with `#` to prepend a hash symbol (e.g. `#{tokenId}` renders as `#4200`). Values MUST be formatted using their `type` before insertion.

### Parameter Previews

Parameters MAY include a `preview` object to show a visual preview as the user fills in values. The `image` field specifies a URI template that resolves to an image for the current parameter value:

```json
"preview": { "image": "eip155:1/erc721:0x036721e5a769cc48b3189efbb9cce4471e8a48b1/{tokenId}" }
```

URI templates use `{paramName}` interpolation -- the same syntax as intent templates. Supported URI formats:

| Format      | Example                                    | Use case                                         |
| ----------- | ------------------------------------------ | ------------------------------------------------ |
| CAIP-19 URI | `eip155:1/erc721:0x036.../{tokenId}`       | ERC-721 NFT image resolved via token metadata    |
| CAIP-29 URI | `eip155:1/erc1155:0x28959.../{tokenId}`    | ERC-1155 token image resolved via token metadata |
| IPFS URI    | `ipfs://Qme/{tokenId}`                     | Off-chain image stored on IPFS                   |
| HTTPS URI   | `https://example.com/images/{tokenId}.png` | Conventional hosted image                        |

Consumers SHOULD resolve CAIP-19 and CAIP-29 URIs by fetching the token's metadata (e.g. via `tokenURI` or `uri`) and extracting the image. IPFS and HTTPS URIs resolve directly to the image content.

### Interface Includes

Common interface metadata (ERC-20, ERC-721, etc.) can be defined once and included by contract files:

```json
{
  "includes": ["interface:erc721", "https://example.com/metadata.json"],
  "$schema": "https://1001-digital.github.io/contract-metadata/v1/schema.json",
  "chainId": 1,
  "address": "0x036721e5a769cc48b3189efbb9cce4471e8a48b1",
  "name": "Checks Originals",
  "functions": {
    "mint": { "...": "..." },
    "composite": { "...": "..." }
  }
}
```

Includes support two formats:

- **`interface:` prefix** -- references a named interface file in the `interfaces/` subdirectory relative to the `$schema` URL (e.g. `"interface:erc721"` resolves to `interfaces/erc721.json` next to the schema file). These files contain `groups`, `functions`, `events`, `errors`, and `messages`.
- **URL** -- fetches the metadata file from the given URL. The resolved file can live anywhere and follows the same structure.

Multiple includes merge left-to-right. Contract-specific metadata is then applied on top.

#### Merge Semantics

The merge is _shallow per top-level key within each section_. When a contract defines a function that also exists in an included interface, the contract's entire function object replaces the interface's. There is no deep merge of `params`, `returns`, or other nested fields. This means if you override a function, you MUST re-declare everything you want to keep (params, returns, types, etc.).

```
# Merge order for includes: ["interface:erc20", "interface:erc721"]
1. Start with empty {}
2. Merge erc20.json    -> { functions: { transfer: {from erc20}, approve: {from erc20} } }
3. Merge erc721.json   -> { functions: { transfer: {from erc721}, approve: {from erc721}, ownerOf: {from erc721} } }
4. Merge contract file  -> { functions: { transfer: {from contract}, approve: {from erc721}, ownerOf: {from erc721}, mint: {from contract} } }
```

### EIP-712 Message Metadata

Off-chain signing flows (Permit, Seaport orders, etc.) MAY be described with the `messages` object:

```json
{
  "messages": {
    "Permit": {
      "title": "Token Permit",
      "description": "Approve a spender to transfer your tokens without a separate approve transaction.",
      "warning": "This grants token spending permission. Verify the spender address carefully.",
      "intent": "Permit {spender} to spend {value} of your tokens until {deadline}",
      "fields": {
        "owner": { "label": "owner", "type": "address" },
        "spender": { "label": "spender", "type": "address" },
        "value": { "label": "amount", "type": "eth" },
        "nonce": { "label": "nonce" },
        "deadline": { "label": "deadline", "type": "timestamp" }
      }
    }
  }
}
```

Messages are keyed by EIP-712 primary type name and MUST be defined on the contract that verifies them. Each message supports the same enrichment as functions: `title`, `description`, `warning`, `intent`, and `fields` with the same parameter metadata (label, description, type).

### Extensions

Publishers MAY use custom extension objects on the root document, functions, events, errors, messages, and parameters. Extension names MUST start with an `_` character followed by a letter. Consumers that do not understand a given extension MUST ignore it.

```json
{
  "functions": {
    "colors": {
      "title": "Check Colors",
      "description": "Get the colors of a given Check.",
      "params": {
        "tokenId": { "label": "Check", "type": "token-id" }
      },
      "_component": {
        "type": "color-map",
        "columns": "8"
      }
    }
  }
}
```

**Naming rules:**

- The extension name MUST begin with `_` followed by a letter (e.g. `_myapp`, `_component`).
- Extension names and their member keys MUST NOT contain `.` characters.
- Extensions SHOULD be named after a company, product, or feature to make their purpose clear.

No standard keys will ever begin with `_`, so the namespace is reserved for extensions.

## Rationale

### Why not extend NatSpec?

NatSpec is embedded in Solidity source code and targets developers. It cannot express semantic types, input guidance, or contract-level context like categories, risks, and audits. It is also unavailable for unverified contracts. A separate JSON format allows metadata to be authored, versioned, and served independently of the contract source.

### Why semantic types instead of just labels?

Labels help humans but not machines. A label "Price" on a `uint256` still doesn't tell a wallet whether to format the value as ETH, display a date picker, or show an NFT preview. Semantic types enable consumers to render appropriate UI automatically.

### Why shallow merge for includes?

Deep merging creates ambiguity about which nested fields take precedence and makes it difficult to reason about the final result. Shallow merge per function key is predictable: if you override a function, you own the entire definition. This mirrors how interface implementation works in most programming languages.

### Why three key formats (name, signature, selector)?

Bare names are the common case and the most readable. Signatures are needed for overloaded functions. Selectors are needed for unverified contracts where no ABI is available. Supporting all three covers the full spectrum of real-world contracts.

## Backwards Compatibility

This EIP introduces a new metadata format and does not modify any existing standards. It is fully complementary to ABIs, NatSpec, ERC-7572, and EIP-7730.

Contract-level fields (`name`, `symbol`, `description`, `image`, `banner_image`, `featured_image`, `external_link`, `collaborators`) are placed at the top level to maintain backwards compatibility with [ERC-7572](./eip-7572.md). A contract-metadata document with `name` present is a valid ERC-7572 `contractURI()` response -- existing consumers that understand only ERC-7572 will read the fields they recognize and ignore the rest.

## Reference Implementation

A reference implementation including JSON Schema definitions and a validation script is available at [https://github.com/1001-digital/contract-metadata](https://github.com/1001-digital/contract-metadata).

The repository includes:

- `schema/contract-metadata.schema.json` -- JSON Schema for contract metadata files
- `schema/interface.schema.json` -- JSON Schema for interface files
- `schema/interfaces/` -- Reusable interface metadata (ERC-20, ERC-721)
- `contracts/` -- Example metadata files for deployed contracts
- `validate.ts` -- Schema and semantic validation script

## Security Considerations

### Metadata Integrity

Contract metadata is an off-chain resource. Consumers MUST NOT trust metadata blindly -- it could be outdated, incorrect, or malicious. Metadata SHOULD be served from authenticated sources and MAY be signed (via the `meta.signature` field) to allow consumers to verify authorship.

### Misleading Labels

A malicious metadata author could assign misleading labels or descriptions to functions (e.g. labeling a `transferFrom` as "Check Balance"). Consumers SHOULD display the underlying ABI function signature alongside any metadata-provided labels to allow users to verify.

### Intent Template Injection

Intent templates use `{paramName}` interpolation. Consumers MUST sanitize rendered intent strings to prevent injection attacks (e.g. XSS in web-based wallets). Parameter values MUST be treated as untrusted input during rendering.

### Extension Safety

Extensions are opaque to consumers that do not understand them. Consumers MUST ignore unknown extensions rather than attempting to interpret them. Extension authors SHOULD document their extensions and avoid storing sensitive data in extension fields.

## Copyright

Copyright and related rights waived via [CC0](./LICENSE).
