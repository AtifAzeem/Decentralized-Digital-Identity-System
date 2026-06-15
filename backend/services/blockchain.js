//THIS IS BLOCKCHAIN.JS
const { ethers } = require("ethers");
require("dotenv").config();

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// 🔹 paste your ABI here (array)
const abi = [
  "function setIdentityCID(string userId, bytes32 dataType, string cid)",
  "function getIdentityRecord(string userId, bytes32 dataType) view returns (string cid, uint256 updatedAt, uint256 version)"
];

const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, wallet);

// constants
const MAIN = ethers.keccak256(ethers.toUtf8Bytes("main"));
const MEDICAL = ethers.keccak256(ethers.toUtf8Bytes("medical"));
const TRIP = ethers.keccak256(ethers.toUtf8Bytes("trip"));

module.exports = { contract, MAIN, MEDICAL, TRIP };