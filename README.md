# Contract Metadata

Human-readable context for smart contracts.

Contract Metadata is a JSON standard that layers human-readable context on top of onchain data. It enriches smart contracts at every level -- contract descriptions, action titles and warnings, semantic type annotations, input guidance, and event/error enrichment -- giving wallets, explorers, and dApps the information they need to present contract interactions in terms users understand.

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
  "actions": {
    "offerPunkForSaleToAddress": {
      "title": "List Punk for Sale (Private)",
      "description": "List a punk for sale to a specific address only.",
      "warning": "This creates a binding offer. The buyer can purchase at any time.",
      "intent": "List Punk #{punkIndex} for sale at {minSalePriceInWei} to {toAddress}",
      "params": {
        "punkIndex": { "label": "Punk", "type": "token-id" },
        "minSalePriceInWei": { "label": "Price", "type": "eth" },
        "toAddress": { "label": "Buyer", "type": "address" }
      }
    }
  }
}
```

Actions decouple the user-facing UX surface from the ABI. One ABI function can back multiple actions (variants). For example, a single `approve` function can surface as `approve` (normal), `approve-max` (unlimited, amount locked), and `revoke` (amount locked to 0) — each with its own title, intent, and warning.

## Repository Structure

```
contracts/       Example metadata files for deployed contracts
schema/          JSON Schema definitions and shared interfaces
extensions/      Well-known extension conventions
validate.ts      Schema + semantic validation script
eip-draft.md     Full EIP specification
```

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
