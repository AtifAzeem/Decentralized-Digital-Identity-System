//THIS IS APP.JS
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// 👇 CONNECT FIRST, THEN START SERVER
mongoose.connect("mongodb://127.0.0.1:27017/blockchainDB")
.then(() => {
  console.log("MongoDB connected");

  // start server ONLY after DB connects
  app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on port 3000");
});
})
.catch((err) => console.log(err));

// routes
const authRoutes = require("./routes/auth");
app.use("/api", authRoutes);