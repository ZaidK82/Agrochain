// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract AdvisoryRegistry {
	enum Status {
		Active,
		Revoked,
		Expired
	}

	struct Advisory {
		bytes32 contentHash;      // Hash of canonical JSON
		uint256 version;
		address source;           // Institution
		address expert;           // Reviewer
		Status status;
		uint256 issuedAt;
		uint256 expiresAt;
	}

	// advisoryId => version => Advisory
	mapping(bytes32 => mapping(uint256 => Advisory)) private advisories;

	// advisoryId => latest version
	mapping(bytes32 => uint256) public latestVersion;

	event AdvisoryIssued(
		bytes32 indexed advisoryId,
		uint256 version,
		bytes32 contentHash,
		address indexed source,
		address indexed expert,
		uint256 issuedAt,
		uint256 expiresAt
	);

	event AdvisoryRevoked(
		bytes32 indexed advisoryId,
		uint256 version,
		uint256 revokedAt
	);

	modifier onlySource(address source) {
		require(msg.sender == source, "Not authorized source");
		_;
	}

	function issueAdvisory(
		bytes32 advisoryId,
		bytes32 contentHash,
		address source,
		address expert,
		uint256 expiresAt
	) external onlySource(source) {
		uint256 version = latestVersion[advisoryId] + 1;

		advisories[advisoryId][version] = Advisory({
			contentHash: contentHash,
			version: version,
			source: source,
			expert: expert,
			status: Status.Active,
			issuedAt: block.timestamp,
			expiresAt: expiresAt
		});

		latestVersion[advisoryId] = version;

		emit AdvisoryIssued(
			advisoryId,
			version,
			contentHash,
			source,
			expert,
			block.timestamp,
			expiresAt
		);
	}

	function revokeAdvisory(bytes32 advisoryId) external {
		uint256 version = latestVersion[advisoryId];
		Advisory storage adv = advisories[advisoryId][version];

		require(msg.sender == adv.source, "Only source can revoke");
		require(adv.status == Status.Active, "Not active");

		adv.status = Status.Revoked;

		emit AdvisoryRevoked(advisoryId, version, block.timestamp);
	}

	function getAdvisory(
		bytes32 advisoryId,
		uint256 version
	) external view returns (Advisory memory) {
		return advisories[advisoryId][version];
	}
}
