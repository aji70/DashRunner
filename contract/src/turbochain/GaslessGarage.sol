// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Context} from "@openzeppelin/contracts/utils/Context.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC2771Context} from "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";

/**
 * @title GaslessGarage
 * @author TurboChain
 * @notice ERC-721 garage for on-chain car specs (speed, handling, acceleration) with EIP-2771 meta-transaction support.
 * @dev Inherits {ERC2771Context} so a trusted forwarder + relayer can pay gas while `_msgSender()` resolves to the player.
 *      Stat values are `uint8` in the inclusive range 0–100. Ownership uses {Ownable2Step} for safer admin transfers.
 */
contract GaslessGarage is ERC721, ERC2771Context, Ownable2Step {
    /// @notice Maximum inclusive value for any telemetry stat stored on-chain.
    uint8 public constant STAT_MAX = 100;

    /// @notice Maximum length (UTF-8 bytes) allowed for a car display name.
    uint256 public constant MAX_NAME_BYTES = 64;

    /**
     * @notice On-chain performance and presentation data for a minted vehicle.
     * @param speed Top speed score 0–100 (inclusive).
     * @param handling Cornering / grip score 0–100 (inclusive).
     * @param acceleration Launch / throttle score 0–100 (inclusive).
     * @param tier Derived badge tier 0–255; recomputed whenever stats change.
     */
    struct CarSpecs {
        uint8 speed;
        uint8 handling;
        uint8 acceleration;
        uint8 tier;
    }

    /// @dev Monotonic token id counter; first minted id is 1 (0 is invalid in ERC-721).
    uint256 private _nextTokenId;

    /// @dev Token id to immutable on-chain stats snapshot.
    mapping(uint256 tokenId => CarSpecs) private _specs;

    /// @dev Token id to UTF-8 car name bytes length capped by {MAX_NAME_BYTES}.
    mapping(uint256 tokenId => string) private _names;

    /// @dev Base URI segment used by {tokenURI}; owner may rotate hosting without migrating tokens.
    string private _baseTokenURI;

    /**
     * @notice Emitted when the garage mints a new vehicle to `to`.
     * @param to Recipient of the ERC-721 mint.
     * @param tokenId Newly assigned token identifier.
     * @param name Initial display name.
     * @param speed Initial speed stat.
     * @param handling Initial handling stat.
     * @param acceleration Initial acceleration stat.
     * @param tier Initial derived tier badge.
     */
    event CarMinted(
        address indexed to,
        uint256 indexed tokenId,
        string name,
        uint8 speed,
        uint8 handling,
        uint8 acceleration,
        uint8 tier
    );

    /**
     * @notice Emitted when a car's on-chain stats are replaced (upgrade or tuning).
     * @param owner The ERC-2771 aware owner (`_msgSender()` at time of write).
     * @param tokenId Vehicle being updated.
     * @param speed New speed stat.
     * @param handling New handling stat.
     * @param acceleration New acceleration stat.
     * @param tier Recomputed tier after the update.
     */
    event StatsUpgraded(
        address indexed owner,
        uint256 indexed tokenId,
        uint8 speed,
        uint8 handling,
        uint8 acceleration,
        uint8 tier
    );

    /**
     * @notice Emitted when a vehicle display name changes.
     * @param owner The `_msgSender()` authorized to rename the car (must hold the NFT).
     * @param tokenId Vehicle being renamed.
     * @param newName Replacement UTF-8 string (length bounded).
     */
    event CarRenamed(address indexed owner, uint256 indexed tokenId, string newName);

    /// @dev Reverts when a stat is strictly greater than {STAT_MAX}.
    error StatOutOfRange(uint8 value);

    /// @dev Reverts when a UTF-8 name exceeds {MAX_NAME_BYTES}.
    error NameTooLong(uint256 length);

    /**
     * @notice Deploys the collection, wires the trusted EIP-2771 forwarder, and sets the admin owner.
     * @param name_ ERC-721 collection name (e.g. "TurboChain Garage").
     * @param symbol_ ERC-721 ticker symbol (e.g. "TCAR").
     * @param trustedForwarder_ Address of the EIP-2771 forwarder trusted to append calldata suffixes.
     * @param initialOwner_ Address receiving {Ownable} powers (mint, URI rotation).
     */
    constructor(
        string memory name_,
        string memory symbol_,
        address trustedForwarder_,
        address initialOwner_
    ) ERC721(name_, symbol_) ERC2771Context(trustedForwarder_) Ownable(initialOwner_) {}

    /**
     * @inheritdoc ERC721
     * @notice Concatenates the owner-configured base URI with the decimal string `tokenId`.
     * @dev If `_baseTokenURI` is empty, returns the empty string (marketplaces should fall back to on-chain getters).
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        _requireOwned(tokenId);
        string memory base = _baseTokenURI;
        if (bytes(base).length == 0) {
            return "";
        }
        return string.concat(base, Strings.toString(tokenId));
    }

    /**
     * @inheritdoc ERC721
     * @notice ERC-165 introspection for ERC-721 and inherited interfaces.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @notice Mints a new vehicle to `to` with initial stats and name. Callable only by the contract owner (game treasury).
     * @param to Recipient wallet; may differ from `_msgSender()` for custodial or promo mints.
     * @param name_ UTF-8 display name; length must not exceed {MAX_NAME_BYTES}.
     * @param speed Initial speed 0–100 inclusive.
     * @param handling Initial handling 0–100 inclusive.
     * @param acceleration Initial acceleration 0–100 inclusive.
     * @return tokenId Newly minted ERC-721 identifier.
     */
    function mintNew(
        address to,
        string calldata name_,
        uint8 speed,
        uint8 handling,
        uint8 acceleration
    ) external onlyOwner returns (uint256 tokenId) {
        _validateName(name_);
        _validateStats(speed, handling, acceleration);
        tokenId = ++_nextTokenId;
        uint8 tier = _computeTier(speed, handling, acceleration);
        _specs[tokenId] = CarSpecs({speed: speed, handling: handling, acceleration: acceleration, tier: tier});
        _names[tokenId] = name_;
        _safeMint(to, tokenId);
        emit CarMinted(to, tokenId, name_, speed, handling, acceleration, tier);
    }

    /**
     * @notice Replaces on-chain stats for `tokenId` if `_msgSender()` owns the NFT (supports gasless relay via EIP-2771).
     * @param tokenId Vehicle to upgrade.
     * @param speed New speed 0–100 inclusive.
     * @param handling New handling 0–100 inclusive.
     * @param acceleration New acceleration 0–100 inclusive.
     */
    function upgradeStats(uint256 tokenId, uint8 speed, uint8 handling, uint8 acceleration) external {
        address sender = _msgSender();
        if (ownerOf(tokenId) != sender) {
            revert ERC721InsufficientApproval(sender, tokenId);
        }
        _validateStats(speed, handling, acceleration);
        uint8 tier = _computeTier(speed, handling, acceleration);
        _specs[tokenId] = CarSpecs({speed: speed, handling: handling, acceleration: acceleration, tier: tier});
        emit StatsUpgraded(sender, tokenId, speed, handling, acceleration, tier);
    }

    /**
     * @notice Updates the UTF-8 display name for `tokenId` for `_msgSender()` if they own the NFT.
     * @param tokenId Vehicle to rename.
     * @param newName Replacement name bounded by {MAX_NAME_BYTES}.
     */
    function renameCar(uint256 tokenId, string calldata newName) external {
        address sender = _msgSender();
        if (ownerOf(tokenId) != sender) {
            revert ERC721InsufficientApproval(sender, tokenId);
        }
        _validateName(newName);
        _names[tokenId] = newName;
        emit CarRenamed(sender, tokenId, newName);
    }

    /**
     * @notice Rotates the off-chain metadata base URI used by {tokenURI}.
     * @param newBase URI prefix; should end with `/` if hosting per-id JSON files.
     */
    function setBaseURI(string calldata newBase) external onlyOwner {
        _baseTokenURI = newBase;
    }

    /**
     * @notice Reads immutable on-chain stats for `tokenId`.
     * @param tokenId Vehicle to query.
     * @return specs Full struct including derived tier.
     */
    function getCarSpecs(uint256 tokenId) external view returns (CarSpecs memory specs) {
        _requireOwned(tokenId);
        return _specs[tokenId];
    }

    /**
     * @notice Reads the UTF-8 display name for `tokenId`.
     * @param tokenId Vehicle to query.
     * @return name_ Stored car name.
     */
    function carName(uint256 tokenId) external view returns (string memory name_) {
        _requireOwned(tokenId);
        return _names[tokenId];
    }

    /**
     * @notice Returns the token id that the next successful {mintNew} call will assign.
     * @return nextId Always `_nextTokenId + 1` (first minted car is id `1`).
     */
    function nextTokenId() external view returns (uint256) {
        return _nextTokenId + 1;
    }

    /**
     * @dev Validates all stats are within inclusive 0–{STAT_MAX}.
     */
    function _validateStats(uint8 speed, uint8 handling, uint8 acceleration) private pure {
        if (speed > STAT_MAX) revert StatOutOfRange(speed);
        if (handling > STAT_MAX) revert StatOutOfRange(handling);
        if (acceleration > STAT_MAX) revert StatOutOfRange(acceleration);
    }

    /**
     * @dev Enforces UTF-8 byte length cap for car names.
     */
    function _validateName(string calldata name_) private pure {
        if (bytes(name_).length > MAX_NAME_BYTES) {
            revert NameTooLong(bytes(name_).length);
        }
    }

    /**
     * @dev Maps average stat into a 0–10 tier band used for UI badges.
     */
    function _computeTier(uint8 speed, uint8 handling, uint8 acceleration) private pure returns (uint8) {
        uint256 sum = uint256(speed) + uint256(handling) + uint256(acceleration);
        uint256 avg = sum / 3;
        uint256 tier = avg / 10;
        if (tier > type(uint8).max) {
            return type(uint8).max;
        }
        return uint8(tier);
    }

    /**
     * @inheritdoc Context
     */
    function _msgSender() internal view override(Context, ERC2771Context) returns (address) {
        return ERC2771Context._msgSender();
    }

    /**
     * @inheritdoc Context
     */
    function _msgData() internal view override(Context, ERC2771Context) returns (bytes calldata) {
        return ERC2771Context._msgData();
    }

    /**
     * @inheritdoc Context
     */
    function _contextSuffixLength() internal view override(Context, ERC2771Context) returns (uint256) {
        return ERC2771Context._contextSuffixLength();
    }
}
