const express = require("express");
const { setUpSwagger } = require("./swagger");
const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const balanceRoute = require("./routes/balanceRoutes");
const accountRoute = require("./routes/accountRoutes");
const webhookRoute = require("./routes/webhookRoutes");
const verificationRoutes = require("./routes/verificationRoutes");
const cors = require('cors');



const app = express();



app.use(cors());
app.use("/webhook", webhookRoute);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/auth", authRoutes);
app.use("/transactions", transactionRoutes);
app.use("/balance", balanceRoute);
app.use("/user", accountRoute);
app.use("/verification", verificationRoutes);



setUpSwagger(app)



module.exports = app;
