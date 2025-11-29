require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const app = express();
app.use(
  cors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);
app.use(express.json());
connectDB();
app.use("/api/auth", require("./src/routes/auth"));
app.use("/api/transactions", require("./src/routes/transactions"));
app.use("/api/news", require("./src/routes/news"));
app.use("/api/ai", require("./src/routes/ai"));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on", PORT));
