# Shenbury TRC-404 Smart Contract

## Overview

The Shenbury TRC-404 smart contract implements a hybrid token standard that combines TRC-20 (fungible tokens) and TRC-721 (NFTs) for fractional ownership of Chinese imperial ceramics on the Tron blockchain.

## Key Features

- **TRC-404 Standard**: 10,000 SHEN tokens = 1 NFT
- **Auction System**: Traditional bidding for full NFT ownership
- **Fractional Ownership**: Buy SHEN tokens for partial ownership
- **Artifact Metadata**: Complete provenance and details stored on-chain
- **IPFS Integration**: Extended metadata and images stored on IPFS
- **Dynasty Categories**: Song, Yuan, and Ming classifications

## Contract Architecture

```
contracts/tron/
├── ShenburyTRC404.sol      # Main TRC-404 implementation
├── interfaces/
│   ├── ITRC20.sol          # TRC-20 interface
│   ├── ITRC721.sol         # TRC-721 interface
│   ├── ITRC721Receiver.sol # NFT receiver interface
│   └── ITRC721Metadata.sol # NFT metadata interface
└── utils/
    ├── Ownable.sol         # Access control
    └── Strings.sol         # String utilities
```

## Deployment

### Prerequisites

1. Install dependencies:
```bash
npm install tronweb
npm install -g tronbox  # For contract compilation
```

2. Set environment variables:
```bash
export TRON_PRIVATE_KEY="your_private_key"
export TRON_NETWORK="nile"  # or "mainnet"
export TRON_API_KEY="your_trongrid_api_key"  # Optional but recommended
```

### Compile Contract

Using TronBox:
```bash
tronbox compile
```

### Deploy Contract

```bash
node scripts/deploy-tron.js
```

### Network Configuration

**Mainnet:**
- Full Node: https://api.trongrid.io
- Event Server: https://api.trongrid.io

**Nile Testnet:**
- Full Node: https://nile.trongrid.io
- Event Server: https://nile.trongrid.io
- Faucet: https://nileex.io/faucet

**Shasta Testnet:**
- Full Node: https://api.shasta.trongrid.io
- Event Server: https://api.shasta.trongrid.io

## Contract Functions

### Admin Functions

```solidity
// Add new artifact to the platform
function addArtifact(
    string memory _lotNumber,
    string memory _title,
    string memory _titleChinese,
    string memory _dynasty,
    string memory _dynastyInfo,
    uint256 _estimateLow,
    uint256 _estimateHigh,
    uint256 _minBidIncrement,
    uint256 _duration,
    uint256 _fractionalAvailable,
    string memory _ipfsHash,
    Dynasty _dynastyEnum
) external onlyOwner returns (uint256)

// Add extended details for an artifact
function addArtifactDetails(
    uint256 artifactId,
    string memory _provenance,
    string memory _condition,
    string memory _dimensions,
    string memory _literature,
    string memory _technicalNotes,
    string memory _culturalSignificance,
    string memory _imageOrientation
) external onlyOwner
```

### User Functions

```solidity
// Place bid on artifact (full ownership)
function placeBid(uint256 artifactId) external payable

// Buy fractional tokens
function buyTokens(uint256 artifactId, uint256 tokenAmount) external payable

// End auction and mint NFT to winner
function endAuction(uint256 artifactId) external
```

### TRC-20 Functions

```solidity
function transfer(address to, uint256 amount) public returns (bool)
function approve(address spender, uint256 amount) public returns (bool)
function transferFrom(address from, address to, uint256 amount) public returns (bool)
function balanceOf(address account) public view returns (uint256)
```

### TRC-721 Functions

```solidity
function safeTransferFrom(address from, address to, uint256 tokenId) public
function approveNFT(address to, uint256 tokenId) public
function ownerOf(uint256 tokenId) public view returns (address)
function tokenURI(uint256 tokenId) public view returns (string memory)
```

## Gas Optimization

The contract is optimized for Tron's energy and bandwidth model:

1. **Batch Operations**: Add multiple artifacts in one transaction
2. **Storage Optimization**: Uses mappings efficiently
3. **Event Usage**: Minimal events for critical actions only
4. **String Storage**: IPFS hashes for extended metadata

## Security Considerations

1. **Reentrancy Protection**: State changes before external calls
2. **Integer Overflow**: Solidity 0.8+ built-in protection
3. **Access Control**: Owner-only functions for admin operations
4. **Whitelist System**: Prevent DEX routers from triggering NFT mints
5. **Payment Validation**: Strict checks for bid amounts and token purchases

## Testing

Run tests using TronBox:
```bash
tronbox test
```

## Interacting with the Contract

### Using TronWeb

```javascript
const TronWeb = require('tronweb');

const tronWeb = new TronWeb({
    fullHost: 'https://nile.trongrid.io',
    privateKey: 'your_private_key'
});

// Get contract instance
const contract = await tronWeb.contract().at('TContractAddress...');

// Place a bid
await contract.placeBid(1).send({
    callValue: tronWeb.toSun(1000000), // 1M TRX
    feeLimit: 100_000_000
});

// Buy tokens
await contract.buyTokens(1, '1000000000000000000000').send({
    callValue: tronWeb.toSun(100000), // 100k TRX for 1000 SHEN
    feeLimit: 100_000_000
});
```

## IPFS Metadata Structure

Each artifact's IPFS hash should point to a JSON file with:

```json
{
    "name": "Northern Song Ru Kiln Sunflower Washer",
    "description": "Exceptionally rare washer representing the pinnacle of Song ceramic achievement",
    "image": "ipfs://QmXXX...",
    "attributes": [
        {
            "trait_type": "Dynasty",
            "value": "Song"
        },
        {
            "trait_type": "Period",
            "value": "1086-1106"
        },
        {
            "trait_type": "Kiln",
            "value": "Ru Official Kiln"
        }
    ],
    "additional_images": [
        "ipfs://QmXXX...",
        "ipfs://QmYYY..."
    ]
}
```

## License

MIT License - See LICENSE file for details
