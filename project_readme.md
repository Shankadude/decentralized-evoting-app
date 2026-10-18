# Decentralized E-Voting System (dApp)

A secure, transparent, and tamper-resistant decentralized voting application built using **Solidity**, **Hardhat**, **Ethers.js (v6)**, and **React + Vite**. The system implements role-based access control to allow an administrator to manage candidates, whitelist authorized voters, open/close elections, and let verified voters cast immutable votes on a local Ethereum network.

---

## Architecture Overview

```text
evoting-dapp/
├── contracts/
│   └── Voting.sol           # Solidity Smart Contract
├── scripts/
│   └── deploy.js            # Hardhat deployment script
├── hardhat.config.js        # Hardhat configuration (local RPC port 8545, chainId 31337)
├── package.json             # Root dependencies (Hardhat, Toolbox, OpenZeppelin)
└── client/                  # Frontend Application
    ├── src/
    │   ├── App.jsx          # React component (Wallet connection, Admin panel, Ballots)
    │   ├── App.css          # UI styles
    │   ├── contractConfig.js# Deployed contract address & ABI interface
    │   └── main.jsx         # React DOM entrypoint
    ├── index.html
    ├── package.json         # Client dependencies (React, Vite, Ethers v6)
    └── vite.config.js
```

---

## Features

- **Role-Based Access Control (RBAC):** Only the deployer address inherits the `admin` role with permissions to add candidates, whitelist voters, and toggle voting states.
- **Double-Voting Prevention:** Mapping checks (`hasVoted`) ensure each authorized address can only cast a single vote.
- **State Machine Protection:** The `duringVoting` modifier prevents votes from being cast before an election starts or after it is closed.
- **Reactive UI:** Automatic wallet account-switching and network-change detection via MetaMask events.

---

## Prerequisites

Before setting up the project, make sure you have the following installed on your machine:

1. **Node.js** (v18.0.0 or higher) - [Download Node.js](https://nodejs.org/)
2. **npm** (bundled with Node.js)
3. **MetaMask Browser Extension** - [Download MetaMask](https://metamask.io/)
4. **Git** - [Download Git](https://git-scm.com/)

---

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Shankadude/decentralized-evoting-app.git
cd decentralized-evoting-app
```

### 2. Install Dependencies

Install root backend dependencies:
```bash
npm install
```

Install client frontend dependencies:
```bash
cd client
npm install
cd ..
```

---

## Running the Application Locally

### Step 1: Start the Local Hardhat Blockchain Node

In your first terminal window, start Hardhat's local JSON-RPC node:

```bash
npx hardhat node
```

> **Note:** Keep this terminal open. It will launch an Ethereum RPC node on `http://127.0.0.1:8545/` with Chain ID `31337` and provide 20 pre-funded test accounts with 10,000 ETH each.

### Step 2: Deploy the Smart Contract

Open a **second terminal** in the project root and deploy the contract to your running node:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

The terminal will output:
```text
==================================================
DEPLOYER / ADMIN ADDRESS: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
VOTING CONTRACT ADDRESS : 0x5FbDB2315678afecb367f032d93F642f64180aa3
==================================================
```

> If your deployed contract address differs, update `CONTRACT_ADDRESS` inside `client/src/contractConfig.js`.

### Step 3: Configure MetaMask

1. Open **MetaMask** and add a custom network:
   - **Network Name:** `Hardhat Local`
   - **New RPC URL:** `http://127.0.0.1:8545`
   - **Chain ID:** `31337`
   - **Currency Symbol:** `ETH`
2. Import the test accounts using their private keys from the `npx hardhat node` output:
   - **Admin Account (Account #0):**
     `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - **Voter 1 Account (Account #1):**
     `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`

### Step 4: Run the React Development Server

In your second terminal, navigate into `client` and run:

```bash
cd client
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Using the dApp (Walkthrough)

1. **Connect Admin Account:**
   - In MetaMask, select the imported **Admin Account** (`0xf39Fd...`).
   - Click **Connect MetaMask** on the application. The **Admin Control Center** will appear.
2. **Add Candidates:**
   - Enter candidate names (e.g., "Alice", "Bob") and click **Add Candidate**. Confirm each transaction in MetaMask.
3. **Authorize Voters:**
   - Paste Voter 1's public address (`0x70997970C51812dc3A010C7d01b50e0d17dc79C8`) into the **Authorize Voter** field.
   - Click **Authorize Voter** and confirm the transaction.
4. **Open the Election:**
   - Click **Open Election**. The status badge updates to **OPEN**.
5. **Cast a Vote:**
   - Switch your active MetaMask account to **Voter 1** (`0x70997...`).
   - The status badge will show **Authorized to Vote**.
   - Click **Vote** next to your candidate of choice and confirm the transaction in MetaMask.
   - The candidate's vote count will increment on-chain and voter status will update to **Already Voted**.

---

## Smart Contract Specification (`Voting.sol`)

| Function | Access | Description |
| :--- | :--- | :--- |
| `addCandidate(string memory _name)` | `onlyAdmin` | Registers a new candidate for the ballot. |
| `registerVoter(address _voter)` | `onlyAdmin` | Whitelists an address to cast a vote. |
| `toggleVoting(bool _isOpen)` | `onlyAdmin` | Toggles the election between OPEN and CLOSED states. |
| `castVote(uint256 _candidateId)` | `duringVoting` | Casts a single vote for an authorized, unvoted address. |
| `getAllCandidates()` | Public View | Returns an array of all registered candidates with their tallies. |
| `voters(address)` | Public View | Returns registration state, voted boolean, and chosen candidate ID. |

---

## License

This project is licensed under the [MIT License](LICENSE).