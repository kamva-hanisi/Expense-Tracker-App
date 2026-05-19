const express = require("express");

const router = express.Router();

const { registerUser } = require("../controllers/authController");

// REGISTER
router.post("/register", registerUser);

module.exports = router;
