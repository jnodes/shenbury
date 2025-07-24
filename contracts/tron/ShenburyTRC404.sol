// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ShenburyTRC404
 * @dev Implementation of TRC404 for Shenbury - Chinese Imperial Ceramics
 * Combines TRC20 and TRC721 for fractional NFT ownership on Tron blockchain
 */
contract ShenburyTRC404 {
    // Token metadata
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;
    
    // TRC20 mappings
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    
    // TRC721 mappings
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _ownedTokensCount;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;
    
    // TRC404 specific
    uint256 public constant TOKENS_PER_NFT = 10000; // 10,000 SHEN tokens = 1 NFT
    uint256 public constant TOKEN_PRICE = 100 * 10**6; // 100 USDT (6 decimals on Tron)
    uint256 private _currentTokenId;
    string private _baseTokenURI;
    
    // Owner
    address public owner;
    
    // Whitelist for exchanges/routers to prevent NFT minting
    mapping(address => bool) public whitelist;
    
    // Relic/Artifact metadata structure
    struct Artifact {
        uint256 id;
        string lotNumber;
        string title;
        string titleChinese;
        string dynasty;
        string dynastyInfo;
        uint256 estimateLow;
        uint256 estimateHigh;
        uint256 currentBid;
        uint256 minBidIncrement;
        uint256 bidCount;
        uint256 endTime;
        uint256 fractionalAvailable;
        uint256 tokenHolders;
        string ipfsHash; // IPFS hash for full metadata
        bool active;
    }
    
    // Extended metadata for detailed artifact information
    struct ArtifactDetails {
        string provenance;
        string condition;
        string dimensions;
        string literature;
        string technicalNotes;
        string culturalSignificance;
        string imageOrientation; // portrait, landscape, square
    }
    
    // Auction data
    mapping(uint256 => Artifact) public artifacts;
    mapping(uint256 => ArtifactDetails) public artifactDetails;
    mapping(uint256 => mapping(address => uint256)) public artifactBalances;
    mapping(uint256 => address) public highestBidder;
    mapping(uint256 => uint256) public highestBid;
    
    // Dynasty categories
    enum Dynasty { SONG, YUAN, MING }
    mapping(uint256 => Dynasty) public artifactDynasty;
    
    // NFT to artifact mapping
    mapping(uint256 => uint256) public nftToArtifact;
    
    uint256 public artifactCount;
    
    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event TransferNFT(address indexed from, address indexed to, uint256 indexed tokenId);
    event ApprovalNFT(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    event WhitelistUpdated(address indexed account, bool whitelisted);
    event ArtifactAdded(uint256 indexed artifactId, string lotNumber, string title);
    event BidPlaced(uint256 indexed artifactId, address indexed bidder, uint256 amount);
    event TokensPurchased(uint256 indexed artifactId, address indexed buyer, uint256 amount);
    event AuctionEnded(uint256 indexed artifactId, address winner, uint256 amount);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    constructor(
        string memory _name,
        string memory _symbol,
        string memory _uri
    ) {
        name = _name;
        symbol = _symbol;
        decimals = 18;
        totalSupply = 1000000 * 10**18; // 1 million SHEN tokens
        _baseTokenURI = _uri;
        owner = msg.sender;
        _balances[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }
    
    // Add artifact to the platform with extended metadata
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
    ) external onlyOwner returns (uint256) {
        artifactCount++;
        
        artifacts[artifactCount] = Artifact({
            id: artifactCount,
            lotNumber: _lotNumber,
            title: _title,
            titleChinese: _titleChinese,
            dynasty: _dynasty,
            dynastyInfo: _dynastyInfo,
            estimateLow: _estimateLow,
            estimateHigh: _estimateHigh,
            currentBid: 0,
            minBidIncrement: _minBidIncrement,
            bidCount: 0,
            endTime: block.timestamp + _duration,
            fractionalAvailable: _fractionalAvailable,
            tokenHolders: 0,
            ipfsHash: _ipfsHash,
            active: true
        });
        
        artifactDynasty[artifactCount] = _dynastyEnum;
        
        emit ArtifactAdded(artifactCount, _lotNumber, _title);
        return artifactCount;
    }
    
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
    ) external onlyOwner {
        require(artifactId > 0 && artifactId <= artifactCount, "Invalid artifact");
        
        artifactDetails[artifactId] = ArtifactDetails({
            provenance: _provenance,
            condition: _condition,
            dimensions: _dimensions,
            literature: _literature,
            technicalNotes: _technicalNotes,
            culturalSignificance: _culturalSignificance,
            imageOrientation: _imageOrientation
        });
    }
    
    // Place bid on artifact
    function placeBid(uint256 artifactId) external payable {
        Artifact storage artifact = artifacts[artifactId];
        require(artifact.active, "Artifact not active");
        require(block.timestamp < artifact.endTime, "Auction ended");
        require(msg.value >= artifact.currentBid + artifact.minBidIncrement, "Bid too low");
        
        // Refund previous highest bidder
        if (highestBidder[artifactId] != address(0)) {
            payable(highestBidder[artifactId]).transfer(highestBid[artifactId]);
        }
        
        highestBidder[artifactId] = msg.sender;
        highestBid[artifactId] = msg.value;
        artifact.currentBid = msg.value;
        artifact.bidCount++;
        
        emit BidPlaced(artifactId, msg.sender, msg.value);
    }
    
    // Buy fractional tokens for an artifact
    function buyTokens(uint256 artifactId, uint256 tokenAmount) external payable {
        Artifact storage artifact = artifacts[artifactId];
        require(artifact.active, "Artifact not active");
        require(tokenAmount > 0 && tokenAmount <= artifact.fractionalAvailable, "Invalid token amount");
        
        uint256 totalCost = (tokenAmount * TOKEN_PRICE) / 10**decimals;
        require(msg.value >= totalCost, "Insufficient payment");
        
        // Transfer SHEN tokens to buyer
        _transfer(owner, msg.sender, tokenAmount);
        
        // Update artifact data
        artifact.fractionalAvailable -= tokenAmount;
        uint256 previousBalance = artifactBalances[artifactId][msg.sender];
        artifactBalances[artifactId][msg.sender] += tokenAmount;
        
        // Update token holders count if new holder
        if (previousBalance == 0) {
            artifact.tokenHolders++;
        }
        
        // Check if user has enough for full NFT
        if (artifactBalances[artifactId][msg.sender] >= TOKENS_PER_NFT) {
            uint256 nftCount = artifactBalances[artifactId][msg.sender] / TOKENS_PER_NFT;
            for (uint256 i = 0; i < nftCount; i++) {
                _mintNFT(msg.sender, artifactId);
                artifactBalances[artifactId][msg.sender] -= TOKENS_PER_NFT;
            }
        }
        
        // Refund excess TRX
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }
        
        emit TokensPurchased(artifactId, msg.sender, tokenAmount);
    }
    
    // End auction and transfer NFT to winner
    function endAuction(uint256 artifactId) external {
        Artifact storage artifact = artifacts[artifactId];
        require(artifact.active, "Artifact not active");
        require(block.timestamp >= artifact.endTime, "Auction not ended");
        
        artifact.active = false;
        
        if (highestBidder[artifactId] != address(0)) {
            // Mint NFT to winner
            _mintNFT(highestBidder[artifactId], artifactId);
            emit AuctionEnded(artifactId, highestBidder[artifactId], highestBid[artifactId]);
        }
    }
    
    // TRC20 Functions
    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }
    
    function transfer(address to, uint256 amount) public returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }
    
    function allowance(address owner_, address spender) public view returns (uint256) {
        return _allowances[owner_][spender];
    }
    
    function approve(address spender, uint256 amount) public returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        require(_allowances[from][msg.sender] >= amount, "Allowance exceeded");
        _allowances[from][msg.sender] -= amount;
        _transfer(from, to, amount);
        return true;
    }
    
    // TRC721 Functions
    function ownerOf(uint256 tokenId) public view returns (address) {
        address tokenOwner = _owners[tokenId];
        require(tokenOwner != address(0), "Token does not exist");
        return tokenOwner;
    }
    
    function tokenURI(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        uint256 artifactId = nftToArtifact[tokenId];
        return string(abi.encodePacked(_baseTokenURI, "/", toString(artifactId), "/", toString(tokenId)));
    }
    
    function safeTransferFrom(address from, address to, uint256 tokenId) public {
        safeTransferFrom(from, to, tokenId, "");
    }
    
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not approved");
        _safeTransfer(from, to, tokenId, data);
    }
    
    function transferNFT(address from, address to, uint256 tokenId) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not approved");
        _transferNFT(from, to, tokenId);
    }
    
    function approveNFT(address to, uint256 tokenId) public {
        address tokenOwner = ownerOf(tokenId);
        require(to != tokenOwner, "Cannot approve to self");
        require(msg.sender == tokenOwner || isApprovedForAll(tokenOwner, msg.sender), "Not authorized");
        _tokenApprovals[tokenId] = to;
        emit ApprovalNFT(tokenOwner, to, tokenId);
    }
    
    function getApproved(uint256 tokenId) public view returns (address) {
        require(_exists(tokenId), "Token does not exist");
        return _tokenApprovals[tokenId];
    }
    
    function setApprovalForAll(address operator, bool approved) public {
        require(operator != msg.sender, "Cannot approve to self");
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }
    
    function isApprovedForAll(address owner_, address operator) public view returns (bool) {
        return _operatorApprovals[owner_][operator];
    }
    
    // Whitelist management
    function setWhitelist(address account, bool whitelisted) external onlyOwner {
        whitelist[account] = whitelisted;
        emit WhitelistUpdated(account, whitelisted);
    }
    
    // Internal functions
    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0), "Transfer from zero");
        require(to != address(0), "Transfer to zero");
        require(_balances[from] >= amount, "Insufficient balance");
        
        _balances[from] -= amount;
        _balances[to] += amount;
        
        emit Transfer(from, to, amount);
        
        // Handle NFT minting/burning if not whitelisted
        if (!whitelist[from] && !whitelist[to]) {
            _updateNFTBalances(from, to);
        }
    }
    
    function _approve(address owner_, address spender, uint256 amount) internal {
        require(owner_ != address(0), "Approve from zero");
        require(spender != address(0), "Approve to zero");
        _allowances[owner_][spender] = amount;
        emit Approval(owner_, spender, amount);
    }
    
    function _mintNFT(address to, uint256 artifactId) internal returns (uint256) {
        _currentTokenId++;
        uint256 tokenId = _currentTokenId;
        
        _owners[tokenId] = to;
        _ownedTokensCount[to]++;
        nftToArtifact[tokenId] = artifactId;
        
        emit TransferNFT(address(0), to, tokenId);
        
        return tokenId;
    }
    
    function _transferNFT(address from, address to, uint256 tokenId) internal {
        require(ownerOf(tokenId) == from, "Not token owner");
        require(to != address(0), "Transfer to zero");
        
        // Clear approvals
        _tokenApprovals[tokenId] = address(0);
        
        _ownedTokensCount[from]--;
        _ownedTokensCount[to]++;
        _owners[tokenId] = to;
        
        emit TransferNFT(from, to, tokenId);
    }
    
    function _safeTransfer(address from, address to, uint256 tokenId, bytes memory data) internal {
        _transferNFT(from, to, tokenId);
        require(_checkOnTRC721Received(from, to, tokenId, data), "Non TRC721 receiver");
    }
    
    function _updateNFTBalances(address from, address to) internal {
        // This would implement the automatic NFT minting/burning logic
        // based on token balances reaching TOKENS_PER_NFT threshold
        // Left simplified for clarity
    }
    
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _owners[tokenId] != address(0);
    }
    
    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        require(_exists(tokenId), "Token does not exist");
        address tokenOwner = ownerOf(tokenId);
        return (spender == tokenOwner || getApproved(tokenId) == spender || isApprovedForAll(tokenOwner, spender));
    }
    
    function _checkOnTRC721Received(address from, address to, uint256 tokenId, bytes memory data) internal returns (bool) {
        if (!isContract(to)) {
            return true;
        }
        
        bytes4 retval = ITRC721Receiver(to).onTRC721Received(msg.sender, from, tokenId, data);
        return (retval == ITRC721Receiver.onTRC721Received.selector);
    }
    
    // Utility functions
    function isContract(address account) internal view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(account)
        }
        return size > 0;
    }
    
    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
    
    // View functions for artifact data
    function getArtifact(uint256 artifactId) external view returns (
        string memory lotNumber,
        string memory title,
        string memory titleChinese,
        string memory dynasty,
        uint256 currentBid,
        uint256 bidCount,
        uint256 endTime,
        bool active
    ) {
        Artifact memory artifact = artifacts[artifactId];
        return (
            artifact.lotNumber,
            artifact.title,
            artifact.titleChinese,
            artifact.dynasty,
            artifact.currentBid,
            artifact.bidCount,
            artifact.endTime,
            artifact.active
        );
    }
    
    function getArtifactBalances(uint256 artifactId, address user) external view returns (uint256) {
        return artifactBalances[artifactId][user];
    }
}

// Interface for TRC721 Receiver
interface ITRC721Receiver {
    function onTRC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4);
}
