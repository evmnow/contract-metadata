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

This EIP defines a JSON metadata format that enriches smart contracts with human-readable context at every level: contract descriptions, user-facing actions with titles and warnings, semantic type annotations for parameters, input guidance, and event/error enrichment. It layers on top of the ABI and NatSpec without replacing either, giving wallets, explorers, and dApps the information they need to present contract interactions in terms users can understand.

Actions are decoupled from the ABI: a single ABI function MAY back multiple actions (e.g. `approve`, `approve-max`, and `revoke` all calling the same `approve(address,uint256)` with different preset or hidden parameters), allowing metadata publishers to express common user intents as distinct first-class UI entries.

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
  "$schema": "https://evmnow.github.io/contract-metadata/v1/schema.json",
  "chainId": 1,
  "address": "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb",
  "name": "CryptoPunks",
  "description": "10,000 unique collectible pixel art characters on Ethereum.",
  "image": "ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
  "groups": { ... },
  "actions": { ... },
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
| `address`   | `string` | REQUIRED | The contract address, stored lowercase (see [Address Normalization](#address-normalization)) |
| `includes`  | `array`  | OPTIONAL | Interface identifiers or https URLs to include (e.g. `["interface:erc721"]`) |
| `meta`      | `object` | OPTIONAL | Document housekeeping (version, lastUpdated, locale)                     |

`chainId` MUST be a positive integer no greater than 2^53−1 (the IEEE-754 safe integer range), so documents survive JSON round-trips through consumers that parse numbers as doubles.

#### Address Normalization

Every address stored in a document — the `address` field, `collaborators` entries, and `tokenAddress` values — MUST be lowercase hex without EIP-55 checksum; the schema enforces this with a lowercase-only pattern. Consumers MUST normalize any address input — including checksummed forms — to lowercase before lookup, comparison, or validation. Storing one canonical form and normalizing at the boundary keeps documents byte-comparable and cache keys stable.

#### Localization

`meta.locale` declares the language of the document's human-readable strings as a BCP 47 language tag matching `^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$` (e.g. `en`, `de`, `pt-BR`). A document carries exactly one locale; distributing the same contract's metadata in multiple languages is explicitly deferred to a future extension.

#### Contract-Level Context

The following fields provide context about the contract itself. The fields `name`, `symbol`, `description`, `image`, `banner_image`, `featured_image`, `external_link`, and `collaborators` are compatible with [ERC-7572](./eip-7572.md) -- a contract-metadata document with `name` present is a valid ERC-7572 `contractURI()` response. The `theme` color model is inspired by ENSIP-18.

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
| `links`          | `array`  | OPTIONAL | External project links (website, documentation, community, etc.)        |
| `risks`          | `array`  | OPTIONAL | Known risks or caveats users should be aware of                          |
| `audits`         | `array`  | OPTIONAL | Security audit references                                                |
| `theme`          | `object` | OPTIONAL | Visual theme for UI rendering                                            |

#### Interface Metadata

| Field       | Type     | Required | Description                                                              |
| ----------- | -------- | -------- | ------------------------------------------------------------------------ |
| `groups`    | `object` | OPTIONAL | Named groups for organizing actions                                      |
| `actions`   | `object` | OPTIONAL | User-facing actions, keyed by free-form identifier                       |
| `events`    | `object` | OPTIONAL | Per-event metadata, keyed by name, signature, or 32-byte topic hash      |
| `errors`    | `object` | OPTIONAL | Per-error metadata, keyed by name, signature, or 4-byte selector         |
| `messages`  | `object` | OPTIONAL | EIP-712 typed message metadata, keyed by primary type name               |

### Description Length

Every `description` field -- whether on the contract, an action, event, error, message, group, or parameter -- SHOULD be a single, plain-language sentence and MUST NOT exceed **120 characters**. Descriptions are rendered in space-constrained UI such as tooltips, list rows, and transaction previews, so they must stay short and scannable.

Long-form context -- history, multi-paragraph explanations, and Markdown formatting -- belongs in the contract-level `about` field, which has no length limit. Do not pack paragraphs into `description`.

### Contract-Level Example

```json
{
  "$schema": "https://evmnow.github.io/contract-metadata/v1/schema.json",
  "chainId": 1,
  "address": "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb",
  "name": "CryptoPunks",
  "symbol": "PUNK",
  "description": "One of the earliest NFT projects, predating the ERC-721 standard...",
  "image": "ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
  "external_link": "https://cryptopunks.app",
  "category": "nft",
  "tags": ["nft", "collectible", "pfp"],
  "links": [{ "label": "Website", "url": "https://..." }],
  "risks": ["No upgradeability. Bugs are permanent"],
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

An `audits` entry references a real security audit: `{ "auditor": "Fictional Audit Collective", "url": "https://audits.example/report.pdf", "date": "2026-01-15", "scope": "Core vault accounting" }` (auditor and URL above are illustrative placeholders — never fabricate audit references for real contracts).

### Action, Event, and Error Keys

Actions are keyed by a free-form identifier matching `^[a-zA-Z_][a-zA-Z0-9_-]*$`. The identifier is not constrained to ABI names -- it is the UI-facing label used for routing, cross-references, and variant distinction (e.g. `approve`, `approve-max`, `revoke`).

Each action resolves to the ABI function it invokes through its `function` field. When `function` is omitted, the action's id is used as the reference, so it MUST then be a valid bare function name. The `function` value uses one of three formats:

| Format            | When to use                  | Example                                             |
| ----------------- | ---------------------------- | --------------------------------------------------- |
| `name`            | No overloads, verified ABI   | `"transfer"`                                        |
| `name(type,type)` | Overloaded functions         | `"safeTransferFrom(address,address,uint256,bytes)"` |
| `0xabcdef12`      | Unverified contract / no ABI | `"0xa9059cbb"`                                      |

**Bare name** is the default for verified contracts without overloaded functions. When a contract has multiple functions with the same name but different parameter types (overloads), the full Solidity-style signature MUST be used to disambiguate. For unverified contracts where no ABI is available, the 4-byte function selector (the first 4 bytes of `keccak256(signature)`) SHOULD be used.

Events and errors are keyed directly by one of the same three formats (not via an intermediate identifier). For events, the selector is the full 32-byte topic hash (`0x` + 64 hex chars). For errors, it is the 4-byte selector like functions.

Consumers SHOULD match by name first, then fall back to signature or selector lookup.

### Action Metadata

Each action entry MAY include the following fields. When the action's `function` field is omitted, the action's id (its key in the `actions` object) is used as the reference — so non-variant actions whose id matches the underlying ABI function name can omit the `function` field entirely.

```json
{
  "actions": {
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

- `function` (string, OPTIONAL): The ABI function this action invokes. Accepts a bare name, full signature, or 4-byte selector. When omitted, the action's id is used as the reference — so `"approve": { ... }` is equivalent to `"approve": { "function": "approve", ... }`. Variants whose id differs from the underlying function (e.g. `"revoke": { "function": "approve", ... }`) MUST set this field.
- `order` (integer): Display order within the action's group. Lower numbers appear first. Actions without an `order` are sorted after ordered ones.
- `title` (string): Human-readable title for the action.
- `description` (string): A single short sentence explaining what the action does (max 120 characters -- see [Description Length](#description-length)).
- `group` (string): Key referencing a named group in the `groups` object.
- `warning` (string): Cautionary text displayed to the user.
- `featured` (boolean): If `true`, highlights this as a primary action.
- `hidden` (boolean): If `true`, suppresses the action from the default UI. If every authored action referencing a function is hidden, the function itself is hidden (no default is synthesized for it -- see [ABI-Synthesized Default Actions](#abi-synthesized-default-actions)).
- `intent` (string): Human-readable sentence template rendered with formatted parameter values.
- `related` (array of strings): Action identifiers of related actions.
- `params` (object): Per-parameter metadata, keyed by ABI parameter name or position -- see [Parameter Keys](#parameter-keys).
- `returns` (object): Per-return-value metadata, keyed by ABI return name or position, with the same shape as `params` entries (label, description, type).
- `value` (object): Metadata for the native currency (`msg.value`) sent with the call -- see [Transaction Value](#transaction-value).
- `stateMutability` (string, one of `view`, `pure`, `nonpayable`, `payable`): Overrides the ABI's `stateMutability`. This field MUST only be used to correct legacy ABIs that lack the field (e.g. pre-Byzantium contracts); when the ABI declares a `stateMutability`, consumers MUST prefer the ABI's value.
- `examples` (array): Preset example invocations for quick interaction. Each entry has a `label` and a `params` object mapping parameter keys (name or positional) to prefilled string values.
- `deprecated` (string): Deprecation notice. When set, consumers SHOULD de-emphasize the action in the UI and surface the notice before invocation.

#### Parameter Keys

Keys in `params` (and `returns`) identify an ABI parameter in one of two ways:

- **Name key** -- the ABI parameter's name (e.g. `"spender"`). Only valid when the parameter is named in the ABI.
- **Positional key** -- `_N`, where `N` is the parameter's zero-based position (e.g. `"_0"` for the first parameter). Positional keys resolve regardless of what the ABI names the parameter.

When both a name key and a positional key describe the same parameter, the name key wins.

Positional keys exist because parameter names are not part of a function's interface: `approve(address,uint256)` is the same ERC-20 function whether an implementation names its parameters `spender`/`amount` or `guy`/`wad`. Metadata that must apply across implementations -- interface files above all -- MUST use positional keys. Contract-specific files SHOULD prefer name keys for readability.

Consumers MUST resolve both key forms everywhere parameter metadata is consumed: input rendering, locked-parameter [calldata matching](#matching-calldata-to-actions), [intent template](#intent-templates) placeholders (`{_0}` resolves positionally), and example values.

#### Variant Actions

Multiple actions MAY target the same ABI function with different presets. This is how common user intents like "Revoke Approval" or "Approve Unlimited" become first-class UI entries:

```json
{
  "actions": {
    "approve": {
      "function": "approve",
      "title": "Approve",
      "params": {
        "spender": { "label": "spender", "type": "address" },
        "amount": { "label": "amount" }
      }
    },
    "revoke": {
      "function": "approve",
      "title": "Revoke Approval",
      "intent": "Revoke approval for {spender}",
      "params": {
        "spender": { "label": "spender", "type": "address" },
        "amount": {
          "autofill": { "type": "constant", "value": "0" },
          "hidden": true
        }
      }
    },
    "approve-max": {
      "function": "approve",
      "title": "Approve Unlimited",
      "params": {
        "spender": { "label": "spender", "type": "address" },
        "amount": {
          "autofill": { "type": "constant", "value": "115792089237316195423570985008687907853269984665640564039457584007913129639935" },
          "hidden": true
        }
      }
    }
  }
}
```

Consumers SHOULD render each action as a distinct UI entry. Authors SHOULD keep a base action (no locked parameters) alongside the variants when the generic form is still a sensible user intent, as `approve` is above.

#### Matching Calldata to Actions

Consumers that decode existing transactions (confirmation previews, history views, explorers) SHOULD resolve decoded calldata to the most specific action:

1. **Candidates.** Resolve each action's function reference to a 4-byte selector. Actions whose selector matches the calldata's selector are candidates.
2. **Locked parameters.** A parameter is _locked_ when it sets `hidden` or `disabled` and its `autofill` resolves to a value knowable at matching time. Each locked parameter is an equality constraint against the corresponding decoded argument:

   | Autofill                            | Constraint                                    |
   | ----------------------------------- | --------------------------------------------- |
   | `{ "type": "constant", "value": v }` | argument equals `v`                          |
   | `zero-address`                      | argument equals `0x000...000`                 |
   | `contract-address`                  | argument equals the described contract        |
   | `connected-address`                 | argument equals the transaction sender        |
   | `block-timestamp`                   | none -- MUST NOT be used as a constraint      |

3. **Selection.** Discard candidates with any failed constraint. Of the remainder, select the candidate with the most locked parameters. Break ties by lowest `order`, then by lexicographically smallest action id, so that selection is deterministic across consumers.
4. **Fallback.** If no candidate remains, fall back to an ABI-synthesized default for the function.

A base action with no locked parameters never fails a constraint, so it acts as the natural fallback for calldata that matches no variant's presets. Matching selects a *presentation* -- it is not a security guarantee, and consumers SHOULD still surface the underlying function signature (see Security Considerations).

#### ABI-Synthesized Default Actions

Consumers with access to the ABI SHOULD ensure every ABI function is reachable: for each function that no authored action references, synthesize a default action carrying no metadata beyond what is derivable from the ABI. Synthesized defaults exist per ABI function (per selector), are consumer-internal, and are never referenced by `related` or other authored cross-references.

Once any authored action references a function, no default is synthesized for that function -- the authored actions are its complete representation. Authors who want both curated variants and a plain generic form SHOULD author a base action alongside the variants (as the ERC-20 interface does with `approve` next to `approve-max` and `revoke`). Authors who want a function fully suppressed author a single action for it with `hidden: true`.

#### Parameter Input Flags

Parameters in an action MAY set two input-side flags that control how the input is rendered:

| Field      | Meaning                                                                                               |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| `hidden`   | Do not render an input; inject the `autofill` value at call time. REQUIRES `autofill`.                |
| `disabled` | Render the input but make it non-editable; display the autofilled value. REQUIRES `autofill`.         |

`hidden: true` and `disabled: true` are mutually exclusive, and each requires `autofill` to be present. The schema enforces both rules (`dependentRequired` plus a `not` clause forbidding the combination). The input-side `hidden` is distinct from the display-side `type: "hidden"` semantic type -- one controls whether an input is rendered for writes, the other controls whether a value is rendered in read contexts.

#### Transaction Value

The arguments of a payable call do not fully describe it -- the native currency sent along (`msg.value`) is part of the user's intent too. Actions on payable functions MAY describe it with a `value` object, which supports `label`, `description`, `autofill`, `hidden`, `disabled`, and `validation` with the same semantics as parameters. The value is always denominated in wei and rendered as the `eth` semantic type.

```json
{
  "actions": {
    "deposit": {
      "title": "Wrap ETH",
      "intent": "Wrap {value} into WETH",
      "value": {
        "label": "Amount",
        "description": "The amount of ETH to wrap"
      }
    },
    "mint": {
      "title": "Mint (0.01 ETH)",
      "value": {
        "autofill": { "type": "constant", "value": "10000000000000000" },
        "disabled": true
      }
    }
  }
}
```

Without a `value` object, consumers SHOULD render a generic amount input for payable functions. A locked `value` (hidden or disabled with a resolvable autofill) participates in [calldata matching](#matching-calldata-to-actions) as an equality constraint against the transaction's value. The `{value}` placeholder in intent templates refers to the transaction value when the action declares a `value` object and the ABI declares no parameter named `value`; an ABI parameter of that name takes precedence.

### Semantic Types

The `type` field on a parameter is a semantic annotation that tells consumers what a value _represents_. A `uint256` in the ABI carries no meaning beyond "256-bit unsigned integer." Semantic types bridge that gap -- consumers use them to render appropriate UI for both display (read) and input (write) contexts.

#### String Types

| Type           | Meaning                                                           |
| -------------- | ----------------------------------------------------------------- |
| `eth`          | Raw wei value, displayed as ETH (18 decimals) -- see Amount-like Types |
| `gwei`         | Raw wei value, displayed as gwei (9 decimals)                     |
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

// Token amount denominated in the token given by another parameter
{ "type": "token-amount", "tokenParam": "tokenContract" }

// Generic fixed-point amount (oracle price, share price, accounting unit)
{ "type": "amount", "decimals": 8, "symbol": "USD" }

// Token ID for a specific NFT collection
{ "type": "token-id", "tokenAddress": "0x..." }

// Enum -- display: show label, input: render as select dropdown
{ "type": "enum", "values": { "0": "Pending", "1": "Active" } }

// Slider -- input: render as range slider
{ "type": "slider", "min": "0", "max": "9999", "step": "1" }
```

#### Amount-like Types

`eth`, `gwei`, `token-amount`, and `amount` share one formatting contract -- **display value = raw integer / 10^decimals**, rendered with a symbol. They differ only in where `decimals` and `symbol` come from:

| Type           | decimals                       | symbol                  | asset                    |
| -------------- | ------------------------------ | ----------------------- | ------------------------ |
| `eth`          | 18 (fixed)                     | ETH (fixed)             | native                   |
| `gwei`         | 9 (fixed)                      | gwei (fixed)            | native                   |
| `token-amount` | on-chain `decimals()`          | on-chain `symbol()`     | see token resolution     |
| `amount`       | `decimals` field (default 18)  | optional `symbol` field | none                     |

Use `eth` or `token-amount` when the asset has an identity; use `amount` only for fixed-point numbers with no asset -- oracle outputs, share prices, internal accounting units.

#### Token Resolution

The token a `token-amount` is denominated in resolves in one of three ways:

- **`tokenAddress`** -- a fixed token contract address.
- **`tokenParam`** -- the name (or `_N` positional key) of an `address` parameter in the same action, event, or message whose *value* identifies the token. This covers functions that pair a token parameter with an amount parameter (rescue/sweep functions, routers, vault deposits): `rescueERC20(tokenContract, to, amount)` types `amount` as `{ "type": "token-amount", "tokenParam": "tokenContract" }`.
- **Neither** (including the bare string form) -- the token is the contract this document describes. The same default applies to `token-id`: without a `tokenAddress`, the ID refers to the described contract's tokens. This is what allows shared interface files (ERC-20, ERC-721) to annotate amounts without knowing any deployment's address.

`tokenAddress` and `tokenParam` are mutually exclusive.

Consumers resolve `decimals()` and `symbol()` from the token contract at display time and SHOULD cache the results -- both values are immutable in virtually all deployed tokens. A consumer that cannot resolve the token's decimals (unreachable RPC, pending lookup, non-conforming token) MUST NOT substitute a default; it SHOULD render the raw base-unit value and indicate that the token is unresolved. Guessing decimals displays a wrong number, which is strictly worse than an unformatted one.

#### Unlimited Amounts

An amount-like value equal to 2^256-1 conventionally means "no limit" (unlimited approvals, allowance sentinels). Consumers SHOULD render it as "Unlimited" -- with the resolved symbol where available (e.g. "Unlimited USDC") -- instead of a formatted number.

### Autofill

The `autofill` field specifies a source to pre-populate an input with. It is separate from `type` -- one describes the value, the other controls the default.

#### String Autofill Values

| Value               | Meaning                          |
| ------------------- | -------------------------------- |
| `connected-address` | User's connected wallet address  |
| `contract-address`  | This contract's address          |
| `zero-address`      | The zero address (`0x000...000`) |
| `block-timestamp`   | Current block timestamp          |

An action whose hidden or disabled parameter (or `value`) autofills from `connected-address` cannot be invoked without a connected wallet -- there is no value to inject. Consumers SHOULD omit such actions from the default UI while no wallet is connected (e.g. the ERC-20 interface's `my-balance`), and list them once one is.

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

### Validation Rules

Parameters and the transaction `value` MAY declare a `validation` object constraining user input before submission:

| Field     | Type     | Meaning                                                                  |
| --------- | -------- | ------------------------------------------------------------------------ |
| `min`     | `string` | Minimum accepted value, as a decimal string (strings support the full uint256 range) |
| `max`     | `string` | Maximum accepted value, as a decimal string                              |
| `enum`    | `array`  | Allowed values, each `{ "value": "...", "label": "..." }`; input SHOULD render as a selection |
| `pattern` | `string` | Regular expression the raw input must match                              |
| `message` | `string` | Human-readable error shown when a rule fails                             |

```json
"punkIndex": {
  "label": "punk index",
  "type": "token-id",
  "validation": { "min": "0", "max": "9999", "message": "Punk indices run from 0 to 9999." }
}
```

Validation rules are a UX aid, not a security boundary: they run client-side before submission, and the contract remains the sole authority on what it accepts.

### Groups

Actions MAY be organized into named groups. Group keys follow the same grammar as action identifiers (`^[a-zA-Z_][a-zA-Z0-9_-]*$`). Each group MUST have a `label` and SHOULD have an `order` for display sorting (the schema requires only `label`, matching this SHOULD):

```json
{
  "groups": {
    "marketplace": { "label": "Marketplace", "order": 1 },
    "bidding": { "label": "Bidding", "order": 2 },
    "ownership": { "label": "Ownership", "order": 3 }
  }
}
```

Individual actions, events, errors, and messages MAY also have an `order` field to control display order within their group (or among ungrouped items). Lower numbers appear first. Items without an `order` are sorted after ordered ones.

### Intent Templates

Actions MAY include an `intent` template -- a human-readable sentence rendered with formatted parameter values:

```json
{
  "actions": {
    "composite": {
      "function": "composite",
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
  "$schema": "https://evmnow.github.io/contract-metadata/v1/schema.json",
  "chainId": 1,
  "address": "0x036721e5a769cc48b3189efbb9cce4471e8a48b1",
  "name": "Checks Originals",
  "actions": {
    "mint": { "...": "..." },
    "composite": { "...": "..." }
  }
}
```

Includes support two formats, and each entry MUST match `^(interface:[a-z0-9-]+|https://.+)$`:

- **`interface:` prefix** -- references a named interface file in the `interfaces/` subdirectory relative to the `$schema` URL (e.g. with the canonical `$schema`, `"interface:erc721"` resolves to `https://evmnow.github.io/contract-metadata/v1/interfaces/erc721.json`). These files contain `groups`, `actions`, `events`, `errors`, and `messages`. Interface files MAY ship curated variant actions (e.g. ERC-20 ships `revoke`, `approve-max`, `my-balance`, `my-allowance` alongside the base actions). Because an interface file describes every implementation of the interface, its `params` and `returns` MUST use positional keys (see [Parameter Keys](#parameter-keys)) -- implementations disagree on parameter names.
- **URL** -- fetches the metadata file from the given URL. URL includes MUST use `https:`; consumers MUST reject other schemes. The resolved file can live anywhere and follows the same structure. See Security Considerations for the trust implications of URL includes.

**Namespace rule:** `interface:` names resolve relative to the document's `$schema` host -- `interface:erc721` under one schema host and the same name under another are distinct namespaces and may resolve to different files. Publishers who fork the schema also own their interface namespace.

Multiple includes merge left-to-right. Contract-specific metadata is then applied on top.

Interface files validate against their own schema (`interface.schema.json`, published next to the contract schema -- e.g. `https://evmnow.github.io/contract-metadata/v1/interface.schema.json`) and SHOULD declare it as their `$schema`. Interface files MAY themselves declare `includes` (composing other interface files with the same merge semantics); consumers MUST detect include cycles and reject documents that contain them. Interface files MAY also declare an `interfaceId` -- the 4-byte ERC-165 identifier (e.g. `0x36372b07` for ERC-20, `0x80ac58cd` for ERC-721) -- which consumers MAY use with `supportsInterface()` to auto-select interface metadata for contracts that have no document of their own.

**Dropping unimplemented actions:** an included interface file may describe functions a specific contract does not implement (e.g. `interface:erc721-metadata` on a collection without `tokenURI`). Consumers with access to the ABI MUST drop actions whose resolved function reference does not exist in the contract's ABI -- they are not rendered, and they do not participate in calldata matching.

#### Merge Semantics

The merge is _shallow per top-level key within each section_. When a contract defines an action that also exists in an included interface, the contract's entire action object replaces the interface's. There is no deep merge of `params`, `returns`, or other nested fields. This means if you override an action, you MUST re-declare everything you want to keep (params, returns, types, `group`, etc.) -- an override that omits `group` silently drops the action out of the interface's group in consumer UIs.

```
# Merge order for includes: ["interface:erc20", "interface:erc721"]
1. Start with empty {}
2. Merge erc20.json    -> { actions: { transfer: {from erc20}, approve: {from erc20}, revoke: {from erc20} } }
3. Merge erc721.json   -> { actions: { transfer: {from erc721}, approve: {from erc721}, revoke: {from erc721}, ownerOf: {from erc721} } }
4. Merge contract file -> { actions: { transfer: {from contract}, approve: {from erc721}, revoke: {from erc721}, ownerOf: {from erc721}, mint: {from contract} } }
```

### Discovery

Consumers locate the metadata document for a contract in two ways, in order of preference:

1. **`contractURI()` (primary).** If the contract implements [ERC-7572](./eip-7572.md), consumers SHOULD call `contractURI()` and treat the returned document as this contract's metadata when it validates against this specification's schema. This channel is authoritative -- the contract itself points at its metadata -- and requires no registry.
2. **Repository lookup (secondary).** Publishers MAY serve a directory of documents under a base URL using the canonical layout `{base}/contracts/{chainId}/{address}.json`, with `{address}` lowercase. Consumers derive the URL from the chain ID and the normalized address and fetch it directly; a 404 means the repository has no document for that contract. The reference repository's GitHub Pages deployment (`https://evmnow.github.io/contract-metadata/contracts/{chainId}/{address}.json`) implements this layout.

A consumer MAY consult multiple repositories; documents from different sources describe the same contract and are ranked by the consumer's own trust policy (see Security Considerations).

### Versioning

The `/v1/` path segment in the canonical schema URL is the format's major version, and `$id` in the published schema encodes it. Within a major version, changes are strictly additive -- new optional fields and new semantic types may appear in place, and documents that validated before continue to validate. Breaking changes require a new major version under a new URL (`/v2/`). Consumers encountering a document whose `$schema` names an unknown major version SHOULD fall back to ignoring the document rather than misinterpreting it.

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
        "value": { "label": "amount", "type": "token-amount" },
        "nonce": { "label": "nonce" },
        "deadline": { "label": "deadline", "type": "timestamp" }
      }
    }
  }
}
```

Messages are keyed by EIP-712 primary type name and MUST be defined on the contract that verifies them. Each message supports the same enrichment as actions: `title`, `description`, `warning`, `intent`, and `fields` with the same parameter metadata (label, description, type).

### Extensions

Publishers MAY use custom extension objects on the root document, actions, events, errors, messages, and parameters. Extension names MUST start with an `_` character followed by a letter. Consumers that do not understand a given extension MUST ignore it.

```json
{
  "actions": {
    "colors": {
      "function": "colors",
      "title": "Check Colors",
      "description": "Get the colors of a given Check.",
      "params": {
        "tokenId": { "label": "Check", "type": "token-id" }
      },
      "_component": {
        "type": "color-map",
        "props": { "columns": 8 }
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

Deep merging creates ambiguity about which nested fields take precedence and makes it difficult to reason about the final result. Shallow merge per action key is predictable: if you override an action, you own the entire definition. This mirrors how interface implementation works in most programming languages.

### Why three key formats (name, signature, selector)?

Bare names are the common case and the most readable. Signatures are needed for overloaded functions. Selectors are needed for unverified contracts where no ABI is available. Supporting all three covers the full spectrum of real-world contracts.

### Why decouple actions from ABI functions?

Keying metadata directly by ABI name creates a 1:1 coupling that cannot express common user intents. "Revoke Approval" is conceptually distinct from "Approve" in the user's mental model, but both compile down to the same `approve(address,uint256)` call with different arguments. Decoupling actions from ABI functions lets publishers express these intents as first-class UI entries with their own title, warning, intent template, and locked parameter values -- while still resolving to the correct ABI function at call time. It also unlocks calldata-to-action matching for transaction previews.

### Why describe `msg.value`?

A payable call is not fully described by its arguments -- `WETH.deposit()` takes no parameters at all, yet the single most important fact about it is how much ETH is attached. Without a `value` object, the best a publisher can do is warn about it in prose, which no wallet can render as an input or verify in a preview. Treating transaction value like a parameter (same label/autofill/lock semantics) closes that gap with no new concepts.

### Relationship to ERC-7730

[ERC-7730](./eip-7730.md) also attaches human-readable descriptions to contract calls, but the two standards target different problems. ERC-7730 is **clear-signing metadata**: its unit of description is a single function or EIP-712 message, its output is a line-by-line rendering of one payload on a hardware wallet's constrained display, and its trust model is a curated registry vetted by wallet vendors. This specification is **interaction UX metadata**: it describes the whole contract as a product surface -- contract-level context (about, risks, links, theme), action variants decoupled from the ABI (`revoke` vs `approve`), input construction (autofill, validation, locked parameters, semantic input widgets), grouping and navigation, and event/error enrichment. ERC-7730 has no concept of authoring a *new* UI entry for an existing function or of collecting user input; this specification does not attempt to define byte-exact display rules for signing devices.

The two are complementary rather than competing: a wallet can build its interaction UI from a contract-metadata document and still render the final signing screen from ERC-7730 metadata for the resolved calldata. A publisher can mechanically derive a large part of an ERC-7730 descriptor (function labels, parameter labels, amount formats) from a contract-metadata document, while the reverse loses all interaction-level structure.

### Future Work

Document authenticity via cryptographic signing (an embedded or detached signature over the document) is deliberately deferred; consumers today anchor trust in the transport channel and source (see Security Considerations). Multi-locale distribution of the same document is likewise deferred to a future extension (see [Localization](#localization)).

## Backwards Compatibility

This EIP introduces a new metadata format and does not modify any existing standards. It is fully complementary to ABIs, NatSpec, ERC-7572, and ERC-7730.

Contract-level fields (`name`, `symbol`, `description`, `image`, `banner_image`, `featured_image`, `external_link`, `collaborators`) are placed at the top level to maintain backwards compatibility with [ERC-7572](./eip-7572.md). The compatibility is directional: **every valid contract-metadata document is a valid ERC-7572 `contractURI()` payload, but not conversely.** Existing consumers that understand only ERC-7572 will read the fields they recognize and ignore the rest; in the other direction, many existing `contractURI()` documents are not valid contract-metadata documents -- most commonly because this specification caps `description` at 120 characters (see [Description Length](#description-length)) while ERC-7572 imposes no limit. Publishers migrating an ERC-7572 document move long-form text into `about`.

## Reference Implementation

The reference implementation -- the JSON Schemas (`contract-metadata.schema.json`, `interface.schema.json`), the reusable interface files (ERC-20, ERC-721 core/metadata/enumerable), example documents, and a schema-plus-semantics validation script -- is provided in this EIP's assets directory (per EIP-1, reference implementations belong in `../assets/`, not behind external links). A maintained copy, together with the published repository of metadata documents, lives in the `evmnow/contract-metadata` repository and is served at the canonical URLs given in [Discovery](#discovery).

## Security Considerations

### Metadata Integrity

Contract metadata is an off-chain resource. Consumers MUST NOT trust metadata blindly -- it could be outdated, incorrect, or malicious. Metadata SHOULD be served from authenticated sources (TLS, content-addressed storage, or a repository whose review process the consumer trusts), and consumers SHOULD rank sources by their own trust policy. In-document authenticity signatures are deferred to future work (see Rationale).

### URL Includes

The `includes` mechanism can pull metadata from arbitrary `https:` URLs, which widens the trust surface of an otherwise trusted document:

- URL includes MUST use `https:`; consumers MUST reject `http:` and every other scheme.
- Fetching includes server-side turns a metadata consumer into a URL fetcher: implementers MUST treat include URLs as untrusted input and guard against SSRF (deny link-local, private-range, and internal hostnames; cap redirects, response sizes, and timeouts).
- A compromised or repointed include URL silently rewrites the presentation of a trusted contract -- the containing document is unchanged, yet its merged actions, warnings, and labels can change arbitrarily. Consumers SHOULD pin content hashes for URL includes or restrict include origins to an allowlist, and SHOULD re-validate the merged result, not just the outer document.
- Include resolution MUST enforce cycle detection and a recursion depth limit.

### Misleading Labels

A malicious metadata author could assign misleading labels or descriptions to functions (e.g. labeling a `transferFrom` as "Check Balance"). Consumers SHOULD display the underlying ABI function signature alongside any metadata-provided labels to allow users to verify.

### Intent Template Injection

Intent templates use `{paramName}` interpolation. Consumers MUST sanitize rendered intent strings to prevent injection attacks (e.g. XSS in web-based wallets). Parameter values MUST be treated as untrusted input during rendering.

### Extension Safety

Extensions are opaque to consumers that do not understand them. Consumers MUST ignore unknown extensions rather than attempting to interpret them. Extension authors SHOULD document their extensions and avoid storing sensitive data in extension fields.

## Copyright

Copyright and related rights waived via [CC0](../LICENSE.md).
