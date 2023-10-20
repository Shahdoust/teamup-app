// Call packages
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
// app.use(express.urlencoded({ extended: true }));

const user = require("./routes/user");

// Port used from .env
const PORT = process.env.PORT;

// Call DB connection
const connectDB = require("./dbinit");
connectDB();

// Necessary middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// All sub-routes
app.use("/user", user);

// The root route
app.use("/", (req, res) => {
  res.send("Welcome to our TeamUp App");
});

// Listening to port
app.listen(PORT),
  () => {
    console.log(`Server running on http://localhost:${PORT}`);
  };
