// Call packages
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Port used from .env
const PORT = process.env.PORT;

// Call DB connection
const connectDB = require("./dbinit");
connectDB();

// Call user routes
const userRoutes = require("./routes/user");

// Necessary middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// The root route
app.get("/", (req, res) => {
  res.send("Welcome to our TeamUp App");
});

// User routes
app.use("/user", userRoutes);

// Listening to port
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
