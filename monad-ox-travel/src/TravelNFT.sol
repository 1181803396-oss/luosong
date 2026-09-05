// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract TravelNFT is ERC721, Ownable {
    enum TravelLevel {
        Level1,
        Level2,
        Level3
    }

    mapping(address => TravelLevel) public userMaxLevel;
    mapping(uint256 => TravelLevel) public tokenLevel;
    mapping(address => mapping(TravelLevel => bool)) public hasLevelToken;

    uint256 private _nextTokenId;
    address public minter;

    event NFTMinted(address indexed user, uint256 tokenId, TravelLevel level);
    event MinterUpdated(address indexed previousMinter, address indexed newMinter);

    error OnlyMinter();
    error InvalidMinter();
    error InvalidRecipient();
    error LevelAlreadyCompleted();
    error PreviousLevelRequired();

    constructor() ERC721("TravelNFT", "TRAVEL") Ownable(msg.sender) {}

    modifier onlyMinter() {
        if (msg.sender != minter) revert OnlyMinter();
        _;
    }

    function setMinter(address _minter) external onlyOwner {
        if (_minter == address(0)) revert InvalidMinter();
        emit MinterUpdated(minter, _minter);
        minter = _minter;
    }

    function mintTravelNFT(address to, TravelLevel level) external onlyMinter {
        if (to == address(0)) revert InvalidRecipient();
        if (hasLevelToken[to][level]) revert LevelAlreadyCompleted();
        if (level != TravelLevel.Level1) {
            TravelLevel previousLevel = TravelLevel(uint256(level) - 1);
            if (!hasLevelToken[to][previousLevel]) revert PreviousLevelRequired();
        }

        uint256 tokenId = _nextTokenId++;
        hasLevelToken[to][level] = true;
        tokenLevel[tokenId] = level;
        if (uint256(level) > uint256(userMaxLevel[to]) || level == TravelLevel.Level1) {
            userMaxLevel[to] = level;
        }

        _safeMint(to, tokenId);
        emit NFTMinted(to, tokenId, level);
    }

    function getUserLevel(address user) external view returns (TravelLevel) {
        return userMaxLevel[user];
    }

    function hasCompletedLevel(address user, TravelLevel level) external view returns (bool) {
        return hasLevelToken[user][level];
    }
}

