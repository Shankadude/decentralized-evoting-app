import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contractConfig";
import "./App.css";

export default function App() {
  const [account, setAccount] = useState("");
  const [adminAddress, setAdminAddress] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVotingOpen, setIsVotingOpen] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [voterStatus, setVoterStatus] = useState({ isRegistered: false, hasVoted: false });
  const [candidateName, setCandidateName] = useState("");
  const [voterAddressInput, setVoterAddressInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState(null);

  const loadBlockchainData = useCallback(async (activeContract, userAddr) => {
    try {
      const [adminAddr, openStatus, candidateList, voterData] = await Promise.all([
        activeContract.admin(),
        activeContract.votingOpen(),
        activeContract.getAllCandidates(),
        activeContract.voters(userAddr)
      ]);

      setAdminAddress(adminAddr);
      setIsAdmin(adminAddr.toLowerCase() === userAddr.toLowerCase());
      setIsVotingOpen(openStatus);
      setCandidates(candidateList);
      setVoterStatus({
        isRegistered: voterData[0],
        hasVoted: voterData[1]
      });
    } catch (err) {
      console.error("Error reading blockchain:", err);
    }
  }, []);

  const initWallet = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_accounts", []);
      if (accounts.length === 0) return;

      const signer = await provider.getSigner();
      const currentAddress = accounts[0];

      setAccount(currentAddress);
      const instance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      setContract(instance);

      await loadBlockchainData(instance, currentAddress);
    } catch (err) {
      console.error("Auto-connect failed:", err);
    }
  }, [loadBlockchainData]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const currentAddress = accounts[0];

      setAccount(currentAddress);
      const instance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      setContract(instance);

      await loadBlockchainData(instance, currentAddress);
    } catch (err) {
      console.error(err);
      alert(err.message || "Wallet connection failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initWallet();

    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        initWallet();
      } else {
        setAccount("");
        setContract(null);
        setIsAdmin(false);
        setCandidates([]);
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [initWallet]);

  const handleVote = async (id) => {
    if (!contract) return;
    try {
      setLoading(true);
      const tx = await contract.castVote(id);
      await tx.wait();
      alert("Vote recorded on-chain!");
      await loadBlockchainData(contract, account);
    } catch (err) {
      alert(err.reason || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!candidateName.trim() || !contract) return;
    try {
      setLoading(true);
      const tx = await contract.addCandidate(candidateName.trim());
      await tx.wait();
      setCandidateName("");
      alert("Candidate registered!");
      await loadBlockchainData(contract, account);
    } catch (err) {
      alert(err.reason || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterVoter = async (e) => {
    e.preventDefault();
    if (!ethers.isAddress(voterAddressInput.trim()) || !contract) {
      return alert("Invalid address");
    }
    try {
      setLoading(true);
      const tx = await contract.registerVoter(voterAddressInput.trim());
      await tx.wait();
      setVoterAddressInput("");
      alert("Voter whitelisted!");
      await loadBlockchainData(contract, account);
    } catch (err) {
      alert(err.reason || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVoting = async (status) => {
    if (!contract) return;
    try {
      setLoading(true);
      const tx = await contract.toggleVoting(status);
      await tx.wait();
      await loadBlockchainData(contract, account);
    } catch (err) {
      alert(err.reason || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Decentralized E-Voting System</h2>

      <div className="card">
        {!account ? (
          <button onClick={connectWallet} disabled={loading}>
            {loading ? "Connecting..." : "Connect MetaMask"}
          </button>
        ) : (
          <div>
            <p><strong>Connected Account:</strong> <span className="mono">{account}</span></p>
            <p><strong>Contract Admin:</strong> <span className="mono">{adminAddress || "Fetching..."}</span></p>
            <p>
              <strong>Election Status:</strong>{" "}
              <span className={`badge ${isVotingOpen ? "open" : "closed"}`}>
                {isVotingOpen ? "OPEN" : "CLOSED"}
              </span>
            </p>
            <p>
              <strong>Voter Authorization:</strong>{" "}
              {voterStatus.isRegistered ? (
                voterStatus.hasVoted ? (
                  <span className="text-muted">Already Voted</span>
                ) : (
                  <span className="text-success">Authorized to Vote</span>
                )
              ) : (
                <span className="text-danger">Not Authorized</span>
              )}
            </p>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Candidates</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Vote Count</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {candidates.length === 0 ? (
              <tr><td colSpan="4">No candidates registered yet.</td></tr>
            ) : (
              candidates.map((c) => (
                <tr key={c.id.toString()}>
                  <td>{c.id.toString()}</td>
                  <td>{c.name}</td>
                  <td>{c.voteCount.toString()}</td>
                  <td>
                    <button
                      onClick={() => handleVote(c.id)}
                      disabled={!isVotingOpen || !voterStatus.isRegistered || voterStatus.hasVoted || loading}
                    >
                      Vote
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isAdmin && (
        <div className="card">
          <h3>Admin Control Center</h3>
          <form onSubmit={handleAddCandidate} className="form-group">
            <input
              type="text"
              placeholder="Candidate Name"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={loading}>Add Candidate</button>
          </form>

          <form onSubmit={handleRegisterVoter} className="form-group">
            <input
              type="text"
              placeholder="0x... Voter Address"
              value={voterAddressInput}
              onChange={(e) => setVoterAddressInput(e.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={loading}>Authorize Voter</button>
          </form>

          <div className="toggle-actions">
            <button onClick={() => handleToggleVoting(true)} disabled={loading || isVotingOpen}>
              Open Election
            </button>
            <button onClick={() => handleToggleVoting(false)} className="btn-danger" disabled={loading || !isVotingOpen}>
              Close Election
            </button>
          </div>
        </div>
      )}
    </div>
  );
}