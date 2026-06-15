//THIS IS ENCRYPTION.JS
const crypto = require("crypto");

function generateKey() {
  return crypto.randomBytes(32); // AES-256
}

function encrypt(data, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

  let encrypted = cipher.update(JSON.stringify(data), "utf8", "hex");
  encrypted += cipher.final("hex");

  return {
    encryptedData: encrypted,
    iv: iv.toString("hex")
  };
}

function decrypt(encryptedData, key, iv) {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    key,
    Buffer.from(iv, "hex")
  );

  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return JSON.parse(decrypted);
}

module.exports = { generateKey, encrypt, decrypt };