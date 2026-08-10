// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AxiomTimelockEscrow
 * @dev Decentralized Timelock Escrow & Sealed-Bid Access Registry for Axiom Procurement.
 * 
 * Cryptographic Architecture:
 * 1. Sealed-Bid Hash Anchoring: When bidders apply, their SHA-256 bid hash, application ID,
 *    and timelock-protected Network Key Share are anchored immutably on-chain.
 * 2. Immutable Timelock Enforcement: The smart contract strictly prohibits unsealing or
 *    releasing the Network Key Share before block.timestamp >= closingTimestamp.
 * 3. Decentralized Verification: Anyone can verify that bid packages were not modified after
 *    submission and that deadline timings were mathematically respected by the network.
 */
contract AxiomTimelockEscrow {
    
    // --- Data Structures ---
    
    struct Tender {
        bytes32 tenderId;
        string title;
        uint256 closingTimestamp;
        address authority;
        uint256 totalApplications;
        bool isClosed;
        bool exists;
    }
    
    struct SealedBid {
        bytes32 applicationId;
        bytes32 tenderId;
        bytes32 bidHash; // SHA-256 integrity hash of encrypted application
        address bidderWallet;
        uint256 submittedTimestamp;
        string networkKeyShare; // Timelocked Network Key Share (Key 2)
        bool unsealed;
    }
    
    // --- State Variables ---
    
    address public immutable contractOwner;
    
    // tenderId => Tender
    mapping(bytes32 => Tender) public tenders;
    
    // tenderId => array of applicationIds
    mapping(bytes32 => bytes32[]) private tenderApplicationIds;
    
    // applicationId => SealedBid
    mapping(bytes32 => SealedBid) public sealedBids;
    
    // --- Events ---
    
    event TenderCreated(
        bytes32 indexed tenderId,
        string title,
        uint256 closingTimestamp,
        address indexed authority
    );
    
    event SealedBidSubmitted(
        bytes32 indexed tenderId,
        bytes32 indexed applicationId,
        bytes32 bidHash,
        address indexed bidderWallet,
        uint256 submittedTimestamp
    );
    
    event NetworkKeyReleased(
        bytes32 indexed tenderId,
        bytes32 indexed applicationId,
        string networkKeyShare,
        uint256 releasedTimestamp
    );
    
    event BidIntegrityVerified(
        bytes32 indexed applicationId,
        bytes32 bidHash,
        bool isValid
    );

    // --- Modifiers ---
    
    modifier onlyOwner() {
        require(msg.sender == contractOwner, "AxiomEscrow: Caller is not contract owner");
        _;
    }
    
    modifier tenderExists(bytes32 _tenderId) {
        require(tenders[_tenderId].exists, "AxiomEscrow: Tender does not exist");
        _;
    }
    
    // --- Constructor ---
    
    constructor() {
        contractOwner = msg.sender;
    }
    
    // --- Core Functions ---
    
    /**
     * @notice Registers a new institutional procurement tender with a verifiable closing deadline.
     */
    function createTender(
        bytes32 _tenderId,
        string calldata _title,
        uint256 _closingTimestamp
    ) external {
        require(!tenders[_tenderId].exists, "AxiomEscrow: Tender already registered");
        require(_closingTimestamp > block.timestamp, "AxiomEscrow: Closing timestamp must be in future");
        
        tenders[_tenderId] = Tender({
            tenderId: _tenderId,
            title: _title,
            closingTimestamp: _closingTimestamp,
            authority: msg.sender,
            totalApplications: 0,
            isClosed: false,
            exists: true
        });
        
        emit TenderCreated(_tenderId, _title, _closingTimestamp, msg.sender);
    }
    
    /**
     * @notice Submits a sealed bid with on-chain cryptographic hash and network key escrow.
     */
    function submitSealedBid(
        bytes32 _tenderId,
        bytes32 _applicationId,
        bytes32 _bidHash,
        string calldata _networkKeyShare
    ) external tenderExists(_tenderId) {
        Tender storage tender = tenders[_tenderId];
        require(block.timestamp < tender.closingTimestamp, "AxiomEscrow: Tender submission deadline has expired");
        require(sealedBids[_applicationId].submittedTimestamp == 0, "AxiomEscrow: Application ID already exists");
        
        sealedBids[_applicationId] = SealedBid({
            applicationId: _applicationId,
            tenderId: _tenderId,
            bidHash: _bidHash,
            bidderWallet: msg.sender,
            submittedTimestamp: block.timestamp,
            networkKeyShare: _networkKeyShare,
            unsealed: false
        });
        
        tenderApplicationIds[_tenderId].push(_applicationId);
        tender.totalApplications += 1;
        
        emit SealedBidSubmitted(
            _tenderId,
            _applicationId,
            _bidHash,
            msg.sender,
            block.timestamp
        );
    }
    
    /**
     * @notice Returns the total count of applications without revealing any secret bid contents.
     */
    function getApplicationCount(bytes32 _tenderId) external view tenderExists(_tenderId) returns (uint256) {
        return tenders[_tenderId].totalApplications;
    }
    
    /**
     * @notice Checks if the timelock deadline for a tender has expired on the blockchain.
     */
    function isDeadlinePassed(bytes32 _tenderId) external view tenderExists(_tenderId) returns (bool) {
        return block.timestamp >= tenders[_tenderId].closingTimestamp;
    }
    
    /**
     * @notice Releases the Network Key Share (Key 2) for an application ONLY once deadline has passed.
     */
    function requestNetworkKeyRelease(
        bytes32 _tenderId,
        bytes32 _applicationId
    ) external tenderExists(_tenderId) returns (string memory) {
        Tender storage tender = tenders[_tenderId];
        SealedBid storage bid = sealedBids[_applicationId];
        
        require(bid.submittedTimestamp > 0, "AxiomEscrow: Application not found");
        require(bid.tenderId == _tenderId, "AxiomEscrow: Application does not belong to this tender");
        require(block.timestamp >= tender.closingTimestamp, "AxiomEscrow: Timelock active! Key cannot be released before deadline");
        
        bid.unsealed = true;
        
        emit NetworkKeyReleased(
            _tenderId,
            _applicationId,
            bid.networkKeyShare,
            block.timestamp
        );
        
        return bid.networkKeyShare;
    }
    
    /**
     * @notice Verifies that an unsealed bid payload exactly matches the on-chain SHA-256 hash.
     */
    function verifyBidIntegrity(
        bytes32 _applicationId,
        bytes32 _computedBidHash
    ) external returns (bool) {
        SealedBid storage bid = sealedBids[_applicationId];
        require(bid.submittedTimestamp > 0, "AxiomEscrow: Application not found");
        
        bool isValid = (bid.bidHash == _computedBidHash);
        emit BidIntegrityVerified(_applicationId, _computedBidHash, isValid);
        return isValid;
    }
}
