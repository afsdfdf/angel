// This script is meant to be run manually on a machine with internet access
// After downloading the logos, copy them to the project's public/tokens directory

const fs = require('fs');
const path = require('path');
const https = require('https');

const tokenLogos = [
  {
    symbol: 'bnb',
    url: 'https://assets.coingecko.com/coins/images/825/large/binance-coin-logo.png',
    altUrl: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png'
  },
  {
    symbol: 'usdt',
    url: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
    altUrl: 'https://cryptologos.cc/logos/tether-usdt-logo.png'
  },
  {
    symbol: 'busd',
    url: 'https://assets.coingecko.com/coins/images/9576/large/BUSD.png',
    altUrl: 'https://cryptologos.cc/logos/binance-usd-busd-logo.png'
  },
  {
    symbol: 'usdc',
    url: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png',
    altUrl: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
  },
  {
    symbol: 'btcb',
    url: 'https://assets.coingecko.com/coins/images/14108/large/Binance-bitcoin.png',
    altUrl: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png'
  },
  {
    symbol: 'eth',
    url: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    altUrl: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
  },
  {
    symbol: 'angel',
    // Since Angel is a custom token, we'll create it manually
    url: null,
    altUrl: null
  }
];

// Create the download directory if it doesn't exist
const downloadDir = path.join(__dirname, 'downloaded_logos');
if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir);
}

// Function to download a file
function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${filePath}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}); // Delete the file if there was an error
      reject(err);
    });
  });
}

// Download each token logo
async function downloadLogos() {
  for (const token of tokenLogos) {
    if (!token.url) continue;
    
    const filePath = path.join(downloadDir, `${token.symbol}.png`);
    
    try {
      await downloadFile(token.url, filePath);
    } catch (error) {
      console.error(`Error downloading ${token.symbol} from primary URL:`, error.message);
      
      if (token.altUrl) {
        try {
          console.log(`Trying alternative URL for ${token.symbol}...`);
          await downloadFile(token.altUrl, filePath);
        } catch (altError) {
          console.error(`Error downloading ${token.symbol} from alternative URL:`, altError.message);
        }
      }
    }
  }
}

// Create a custom Angel token logo (purple with angel emoji)
function createAngelLogo() {
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <circle cx="16" cy="16" r="15" fill="#8A2BE2"/>
  <path fill="#FFFFFF" d="M16 6c-1.1 0-2 0.9-2 2s0.9 2 2 2 2-0.9 2-2-0.9-2-2-2zm-6 10c0 3.3 2.7 6 6 6s6-2.7 6-6c0-1.8-0.8-3.4-2-4.5v-1.5c0-0.3-0.2-0.5-0.5-0.5h-7c-0.3 0-0.5 0.2-0.5 0.5v1.5c-1.2 1.1-2 2.7-2 4.5zm10.5-3h-9c-0.3 0-0.5 0.2-0.5 0.5s0.2 0.5 0.5 0.5h9c0.3 0 0.5-0.2 0.5-0.5s-0.2-0.5-0.5-0.5zm-4.5 7c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4zm0-6c-1.1 0-2 0.9-2 2s0.9 2 2 2 2-0.9 2-2-0.9-2-2-2zm0 12c3.9 0 7-3.1 7-7 0-0.3-0.2-0.5-0.5-0.5s-0.5 0.2-0.5 0.5c0 3.3-2.7 6-6 6s-6-2.7-6-6c0-0.3-0.2-0.5-0.5-0.5s-0.5 0.2-0.5 0.5c0 3.9 3.1 7 7 7z"/>
</svg>`;
  
  const filePath = path.join(downloadDir, 'angel.svg');
  fs.writeFileSync(filePath, svgContent);
  console.log(`Created: ${filePath}`);
}

// Run the download process
downloadLogos()
  .then(() => {
    createAngelLogo();
    console.log('All downloads completed or attempted.');
    console.log(`Please copy the files from ${downloadDir} to your project's public/tokens directory.`);
  })
  .catch((err) => {
    console.error('An error occurred:', err);
  }); 