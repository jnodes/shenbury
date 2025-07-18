cat > contracts/README.md << 'EOF'
# Shenbury Smart Contracts

Shenbury supports multiple blockchain platforms:

## Ethereum Contracts (ERC-404)
- **Path**: `ethereum/` (to be added)
- **Functionality**: ERC-404 fractional NFT ownership
- **Network**: Ethereum Mainnet/Sepolia
- **Integration**: MetaMask via ethers.js

## Coreum Contracts (CosmWasm)
- **Path**: `coreum/`
- **Functionality**: Fractionalized NFT ownership with vesting
- **Network**: Coreum Mainnet/Testnet
- **Integration**: Keplr wallet via CosmJS

## CosmWasm Test Contract
- **Path**: `cosmwasm/`
- **Functionality**: Basic counter contract for testing
- **Purpose**: Development and testing

## Deployment

### Coreum Deployment
```bash
cd contracts/coreum
cargo build --target wasm32-unknown-unknown --release
cat > contracts/README.md << 'EOF'
cat > contracts/README.md << 'EOF'
# Shenbury Smart Contracts

Shenbury supports multiple blockchain platforms:

## Ethereum Contracts (ERC-404)
- **Path**: `ethereum/` (to be added)
- **Functionality**: ERC-404 fractional NFT ownership
- **Network**: Ethereum Mainnet/Sepolia
- **Integration**: MetaMask via ethers.js

## Coreum Contracts (CosmWasm)
- **Path**: `coreum/`
- **Functionality**: Fractionalized NFT ownership with vesting
- **Network**: Coreum Mainnet/Testnet
- **Integration**: Keplr wallet via CosmJS

## CosmWasm Test Contract
- **Path**: `cosmwasm/`
- **Functionality**: Basic counter contract for testing
- **Purpose**: Development and testing

## Deployment

### Coreum Deployment
```bash
