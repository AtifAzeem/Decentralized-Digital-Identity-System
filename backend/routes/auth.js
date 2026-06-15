//THIS IS AUTH.JS
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { generateKey, encrypt, decrypt } = require("../services/encryption");
const { uploadToIPFS } = require("../services/ipfs");
const crypto = require("crypto");
const axios = require("axios");
const { contract, MAIN, MEDICAL, TRIP } = require("../services/blockchain");


// 🔹 Type Mapping
const typeMap = { MAIN, MEDICAL, TRIP };

// 🔹 Helper: fetch + decrypt
async function fetchAndDecrypt(userId, cid) {
  const user = await User.findOne({ userId });
  if (!user) throw new Error("User not found");

  const key = Buffer.from(user.aesKey, "hex");

  const res = await axios.get(
    `https://gateway.pinata.cloud/ipfs/${cid}`
  );

  const encrypted = res.data;

  return decrypt(
    encrypted.encryptedData,
    key,
    encrypted.iv
  );
}

// 🔐 SIGNUP (MAIN DATA)
router.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const userId = crypto.randomUUID();
    const aesKey = generateKey();

    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    await User.create({
      username,
      password: hashedPassword,
      userId,
      aesKey: aesKey.toString("hex")
    });

    res.json({ userId });

  } catch (err) {
    console.log("Signup Error:", err);
    res.status(500).json({ error: "Signup failed" });
  }
});

// 🔐 LOGIN
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Missing credentials" });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    if (hashedPassword !== user.password) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // ✅ Return userId
    res.json({
      message: "Login successful",
      userId: user.userId
    });

  } catch (err) {
    console.log("Login Error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// ➕ ADD MEDICAL / TRIP DATA
router.post("/addData", async (req, res) => {
  try {
    const { userId, type, data } = req.body;

    if (!userId || !type || !data) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!typeMap[type]) {
      return res.status(400).json({ error: "Invalid type" });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const key = Buffer.from(user.aesKey, "hex");

    // 🔹 Encrypt
    const encrypted = encrypt(data, key);

    // 🔹 Upload to IPFS
    const cid = await uploadToIPFS(encrypted);

    // 🔹 Store on blockchain
    const tx = await contract.setIdentityCID(userId, typeMap[type], cid);
    await tx.wait();

    res.json({
      message: `${type} data added`,
      cid,
      txHash: tx.hash
    });

  } catch (err) {
    console.log("AddData Error:", err);
    res.status(500).json({ error: "Failed to add data" });
  }
});



// 🔓 FETCH DATA (MAIN / MEDICAL / TRIP)
router.post("/getData", async (req, res) => {
  try {
    const { userId, type = "MAIN" } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    if (!typeMap[type]) {
      return res.status(400).json({ error: "Invalid type" });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 🔹 Get CID from blockchain (SAFE)
    let cid;
    try {
      const result = await contract.getIdentityRecord(userId, typeMap[type]);
      cid = result[0];
    } catch (err) {
      return res.status(404).json({ error: "No data found on blockchain" });
    }

    // 🔹 Fetch from IPFS
    let encrypted;
    try {
      const ipfsRes = await axios.get(
        `https://gateway.pinata.cloud/ipfs/${cid}`
      );
      encrypted = ipfsRes.data;
    } catch (err) {
      return res.status(500).json({ error: "Failed to fetch from IPFS" });
    }

    const key = Buffer.from(user.aesKey, "hex");

    // 🔹 Decrypt
    const decryptedData = decrypt(
      encrypted.encryptedData,
      key,
      encrypted.iv
    );

    res.json({
      type,
      data: decryptedData,
      cid
    });

  } catch (err) {
    console.log("GetData Error:", err);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

router.post("/police", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId required" });
    }

    let mainData = null;
    let tripData = null;

    // 🔹 MAIN
    try {
      const main = await contract.getIdentityRecord(userId, MAIN);
      mainData = await fetchAndDecrypt(userId, main[0]);
    } catch (err) {
      console.log("No MAIN data");
    }

    // 🔹 TRIP
    try {
      const trip = await contract.getIdentityRecord(userId, TRIP);
      tripData = await fetchAndDecrypt(userId, trip[0]);
    } catch (err) {
      console.log("No TRIP data");
    }

    res.json({
      main: mainData,
      trip: tripData
    });

  } catch (err) {
    console.log("Police Route Error:", err);
    res.status(500).json({ error: "Failed to fetch police data" });
  }
});

router.post("/medical", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId required" });
    }

    let mainData = null;
    let medicalData = null;

    // 🔹 MAIN
    try {
      const main = await contract.getIdentityRecord(userId, MAIN);
      mainData = await fetchAndDecrypt(userId, main[0]);
    } catch (err) {
      console.log("No MAIN data");
    }

    // 🔹 MEDICAL
    try {
      const medical = await contract.getIdentityRecord(userId, MEDICAL);
      medicalData = await fetchAndDecrypt(userId, medical[0]);
    } catch (err) {
      console.log("No MEDICAL data");
    }

    res.json({
      main: mainData,
      medical: medicalData
    });

  } catch (err) {
    console.log("Medical Route Error:", err);
    res.status(500).json({ error: "Failed to fetch medical data" });
  }
});

module.exports = router;