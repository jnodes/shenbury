// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title TRC-721 Non-Fungible Token Standard, optional metadata extension
 * @dev See https://tronprotocol.github.io/documentation-en/contracts/trc721/
 */
interface ITRC721Metadata {
    /**
     * @dev Returns the token collection name.
     */
    function name() external view returns (string memory);

    /**
     * @dev Returns the token collection symbol.
     */
    function symbol() external view returns (string memory);

    /**
     * @dev Returns the Uniform Resource Identifier (URI) for `tokenId` token.
     */
    function tokenURI(uint256 tokenId) external view returns (string memory);
}
