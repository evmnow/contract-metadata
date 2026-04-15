# `_component` Extension

Register a custom UI component on any extensible metadata object (actions, events, errors, messages, parameters, or contract metadata).

## Shape

The extension accepts either a string (component type only) or an object (component type with props):

```json
"_component": "<component-type>"
```

```json
"_component": {
  "type": "<component-type>",
  "props": { ... }
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `type` | Yes | Component type identifier (e.g. `"sha256-content-prover"`, `"color-picker"`) |
| `props` | No | Component-specific configuration passed to the component at runtime |

Consumers that do not recognize the `type` value SHOULD ignore the extension entirely.

## Examples

### String shorthand

When no configuration is needed, use the string form:

```json
{
  "actions": {
    "composite": {
      "title": "Composite",
      "description": "Burn two Checks of the same tier to create one of the next tier.",
      "_component": "checks-composite-preview"
    }
  }
}
```

### Object form with props

A content prover component that verifies a hash stored onchain against a known source file:

```json
{
  "actions": {
    "imageHash": {
      "title": "Image Hash",
      "description": "SHA-256 hash of the composite image containing all 10,000 punks.",
      "stateMutability": "view",
      "_component": {
        "type": "sha256-content-prover",
        "props": {
          "sourceUrl": "https://raw.githubusercontent.com/larvalabs/cryptopunks/master/punks.png",
          "contentLabel": "Canonical image file",
          "contentType": "image",
          "links": [
            { "label": "View source on GitHub", "url": "https://github.com/larvalabs/cryptopunks/blob/master/punks.png" },
            { "label": "Learn why this hash matters", "url": "https://punks.vv.xyz/the-art/the-punk-image" }
          ]
        }
      }
    }
  }
}
```

### Custom component on a parameter

```json
{
  "actions": {
    "setColor": {
      "title": "Set Color",
      "params": {
        "color": {
          "label": "Color",
          "_component": "color-picker"
        }
      }
    }
  }
}
```
