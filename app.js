const express = require("express");
const app = express();
const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const balanceRoute = require("./routes/balanceRoutes");
const accountRoute = require("./routes/accountRoutes");
const cors = require('cors');

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/auth", authRoutes);
app.use("/transactions", transactionRoutes);
app.use("/balance", balanceRoute);
app.use("/user", accountRoute);

module.exports = app;
