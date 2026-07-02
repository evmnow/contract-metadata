# Contract Metadata

Human-readable context and clear-signing metadata for smart contracts.

Contract Metadata is a JSON standard that layers human-readable context on top of onchain data. It enriches smart contracts at every level -- contract descriptions, clear-signing intents, ordered display fields, input guidance, and event/error enrichment -- giving wallets, explorers, and dApps the information they need to present contract interactions in terms users understand.

The draft now treats ERC-7730-style clear-signing primitives as a native subset: canonical named ABI fragments, `intent`, `interpolatedIntent`, ordered `fields`, path roots (`#`, `$`, `@`), display `format`s, reusable `metadata`/`display` definitions, and EIP-712 binding context.

**[Read the full specification](./eip-draft.md)**

## Quick Example

A CryptoPunks function with no metadata vs. with Contract Metadata:

```
offerPunkForSaleToAddress(uint256, uint256, address)
```

```json
{
  "$schema": "https://1001-digital.github.io/contract-metadata/v1/schema.json",
  "chainId": 1,
  "address": "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb",
  "functions": {
    "offerPunkForSaleToAddress(uint256 punkIndex,uint256 minSalePriceInWei,address toAddress)": {
      "title": "List Punk for Sale (Private)",
      "description": "List a punk for sale to a specific address only.",
      "warning": "This creates a binding offer. The buyer can purchase at any time.",
      "intent": "List Punk for Sale",
      "interpolatedIntent": "List Punk #{punkIndex} for sale at {minSalePriceInWei} to {toAddress}",
      "fields": [
        {
          "path": "punkIndex",
          "label": "Punk",
          "format": "nftName",
          "params": {
            "collection": "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb"
          }
        },
        { "path": "minSalePriceInWei", "label": "Price", "format": "amount" },
        { "path": "toAddress", "label": "Buyer", "format": "addressName" }
      ]
    }
  }
}
```

## Repository Structure

```
contracts/       Example metadata files for deployed contracts
schema/          JSON Schema definitions and shared interfaces
extensions/      Well-known extension conventions
validate.ts      Schema + semantic validation script
eip-draft.md     Full EIP specification
```

## Standard Includes

Reusable interface metadata lives under `schema/interfaces/` and can be pulled into a contract with `includes`.

```json
{
  "includes": [
    "interface:erc20",
    "interface:erc20-permit"
  ]
}
```

Use `interface:erc20` for standard ERC-20 function and event metadata. Add `interface:erc20-permit` only for tokens that implement EIP-2612 Permit; Permit is an optional EIP-712 signing flow, not part of base ERC-20.

## Validation

```bash
npm install
npm run validate
```

## Contributing

1. Create a file in `contracts/` named `{lowercase-address}.json`
2. Follow the schema at `schema/contract-metadata.schema.json`
3. Include at minimum: `$schema`, `chainId`, `address`, and `name`
4. Run `npm run validate` to check your file

## Extensions

The metadata standard supports custom extensions (keys starting with `_`) on all renderable objects. The following well-known extensions are documented:

- [`_component`](./extensions/_component.md) — Register a custom UI component on a function, event, parameter, or other metadata object.

## Authors

- YGG ([@yougogirldoteth](https://github.com/yougogirldoteth))
- Jalil Sebastian Wahdatehagh ([@jwahdatehagh](https://github.com/jwahdatehagh))

## License

Copyright and related rights waived via [CC0](./LICENSE).
