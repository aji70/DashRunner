// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import { Base64 } from "@openzeppelin/contracts/utils/Base64.sol";

import { IDashRunnerScoreNFT } from "./interfaces/IDashRunnerScoreNFT.sol";

/**
 * @title DashRunnerScoreNFT
 * @notice Soul-style achievement mints: only the configured {DashRunner} game can mint,
 * typically after a new personal high score on that game contract.
 */
contract DashRunnerScoreNFT is ERC721, Ownable, IDashRunnerScoreNFT {
    using Strings for uint256;

    address public game;
    uint256 private _nextTokenId;
    mapping(uint256 tokenId => uint256) public scoreOf;

    error DashRunnerScoreNFT__NotGame();
    error DashRunnerScoreNFT__ZeroAddress();

    constructor(address initialOwner, address game_, string memory name_, string memory symbol_)
        ERC721(name_, symbol_)
        Ownable(initialOwner)
    {
        if (game_ == address(0)) revert DashRunnerScoreNFT__ZeroAddress();
        game = game_;
    }

    function setGame(address game_) external onlyOwner {
        if (game_ == address(0)) revert DashRunnerScoreNFT__ZeroAddress();
        game = game_;
    }

    /// @inheritdoc IDashRunnerScoreNFT
    function mintPersonalBest(address to, uint256 score) external returns (uint256 tokenId) {
        if (msg.sender != game) revert DashRunnerScoreNFT__NotGame();
        tokenId = ++_nextTokenId;
        scoreOf[tokenId] = score;
        _safeMint(to, tokenId);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        uint256 sc = scoreOf[tokenId];
        bytes memory json = abi.encodePacked(
            '{"name":"Dash Runner PB #',
            tokenId.toString(),
            '","description":"Minted for a new personal high score","attributes":[',
            '{"trait_type":"score","value":',
            sc.toString(),
            "}]}"
        );
        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(json)));
    }
}
