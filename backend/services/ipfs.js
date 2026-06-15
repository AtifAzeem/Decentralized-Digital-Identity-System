//THIS IS IPFS.JS
const axios = require("axios");

async function uploadToIPFS(data) {
  const res = await axios.post(
    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    data,
    {
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
        "Content-Type": "application/json",
      },
    }
  );

  return res.data.IpfsHash;
}

module.exports = { uploadToIPFS };