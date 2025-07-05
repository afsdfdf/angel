# Token Logos

This directory contains SVG and PNG logos for cryptocurrencies used in the Angel Crypto App.

## Available Tokens

- BNB (Binance Coin)
- USDT (Tether)
- BUSD (Binance USD)
- USDC (USD Coin)
- BTCB (Bitcoin BEP20)
- ETH (Ethereum)
- ANGEL (Angel Token)

## Usage

The logos are used by the `TokenLogo` component, which will try to load the SVG version first, then fall back to PNG, and finally use an emoji if neither is available.

## Adding New Logos

To add a new token logo:

1. Create an SVG or PNG file with the lowercase token symbol as the filename (e.g., `btc.svg` or `btc.png`)
2. Place it in this directory
3. Update the `getFallbackEmoji` function in the `TokenLogo` component if you want to add a specific emoji fallback

## Downloading Logos

If you have access to a machine with unrestricted internet access, you can use the `scripts/download-logos.js` script to download logos from various sources:

```bash
node scripts/download-logos.js
```

Then copy the downloaded logos to this directory. 