// contracts/SharedEV.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.7.4;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// Import Ownable from the OpenZeppelin Contracts library
import "@openzeppelin/contracts/access/Ownable.sol";

contract SharedEV is Ownable, ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct SharedEV { 
        uint256 tokenId;
        string description;
        string tokenURI;
        uint256 checkOutDate;  // 0 - Available
    }
    
    mapping (uint256 => SharedEV) public sharedEVs;

    event createSharedEVEvent(address customer, uint256 tokenId, string tokenURI, uint256 blockTimeStamp);
    event checkOutEvent(address customer, uint256 tokenId, uint256 blockTimeStamp);
    event checkInEvent(address customer, uint256 tokenId, uint256 blockTimeStamp);

    constructor() public ERC721("SharedEV", "SEV") {}

    function createSharedEV(string memory tokenURI) public onlyOwner returns (uint256) {
        _tokenIds.increment();

        uint256 newTokenId = _tokenIds.current();
        _mint(owner(), newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        SharedEV memory newItem;
        newItem = SharedEV(newTokenId,"Google Car",tokenURI,0);
        sharedEVs[newTokenId] = newItem;
        
        emit createSharedEVEvent(owner(), newTokenId, tokenURI, block.timestamp);
        
        return newTokenId;
    }

    function checkOut(address customer, uint256 tokenId) public onlyOwner { 
        require(sharedEVs[tokenId].checkOutDate == 0, "Not Available");
        require(balanceOf(customer) == 0, "Exceed Max Checkout Limit");
        require(ownerOf(tokenId) == msg.sender, "Not Owner");

        safeTransferFrom(ownerOf(tokenId), customer, tokenId);
        sharedEVs[tokenId].checkOutDate = block.timestamp;

        emit checkOutEvent(customer, tokenId, block.timestamp);
    }

    function checkIn(uint256 tokenId) public { 
        require(ownerOf(tokenId) == msg.sender, "Not Owner");
        //require(ownerOf(tokenId) == customer, "Not Owner");

        safeTransferFrom(msg.sender, owner(), tokenId);
        sharedEVs[tokenId].checkOutDate = 0;

        emit checkInEvent(msg.sender, tokenId, block.timestamp);
    }
}