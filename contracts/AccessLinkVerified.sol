// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title AccessLink Verified Records
 * @dev Store verified accessibility records on-chain for permanent trust
 */
contract AccessLinkVerified {
    struct VerifiedRecord {
        bytes32 propertyHash;
        string location;
        uint256 timestamp;
        address verifiedBy;
        bool verified;
    }

    mapping(bytes32 => VerifiedRecord) public records;
    bytes32[] public recordIds;

    event RecordVerified(
        bytes32 indexed recordId,
        string location,
        uint256 timestamp,
        address indexed verifiedBy
    );

    event RecordSubmitted(
        bytes32 indexed recordId,
        string location,
        uint256 timestamp
    );

    /**
     * @dev Submit an accessibility report for verification
     */
    function submitRecord(
        bytes32 propertyHash,
        string memory location
    ) public returns (bytes32) {
        bytes32 recordId = keccak256(abi.encodePacked(propertyHash, block.timestamp, msg.sender));
        
        records[recordId] = VerifiedRecord({
            propertyHash: propertyHash,
            location: location,
            timestamp: block.timestamp,
            verifiedBy: address(0),
            verified: false
        });

        recordIds.push(recordId);

        emit RecordSubmitted(recordId, location, block.timestamp);
        return recordId;
    }

    /**
     * @dev Verify a submitted record (called by community verifiers or admins)
     */
    function verifyRecord(bytes32 recordId) public {
        require(records[recordId].propertyHash != bytes32(0), "Record not found");
        require(!records[recordId].verified, "Already verified");

        records[recordId].verified = true;
        records[recordId].verifiedBy = msg.sender;

        emit RecordVerified(
            recordId,
            records[recordId].location,
            records[recordId].timestamp,
            msg.sender
        );
    }

    /**
     * @dev Get a record by ID
     */
    function getRecord(bytes32 recordId) public view returns (VerifiedRecord memory) {
        return records[recordId];
    }

    /**
     * @dev Get total number of records
     */
    function getRecordCount() public view returns (uint256) {
        return recordIds.length;
    }

    /**
     * @dev Get record ID by index
     */
    function getRecordIdByIndex(uint256 index) public view returns (bytes32) {
        require(index < recordIds.length, "Index out of bounds");
        return recordIds[index];
    }
}
