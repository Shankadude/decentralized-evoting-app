export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const CONTRACT_ABI = [
  "function admin() view returns (address)",
  "function votingOpen() view returns (bool)",
  "function candidatesCount() view returns (uint256)",
  "function getAllCandidates() view returns (tuple(uint256 id, string name, uint256 voteCount)[])",
  "function addCandidate(string memory _name)",
  "function registerVoter(address _voter)",
  "function toggleVoting(bool _isOpen)",
  "function castVote(uint256 _candidateId)",
  "function voters(address) view returns (bool isRegistered, bool hasVoted, uint256 votedCandidateId)"
];