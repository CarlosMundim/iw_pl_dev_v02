// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title CredentialRegistry
 * @dev Smart contract for managing verified credentials on the blockchain
 * @author iWORKZ Platform
 */
contract CredentialRegistry is Ownable, Pausable, ReentrancyGuard {
    using Counters for Counters.Counter;

    struct Credential {
        bytes32 id;
        address issuer;
        address holder;
        string credentialType;
        bytes32 dataHash;
        string ipfsHash;
        uint256 issuedAt;
        uint256 expiresAt;
        bool revoked;
        uint256 revokedAt;
        string revokedReason;
    }

    struct Issuer {
        string name;
        string organizationType;
        bool authorized;
        uint256 authorizedAt;
        address authorizedBy;
        string publicKey;
        string verificationEndpoint;
    }

    // State variables
    Counters.Counter private _credentialCount;
    
    mapping(bytes32 => Credential) public credentials;
    mapping(address => Issuer) public issuers;
    mapping(address => bytes32[]) public holderCredentials;
    mapping(address => bytes32[]) public issuerCredentials;
    mapping(bytes32 => bool) public credentialExists;
    
    // Events
    event CredentialIssued(
        bytes32 indexed credentialId,
        address indexed issuer,
        address indexed holder,
        string credentialType,
        bytes32 dataHash
    );
    
    event CredentialRevoked(
        bytes32 indexed credentialId,
        address indexed issuer,
        string reason
    );
    
    event IssuerAuthorized(
        address indexed issuer,
        string name,
        address indexed authorizedBy
    );
    
    event IssuerRevoked(
        address indexed issuer,
        address indexed revokedBy
    );

    event CredentialVerified(
        bytes32 indexed credentialId,
        address indexed verifier,
        bool isValid
    );

    // Modifiers
    modifier onlyAuthorizedIssuer() {
        require(issuers[msg.sender].authorized, "Not an authorized issuer");
        _;
    }

    modifier credentialMustExist(bytes32 credentialId) {
        require(credentialExists[credentialId], "Credential does not exist");
        _;
    }

    modifier onlyCredentialIssuer(bytes32 credentialId) {
        require(
            credentials[credentialId].issuer == msg.sender,
            "Only credential issuer can perform this action"
        );
        _;
    }

    constructor() {
        // Authorize contract deployer as first issuer
        issuers[msg.sender] = Issuer({
            name: "iWORKZ Platform",
            organizationType: "platform",
            authorized: true,
            authorizedAt: block.timestamp,
            authorizedBy: msg.sender,
            publicKey: "",
            verificationEndpoint: ""
        });
        
        emit IssuerAuthorized(msg.sender, "iWORKZ Platform", msg.sender);
    }

    /**
     * @dev Issue a new credential
     * @param holder Address of the credential holder
     * @param credentialType Type of credential being issued
     * @param dataHash SHA-256 hash of the credential data
     * @param ipfsHash IPFS hash where credential document is stored
     * @param expiresAt Expiration timestamp (0 for non-expiring)
     * @return credentialId Unique identifier for the credential
     */
    function issueCredential(
        address holder,
        string memory credentialType,
        bytes32 dataHash,
        string memory ipfsHash,
        uint256 expiresAt
    ) external onlyAuthorizedIssuer whenNotPaused nonReentrant returns (bytes32) {
        require(holder != address(0), "Invalid holder address");
        require(bytes(credentialType).length > 0, "Credential type required");
        require(dataHash != bytes32(0), "Data hash required");
        
        // Generate unique credential ID
        _credentialCount.increment();
        bytes32 credentialId = keccak256(
            abi.encodePacked(
                msg.sender,
                holder,
                credentialType,
                dataHash,
                block.timestamp,
                _credentialCount.current()
            )
        );

        // Ensure credential ID is unique
        require(!credentialExists[credentialId], "Credential ID collision");

        // Create credential
        credentials[credentialId] = Credential({
            id: credentialId,
            issuer: msg.sender,
            holder: holder,
            credentialType: credentialType,
            dataHash: dataHash,
            ipfsHash: ipfsHash,
            issuedAt: block.timestamp,
            expiresAt: expiresAt,
            revoked: false,
            revokedAt: 0,
            revokedReason: ""
        });

        // Update mappings
        credentialExists[credentialId] = true;
        holderCredentials[holder].push(credentialId);
        issuerCredentials[msg.sender].push(credentialId);

        emit CredentialIssued(
            credentialId,
            msg.sender,
            holder,
            credentialType,
            dataHash
        );

        return credentialId;
    }

    /**
     * @dev Verify if a credential is valid
     * @param credentialId The credential to verify
     * @return isValid True if credential is valid and not revoked/expired
     */
    function verifyCredential(bytes32 credentialId) 
        external 
        view 
        credentialMustExist(credentialId)
        returns (bool isValid) 
    {
        Credential memory cred = credentials[credentialId];
        
        // Check if revoked
        if (cred.revoked) {
            return false;
        }
        
        // Check if expired (0 means no expiration)
        if (cred.expiresAt > 0 && block.timestamp > cred.expiresAt) {
            return false;
        }
        
        // Check if issuer is still authorized
        if (!issuers[cred.issuer].authorized) {
            return false;
        }
        
        return true;
    }

    /**
     * @dev Get full credential details
     * @param credentialId The credential to retrieve
     * @return The credential struct
     */
    function getCredential(bytes32 credentialId)
        external
        view
        credentialMustExist(credentialId)
        returns (Credential memory)
    {
        return credentials[credentialId];
    }

    /**
     * @dev Revoke a credential
     * @param credentialId The credential to revoke
     * @param reason Reason for revocation
     */
    function revokeCredential(bytes32 credentialId, string memory reason)
        external
        credentialMustExist(credentialId)
        onlyCredentialIssuer(credentialId)
        whenNotPaused
    {
        require(!credentials[credentialId].revoked, "Already revoked");
        require(bytes(reason).length > 0, "Revocation reason required");

        credentials[credentialId].revoked = true;
        credentials[credentialId].revokedAt = block.timestamp;
        credentials[credentialId].revokedReason = reason;

        emit CredentialRevoked(credentialId, msg.sender, reason);
    }

    /**
     * @dev Authorize a new issuer
     * @param issuerAddress Address of the issuer to authorize
     * @param name Name of the issuing organization
     * @param organizationType Type of organization (educational, professional, etc.)
     * @param publicKey Public key for verification
     * @param verificationEndpoint API endpoint for verification
     */
    function authorizeIssuer(
        address issuerAddress,
        string memory name,
        string memory organizationType,
        string memory publicKey,
        string memory verificationEndpoint
    ) external onlyOwner {
        require(issuerAddress != address(0), "Invalid issuer address");
        require(bytes(name).length > 0, "Issuer name required");
        require(!issuers[issuerAddress].authorized, "Already authorized");

        issuers[issuerAddress] = Issuer({
            name: name,
            organizationType: organizationType,
            authorized: true,
            authorizedAt: block.timestamp,
            authorizedBy: msg.sender,
            publicKey: publicKey,
            verificationEndpoint: verificationEndpoint
        });

        emit IssuerAuthorized(issuerAddress, name, msg.sender);
    }

    /**
     * @dev Revoke issuer authorization
     * @param issuerAddress Address of the issuer to revoke
     */
    function revokeIssuer(address issuerAddress) external onlyOwner {
        require(issuers[issuerAddress].authorized, "Not authorized");
        require(issuerAddress != owner(), "Cannot revoke contract owner");

        issuers[issuerAddress].authorized = false;
        
        emit IssuerRevoked(issuerAddress, msg.sender);
    }

    /**
     * @dev Check if an address is an authorized issuer
     * @param issuerAddress Address to check
     * @return True if authorized
     */
    function isAuthorizedIssuer(address issuerAddress) external view returns (bool) {
        return issuers[issuerAddress].authorized;
    }

    /**
     * @dev Get all credentials for a holder
     * @param holder Address of the credential holder
     * @return Array of credential IDs
     */
    function getHolderCredentials(address holder) external view returns (bytes32[] memory) {
        return holderCredentials[holder];
    }

    /**
     * @dev Get all credentials issued by an issuer
     * @param issuer Address of the issuer
     * @return Array of credential IDs
     */
    function getIssuerCredentials(address issuer) external view returns (bytes32[] memory) {
        return issuerCredentials[issuer];
    }

    /**
     * @dev Get total number of issued credentials
     * @return Total count
     */
    function getTotalCredentials() external view returns (uint256) {
        return _credentialCount.current();
    }

    /**
     * @dev Get issuer information
     * @param issuerAddress Address of the issuer
     * @return Issuer struct
     */
    function getIssuer(address issuerAddress) external view returns (Issuer memory) {
        return issuers[issuerAddress];
    }

    /**
     * @dev Verify credential with event emission for audit trail
     * @param credentialId The credential to verify
     * @return isValid True if credential is valid
     */
    function verifyCredentialWithAudit(bytes32 credentialId)
        external
        credentialMustExist(credentialId)
        returns (bool isValid)
    {
        isValid = this.verifyCredential(credentialId);
        
        emit CredentialVerified(credentialId, msg.sender, isValid);
        
        return isValid;
    }

    /**
     * @dev Emergency pause function
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause function
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Batch verify multiple credentials
     * @param credentialIds Array of credential IDs to verify
     * @return results Array of verification results
     */
    function batchVerifyCredentials(bytes32[] memory credentialIds)
        external
        view
        returns (bool[] memory results)
    {
        results = new bool[](credentialIds.length);
        
        for (uint256 i = 0; i < credentialIds.length; i++) {
            if (credentialExists[credentialIds[i]]) {
                results[i] = this.verifyCredential(credentialIds[i]);
            } else {
                results[i] = false;
            }
        }
        
        return results;
    }
}