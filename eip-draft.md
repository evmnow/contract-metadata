---
eip: TBD
title: Contract Metadata
description: A JSON standard for layering human-readable context and clear-signing metadata on top of smart contract ABIs.
author: YGG (@yougogirldoteth), Jalil Sebastian Wahdatehagh (@jwahdatehagh)
discussions-to: TBD
status: Draft
type: Standards Track
category: ERC
created: 2026-04-01
---

## Abstract

This EIP defines a JSON metadata format that enriches smart contracts with human-readable context at every level: contract descriptions, clear-signing intents, ordered display fields, semantic value formats, input guidance, and event/error enrichment. It layers on top of the ABI and NatSpec without replacing either, giving wallets, explorers, and dApps the information they need to present contract interactions in terms users can understand while remaining forward-compatible with ERC-7730-style clear signing.

## Motivation

Smart contracts expose two layers of machine-readable information: the **ABI** (what functions exist and their Solidity types) and **NatSpec** (embedded source code documentation). Neither is structured to help end users understand the full scope of smart contract interactions.

When someone encounters a contract in a wallet, explorer, or dApp, they see raw function signatures like `offerPunkForSaleToAddress(uint256, uint256, address)` with no context about what happens when they call it, what the risks are, or what the parameters actually mean in human terms. A `uint256` could represent an ETH amount, a timestamp, a token ID, or a percentage in basis points. The ABI doesn't say which.

NatSpec provides basic descriptions (including user-facing `@notice` text), but it's flat text embedded in source code. It can't express semantic display fields, structured clear-signing intents, input guidance, or contract-level context, and is unavailable for unverified contracts.

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
| `metadata`  | `object` | OPTIONAL | Reusable constants, enums, maps, and shared metadata definitions         |
| `display`   | `object` | OPTIONAL | Reusable clear-signing field definitions                                 |
| `deployments` | `array` | OPTIONAL | Additional chain/address deployment records for the same contract        |
| `factory`   | `object` | OPTIONAL | Factory deployment context and instance-discovery metadata               |

#### Contract-Level Context

The following fields provide context about the contract itself. The fields `name`, `symbol`, `description`, `image`, `banner_image`, `featured_image`, `external_link`, and `collaborators` are compatible with [ERC-7572](./eip-7572.md) -- a contract-metadata document with `name` present is a valid ERC-7572 `contractURI()` response. The `theme` color model is inspired by [ENSIP-18](https://docs.ens.domains/ensip/18). The same document MAY also carry reusable metadata and display definitions so that documentation, input guidance, and clear-signing context are authored once.

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
| `functions` | `object` | OPTIONAL | Per-function metadata, keyed preferably by canonical named ABI fragment  |
| `events`    | `object` | OPTIONAL | Per-event metadata, keyed preferably by canonical named ABI fragment      |
| `errors`    | `object` | OPTIONAL | Per-error metadata, keyed preferably by canonical named ABI fragment      |
| `messages`  | `object` | OPTIONAL | EIP-712 typed message metadata, keyed preferably by primary type name    |

#### Deployment Context

The common `chainId` and `address` pair describe a single deployed contract. For contracts that exist across multiple networks or are discovered through a factory, authors MAY include `deployments` and `factory` context alongside the single-deployment fields.

- `deployments` SHOULD list the relevant chain/address pairs for the same contract identity.
- `factory` SHOULD describe the factory contract, deploy event, or instance-discovery pattern used to materialize clones or child contracts.

Consumers that understand only `chainId` and `address` MUST be able to ignore the richer deployment context without losing the basic contract identity.

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
| `name(type name,type name)` | Clear-signing metadata and overloads | `"safeTransferFrom(address from,address to,uint256 tokenId,bytes data)"` |
| `0xabcdef12`      | Unverified contract / no ABI | `"0xa9059cbb"`                                      |

For forward compatibility with clear signing, the preferred key format is the canonical named ABI fragment, for example `transfer(address to,uint256 value)`. Bare names remain acceptable for simple verified contracts, but they do not carry enough information to express parameter paths or clear-signing fields on their own. When a contract has multiple functions with the same name but different parameter types (overloads), the full Solidity-style signature MUST be used to disambiguate. For unverified contracts where no ABI is available, the 4-byte function selector (the first 4 bytes of `keccak256(signature)`) SHOULD be used.

The same formats apply to events and errors. For events, the selector is the full 32-byte topic hash (`0x` + 64 hex chars). For errors, it is the 4-byte selector like functions.

Consumers SHOULD match by canonical named ABI fragment first when available, then fall back to bare name, signature, or selector lookup.

### Function Metadata

Each function entry MAY include the following fields:

```json
{
  "functions": {
    "offerPunkForSaleToAddress(uint256 punkIndex,uint256 minSalePriceInWei,address toAddress)": {
      "title": "List Punk for Sale (Private)",
      "description": "List a punk for sale to a specific address only, at a minimum price.",
      "group": "marketplace",
      "warning": "This creates a binding offer. The buyer can purchase at any time.",
      "featured": true,
      "hidden": false,
      "intent": "List Punk for Sale",
      "interpolatedIntent": "List Punk #{punkIndex} for sale at {minSalePriceInWei} to {toAddress}",
      "fields": [
        {
          "path": "punkIndex",
          "label": "Punk",
          "description": "The punk ID to list (0-9999)",
          "format": "nftName",
          "params": {
            "collection": "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb"
          },
          "input": {
            "validation": { "min": "0", "max": "9999" }
          }
        },
        {
          "path": "minSalePriceInWei",
          "label": "Price",
          "format": "amount"
        },
        {
          "path": "toAddress",
          "label": "Buyer",
          "description": "Only this address can buy the punk",
          "format": "addressName"
        }
      ],
      "related": ["offerPunkForSale", "buyPunk"],
      "input": {
        "punkIndex": {
          "validation": { "min": "0", "max": "9999" }
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
- `intent` (string): Short human-readable summary of the action. It SHOULD be stable across renderers and may omit dynamic values.
- `interpolatedIntent` (string): Human-readable sentence template rendered with formatted field values for clear signing.
- `fields` (array): Ordered clear-signing and display metadata entries.
- `input` (object): Input, autofill, and validation guidance for write flows.
- `related` (array of strings): Keys of related functions.
- `params` (object): Per-parameter metadata, keyed by ABI parameter name. This MAY remain as an input-oriented compatibility layer, but clear-signing consumers SHOULD rely on `fields`.

### Clear-Signing Fields

`fields` is the canonical ordered list of values shown to a user for review or signing. Each field entry MAY be nested and MAY include any of the following members: `path`, `label`, `description`, `format`, `params`, `visible`, `fields`, `$ref`, `value`, `input`, and `preview`.

- `path` identifies the source value for the field.
- `label` provides the human-readable name shown alongside the value.
- `format` is the display primitive and determines how the value is rendered.
- `params` configures the chosen formatter.
- `visible` controls whether the field is shown unconditionally or only under specific conditions.
- `fields` nests child fields for composite values such as structs, arrays, or grouped display sections.
- `$ref` points to a reusable field definition in `display.definitions` or a reusable metadata definition.
- `value` provides a literal value when the field is a constant rather than a data reference.

Fields SHOULD preserve the order declared in the document. Consumers MAY use the order to drive both display and clear-signing sentence construction.

### Path Roots

Field paths use ERC-7730-style roots:

- `#` refers to the decoded structured data being described, such as function arguments or typed message fields.
- `$` refers to the metadata document itself, including reusable `metadata` constants, enums, maps, and display definitions.
- `@` refers to the surrounding execution context, such as transaction or message envelope data like `from`, `to`, `value`, `chainId`, or similar container values.

Consumers SHOULD treat paths as structure-aware references rather than raw string labels. Paths MAY address nested values, array elements, and reusable definitions as long as the consumer can resolve them deterministically.

### Display Formats

The `format` field is the semantic display primitive. It tells consumers how to render a value for clear signing and read-only presentation. A Solidity `uint256` carries no meaning beyond "256-bit unsigned integer"; display formats bridge that gap by saying whether the value is an amount, a timestamp, an address, a token ID, or something else.

#### String Formats

| Format                     | Meaning                                                                   |
| -------------------------- | ------------------------------------------------------------------------- |
| `raw`                      | Render the primitive value without semantic conversion                     |
| `amount`                   | Render a native-currency amount                                           |
| `tokenAmount`              | Render an ERC-20 or native token amount using token metadata              |
| `nftName`                  | Render an NFT collection item by collection and token ID                  |
| `date`                     | Render a timestamp, block height, or other date-like integer              |
| `duration`                 | Render a duration in human-readable units                                 |
| `unit`                     | Render a number with a configured unit                                    |
| `enum`                     | Render a raw value through a label map                                    |
| `chainId`                  | Render a chain ID as a network name                                       |
| `addressName`              | Render an address with trusted name resolution where available            |
| `tokenTicker`              | Render an address as a token ticker where available                       |
| `interoperableAddressName` | Render an interoperable address name                                      |
| `calldata`                 | Decode and render embedded calldata using the target contract and selector |

Legacy aliases such as `eth`, `timestamp`, `address`, `token-id`, and `token-amount` MAY be accepted by consumers for older documents, but new clear-signing metadata SHOULD use the ERC-7730-aligned format names above.

#### Format Examples

Formats that need additional configuration use field-level `params`:

```jsonc
// Address with name resolution
{ "path": "toAddress", "format": "addressName" }

// Token amount for a specific token
{ "path": "amount", "format": "tokenAmount", "params": { "token": "0x..." } }

// Token ID for a specific NFT collection
{ "path": "tokenId", "format": "nftName", "params": { "collection": "0x..." } }

// Enum -- display through a label map
{ "path": "status", "format": "enum", "params": { "values": { "0": "Pending", "1": "Active" } } }

// Date encoded as a unix timestamp
{ "path": "deadline", "format": "date", "params": { "encoding": "timestamp" } }
```

Common formatter params SHOULD be understood as part of the display format contract:

- `token` or `tokenPath` identifies the ERC-20 or native asset used for token-aware display.
- `collection` or `collectionPath` identifies the NFT collection used for token ID or NFT display.
- `chainId` or `chainIdPath` binds a formatter to a specific chain or chain-derived context.
- `threshold` and `message` allow special-case rendering such as sentinel amounts, unlimited approvals, or other notable values.
- `encoding` describes how to interpret date-like values, such as timestamp, block height, or calendar date encoding.
- `calldata` formatters MAY use structural params such as selector, target, recipient, spender, amount, or other field paths needed to present call data in a human-readable way.

### Input, Autofill, and Validation

Input guidance is separate from display formatting. Consumers MAY use `input`, `autofill`, and `validation` to drive how a value is collected, while `format` controls how that value is rendered. Where older documents use `type`, they are describing the input-side hinting model, not the clear-signing display primitive.

The `autofill` field specifies a source to pre-populate an input with.

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

A value MAY combine display format, autofill, and validation guidance:

```json
"input": {
  "from": {
    "autofill": "connected-address",
    "validation": {
      "pattern": "^0x[0-9a-fA-F]{40}$"
    }
  }
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

Functions SHOULD expose a short `intent` plus an `interpolatedIntent` that can be rendered from the canonical `fields` list. The `intent` is the stable human summary, while `interpolatedIntent` is the value-bearing sentence used for clear signing:

```json
{
  "functions": {
    "composite(uint256 tokenId,uint256 burnId)": {
      "title": "Composite",
      "intent": "Composite Check",
      "interpolatedIntent": "Composite Check #{tokenId} with #{burnId}",
      "fields": [
        {
          "path": "tokenId",
          "label": "Keep Token ID",
          "format": "nftName",
          "params": {
            "collection": "0x036721e5a769cc48b3189efbb9cce4471e8a48b1"
          },
          "preview": {
            "image": "eip155:1/erc721:0x036721e5a769cc48b3189efbb9cce4471e8a48b1/{tokenId}"
          }
        },
        {
          "path": "burnId",
          "label": "Burn Token ID",
          "format": "nftName",
          "params": {
            "collection": "0x036721e5a769cc48b3189efbb9cce4471e8a48b1"
          },
          "preview": { "image": "ipfs://Qme/{burnId}" }
        }
      ]
    }
  }
}
```

After the user fills in fields, the interpolated intent renders as the user-facing sentence. Placeholders SHOULD resolve against field paths, and consumers MUST format values using the declared `format` before insertion. Prefixing a placeholder with `#` MAY still be used as a display convention for hash-style identifiers, but the underlying reference model is the field path rather than a bare parameter name.

### Parameter Previews

Fields MAY include a `preview` object to show a visual preview as the user fills in values. The `image` field specifies a URI template that resolves to an image for the current field value:

```json
"preview": { "image": "eip155:1/erc721:0x036721e5a769cc48b3189efbb9cce4471e8a48b1/{tokenId}" }
```

URI templates MAY interpolate field values. The same placeholder conventions used for clear-signing sentences apply here. Supported URI formats:

| Format      | Example                                    | Use case                                         |
| ----------- | ------------------------------------------ | ------------------------------------------------ |
| CAIP-19 URI | `eip155:1/erc721:0x036.../{tokenId}`       | ERC-721 NFT image resolved via token metadata    |
| CAIP-29 URI | `eip155:1/erc1155:0x28959.../{tokenId}`    | ERC-1155 token image resolved via token metadata |
| IPFS URI    | `ipfs://Qme/{tokenId}`                     | Off-chain image stored on IPFS                   |
| HTTPS URI   | `https://example.com/images/{tokenId}.png` | Conventional hosted image                        |

Consumers SHOULD resolve CAIP-19 and CAIP-29 URIs by fetching the token's metadata (e.g. via `tokenURI` or `uri`) and extracting the image. IPFS and HTTPS URIs resolve directly to the image content.

### Reusable Metadata and Display Definitions

To avoid repetition and support clear-signing reuse, a document MAY include reusable `metadata` and `display` namespaces.

- `metadata.constants` stores named literal values that can be referenced from fields, messages, or other definitions.
- `metadata.enums` stores reusable label sets for repeated enum-like values.
- `metadata.maps` stores reusable lookup tables or path-based mappings.
- `display.definitions` stores named reusable field definitions that can be referenced with `$ref`.

These namespaces are document-local unless brought in through includes. They SHOULD be shallow-mergeable in the same way as other top-level sections, so authors can override or extend shared definitions without implicit deep merging.

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

Multiple includes merge left-to-right. Contract-specific metadata is then applied on top, including any reusable `metadata` or `display` definitions.

Optional capabilities SHOULD be modeled as separate includes rather than added to a base interface. For example, a token that implements EIP-2612 Permit can include both `interface:erc20` and `interface:erc20-permit`, while an ERC-20 token without Permit support includes only `interface:erc20`. This keeps common ERC-20 clear-signing metadata reusable without advertising unsupported EIP-712 signing flows.

#### Merge Semantics

The merge is _shallow per top-level key within each section_. When a contract defines a function that also exists in an included interface, the contract's entire function object replaces the interface's. There is no deep merge of `fields`, `params`, `returns`, or other nested fields. This means if you override a function, you MUST re-declare everything you want to keep (fields, params, returns, formats, and related metadata).

Because the merge is key-based, overrides MUST use the same key form as the included interface entry. If an included interface uses `transfer(address to,uint256 value)`, then a contract-specific override for that function MUST use `transfer(address to,uint256 value)` rather than `transfer`; otherwise both entries remain after merging.

```
# Merge order for includes: ["interface:erc20", "interface:erc721"]
1. Start with empty {}
2. Merge erc20.json    -> { functions: { transfer: {from erc20}, approve: {from erc20} } }
3. Merge erc721.json   -> { functions: { transfer: {from erc721}, approve: {from erc721}, ownerOf: {from erc721} } }
4. Merge contract file  -> { functions: { transfer: {from contract}, approve: {from erc721}, ownerOf: {from erc721}, mint: {from contract} } }
```

### EIP-712 Message Metadata

Off-chain signing flows (Permit, Seaport orders, etc.) MAY be described with the `messages` object. Message entries SHOULD be keyed by the canonical EIP-712 primary type, and the authored metadata SHOULD capture the same clear-signing primitives as functions: `title`, `description`, `warning`, `intent`, `interpolatedIntent`, and ordered `fields`.

```json
{
  "messages": {
    "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)": {
      "title": "Token Permit",
      "description": "Approve a spender to transfer your tokens without a separate approve transaction.",
      "warning": "This grants token spending permission. Verify the spender address carefully.",
      "intent": "Approve token spending",
      "interpolatedIntent": "Approve {spender} to spend {value} until {deadline}",
      "eip712": {
        "primaryType": "Permit",
        "domain": {
          "name": "Example Token",
          "version": "1",
          "chainId": 1,
          "verifyingContract": "0x0000000000000000000000000000000000000000"
        }
      },
      "fields": [
        { "path": "owner", "label": "Owner", "format": "addressName" },
        { "path": "spender", "label": "Spender", "format": "addressName" },
        {
          "path": "value",
          "label": "Amount",
          "format": "tokenAmount",
          "params": { "tokenPath": "@.domain.verifyingContract" }
        },
        { "path": "nonce", "label": "Nonce", "format": "raw" },
        {
          "path": "deadline",
          "label": "Deadline",
          "format": "date",
          "params": { "encoding": "timestamp" }
        }
      ]
    }
  }
}
```

Messages are keyed by EIP-712 primary type name or canonical type signature and MUST be defined on the contract that verifies them. Each message SHOULD also carry the domain and binding context needed for verification, including chain, verifying contract, and any message-specific constants or reusable definitions. Message `fields` SHOULD follow the same `path`, `label`, `format`, `params`, `visible`, `fields`, `$ref`, and `value` model used by functions.

### Native ERC-7730 Forward Compatibility

This standard is not an ERC-7730 file, but its clear-signing subset intentionally uses the same primitives:

- canonical named ABI fragments for function display entries
- `intent` and `interpolatedIntent`
- ordered `fields`
- ERC-7730-style path roots `#`, `$`, and `@`
- ERC-7730-aligned `format` names and formatter `params`
- reusable `metadata.constants`, `metadata.enums`, `metadata.maps`, and `display.definitions`
- deployment, factory, and EIP-712 binding context

Documents that use these primitives conform to the clear-signing profile. A consumer that understands ERC-7730-style clear signing should be able to read the clear-signing profile directly from Contract Metadata.

### Extensions

Publishers MAY use custom extension objects on the root document, `metadata`, `display`, functions, events, errors, messages, fields, and parameters. Extension names MUST start with an `_` character followed by a letter. Consumers that do not understand a given extension MUST ignore it.

```json
{
  "functions": {
    "colors(uint256 tokenId)": {
      "title": "Check Colors",
      "description": "Get the colors of a given Check.",
      "fields": [
        { "path": "tokenId", "label": "Check", "format": "nftName" }
      ],
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

NatSpec is embedded in Solidity source code and targets developers. It cannot express semantic display formats, clear-signing fields, input guidance, or contract-level context like categories, risks, and audits. It is also unavailable for unverified contracts. A separate JSON format allows metadata to be authored, versioned, and served independently of the contract source.

### Why display formats instead of just labels?

Labels help humans but not machines. A label "Price" on a `uint256` still doesn't tell a wallet whether to format the value as ETH, display a date, or show an NFT preview. Display formats enable consumers to render appropriate UI automatically, while input guidance remains separate and explicit.

### Why shallow merge for includes?

Deep merging creates ambiguity about which nested fields take precedence and makes it difficult to reason about the final result. Shallow merge per function key is predictable: if you override a function, you own the entire definition. This mirrors how interface implementation works in most programming languages.

### Why three key formats (name, signature, selector)?

Bare names are the common case and the most readable. Canonical named ABI fragments are preferred when clear-signing fields are present because they carry parameter names. Signatures are needed for overloaded functions. Selectors are needed for unverified contracts where no ABI is available. Supporting all three covers the full spectrum of real-world contracts.

## Backwards Compatibility

This EIP introduces a new metadata format and does not modify any existing standards. It is fully complementary to ABIs, NatSpec, ERC-7572, and ERC-7730.

Contract-level fields (`name`, `symbol`, `description`, `image`, `banner_image`, `featured_image`, `external_link`, `collaborators`) are placed at the top level to maintain backwards compatibility with [ERC-7572](./eip-7572.md). A contract-metadata document with `name` present is a valid ERC-7572 `contractURI()` response -- existing consumers that understand only ERC-7572 will read the fields they recognize and ignore the rest. Additional context such as `metadata`, `display`, `deployments`, and `factory` should be additive and MUST NOT interfere with consumers that only understand the older ERC-7572 surface.

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

Intent templates use field-based interpolation. Consumers MUST sanitize rendered intent strings to prevent injection attacks (e.g. XSS in web-based wallets). Field values MUST be treated as untrusted input during rendering.

### Extension Safety

Extensions are opaque to consumers that do not understand them. Consumers MUST ignore unknown extensions rather than attempting to interpret them. Extension authors SHOULD document their extensions and avoid storing sensitive data in extension fields.

## Copyright

Copyright and related rights waived via [CC0](./LICENSE).
