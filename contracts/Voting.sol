// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Voting {
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint256 votedCandidateId;
    }

    address public admin;
    bool public votingOpen;
    uint256 public candidatesCount;

    mapping(uint256 => Candidate) public candidates;
    mapping(address => Voter) public voters;

    event CandidateAdded(uint256 indexed candidateId, string name);
    event VoterRegistered(address indexed voter);
    event VotingStateChanged(bool isOpen);
    event VoteCast(address indexed voter, uint256 indexed candidateId);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Caller is not the admin");
        _;
    }

    modifier duringVoting() {
        require(votingOpen, "Voting is currently closed");
        _;
    }

    constructor() {
        admin = msg.sender;
        votingOpen = false;
    }

    function addCandidate(string calldata _name) external onlyAdmin {
        require(bytes(_name).length > 0, "Candidate name cannot be empty");
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
        emit CandidateAdded(candidatesCount, _name);
    }

    function registerVoter(address _voter) external onlyAdmin {
        require(_voter != address(0), "Invalid address");
        require(!voters[_voter].isRegistered, "Voter already registered");
        voters[_voter].isRegistered = true;
        emit VoterRegistered(_voter);
    }

    function toggleVoting(bool _isOpen) external onlyAdmin {
        votingOpen = _isOpen;
        emit VotingStateChanged(_isOpen);
    }

    function castVote(uint256 _candidateId) external duringVoting {
        Voter storage sender = voters[msg.sender];
        require(sender.isRegistered, "You are not authorized to vote");
        require(!sender.hasVoted, "You have already cast your vote");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID");

        sender.hasVoted = true;
        sender.votedCandidateId = _candidateId;
        candidates[_candidateId].voteCount++;

        emit VoteCast(msg.sender, _candidateId);
    }

    function getAllCandidates() external view returns (Candidate[] memory) {
        Candidate[] memory items = new Candidate[](candidatesCount);
        for (uint256 i = 1; i <= candidatesCount; i++) {
            items[i - 1] = candidates[i];
        }
        return items;
    }
}